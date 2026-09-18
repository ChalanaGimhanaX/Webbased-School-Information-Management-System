// Assigned module owner: IT25101863
package com.sliit.sims.attendance.service;

import com.sliit.sims.attendance.dto.*;
import com.sliit.sims.attendance.model.*;
import com.sliit.sims.attendance.repository.AttendanceEntryRepository;
import com.sliit.sims.attendance.repository.AttendanceRecordRepository;
import com.sliit.sims.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRecordRepository recordRepository;
    private final AttendanceEntryRepository entryRepository;

    @Transactional
    public AttendanceRecordResponse submitAttendance(AttendanceBatchSubmitRequest req) {
        AttendanceRecord record = recordRepository.findByClassIdAndAttendanceDate(req.classId(), req.attendanceDate())
                .orElse(null);

        if (record != null && Boolean.TRUE.equals(record.getIsLocked())) {
            throw new IllegalStateException("Attendance for class " + req.classId() + " on " + req.attendanceDate() + " is finalized and locked");
        }

        if (record == null) {
            record = AttendanceRecord.builder()
                    .classId(req.classId())
                    .teacherId(req.teacherId())
                    .attendanceDate(req.attendanceDate())
                    .academicYear(req.academicYear())
                    .isLocked(false)
                    .build();
            record = recordRepository.save(record);
        } else {
            // Remove previous entries if re-submitting before locking (UC-03 Step 02/Open Issue 03)
            entryRepository.deleteAll(record.getEntries());
            record.getEntries().clear();
            entryRepository.flush();
        }

        AttendanceRecord finalRecord = record;
        List<AttendanceEntry> entries = req.entries().stream()
                .map(e -> AttendanceEntry.builder()
                        .attendanceRecord(finalRecord)
                        .studentId(e.studentId())
                        .status(e.status())
                        .remarks(e.remarks())
                        .build())
                .toList();

        List<AttendanceEntry> savedEntries = entryRepository.saveAll(entries);
        finalRecord.getEntries().addAll(savedEntries);

        return mapToResponse(finalRecord);
    }

    public AttendanceRecordResponse getClassAttendance(Long classId, LocalDate date) {
        AttendanceRecord record = recordRepository.findByClassIdAndAttendanceDate(classId, date)
                .orElseThrow(() -> new ResourceNotFoundException("No attendance recorded for class " + classId + " on " + date));
        return mapToResponse(record);
    }

    public StudentAttendanceSummaryResponse getStudentAttendanceSummary(Long studentId) {
        long total = entryRepository.countByStudentId(studentId);
        long present = entryRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long absent = entryRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);
        long late = entryRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);

        double pct = total > 0 ? ((double) (present + late) / total) * 100.0 : 0.0;
        return new StudentAttendanceSummaryResponse(studentId, total, present, absent, late, Math.round(pct * 100.0) / 100.0);
    }

    @Transactional
    public void lockAttendance(Long recordId) {
        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + recordId));
        record.setIsLocked(true);
        recordRepository.save(record);
    }

    @Transactional
    public void deleteAttendance(Long recordId) {
        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found: " + recordId));

        if (Boolean.TRUE.equals(record.getIsLocked())) {
            throw new IllegalStateException("Locked attendance records cannot be deleted");
        }

        recordRepository.delete(record);
    }

    @Transactional
    public void deleteEntry(Long recordId, Long studentId) {
        AttendanceRecord record = recordRepository.findById(recordId).orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        if (Boolean.TRUE.equals(record.getIsLocked())) throw new IllegalStateException("Locked attendance cannot be changed");
        if (!record.getEntries().removeIf(e -> e.getStudentId().equals(studentId))) throw new ResourceNotFoundException("Attendance entry not found");
        recordRepository.save(record);
    }

    private AttendanceRecordResponse mapToResponse(AttendanceRecord r) {
        List<AttendanceEntryDto> dtos = r.getEntries().stream()
                .map(e -> new AttendanceEntryDto(e.getStudentId(), e.getStatus(), e.getRemarks()))
                .toList();

        return new AttendanceRecordResponse(
                r.getId(),
                r.getClassId(),
                r.getTeacherId(),
                r.getAttendanceDate(),
                r.getAcademicYear(),
                r.getIsLocked(),
                r.getSubmittedAt(),
                dtos
        );
    }

    public ClassAttendanceSummaryResponse getClassAttendanceSummary(Long classId, LocalDate date) {
        AttendanceRecord record = recordRepository.findByClassIdAndAttendanceDate(classId, date)
                .orElseThrow(() -> new ResourceNotFoundException("No attendance recorded for class " + classId + " on " + date));
        
        long total = record.getEntries().size();
        long present = record.getEntries().stream().filter(e -> e.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = record.getEntries().stream().filter(e -> e.getStatus() == AttendanceStatus.ABSENT).count();
        long late = record.getEntries().stream().filter(e -> e.getStatus() == AttendanceStatus.LATE).count();

        return new ClassAttendanceSummaryResponse(classId, date, total, present, absent, late);
    }

    public StudentAttendanceSummaryResponse getStudentAttendanceSummaryByRange(Long studentId, LocalDate from, LocalDate to) {
        long total = entryRepository.countByStudentIdAndDateRange(studentId, from, to);
        long present = entryRepository.countByStudentIdAndStatusAndDateRange(studentId, AttendanceStatus.PRESENT, from, to);
        long absent = entryRepository.countByStudentIdAndStatusAndDateRange(studentId, AttendanceStatus.ABSENT, from, to);
        long late = entryRepository.countByStudentIdAndStatusAndDateRange(studentId, AttendanceStatus.LATE, from, to);

        double pct = total > 0 ? ((double) (present + late) / total) * 100.0 : 0.0;
        return new StudentAttendanceSummaryResponse(studentId, total, present, absent, late, Math.round(pct * 100.0) / 100.0);
    }
}
