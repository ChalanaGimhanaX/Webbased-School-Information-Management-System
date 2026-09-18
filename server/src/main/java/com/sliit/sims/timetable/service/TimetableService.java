// Assigned module owner: IT25101913
package com.sliit.sims.timetable.service;

import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.common.exception.ScheduleConflictException;
import com.sliit.sims.common.exception.ScheduleConflictException.ConflictType;
import com.sliit.sims.timetable.dto.*;
import com.sliit.sims.timetable.model.*;
import com.sliit.sims.timetable.repository.TimeSlotRepository;
import com.sliit.sims.timetable.repository.TimetableEntryRepository;
import com.sliit.sims.timetable.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final TimetableEntryRepository entryRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Transactional
    public TimetableResponse createTimetable(TimetableCreateRequest req) {
        timetableRepository.findByClassIdAndAcademicYearAndTerm(req.classId(), req.academicYear(), req.term())
                .ifPresent(existing -> {
                    throw new ScheduleConflictException(ConflictType.CLASS_SLOT_TAKEN,
                            "Timetable already exists for class " + req.classId() + " in term " + req.term());
                });

        Timetable timetable = Timetable.builder()
                .classId(req.classId())
                .academicYear(req.academicYear())
                .term(req.term())
                .status(TimetableStatus.DRAFT)
                .build();

        return mapToResponse(timetableRepository.save(timetable));
    }

    @Transactional
    public TimetableEntryResponse addEntry(Long timetableId, TimetableEntryRequest req) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found: " + timetableId));

        TimeSlot timeSlot = timeSlotRepository.findById(req.timeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found: " + req.timeSlotId()));

        checkConflicts(timetableId, req.timeSlotId(), req.teacherId(), req.roomNumber());

        TimetableEntry entry = TimetableEntry.builder()
                .timetable(timetable)
                .timeSlot(timeSlot)
                .subjectId(req.subjectId())
                .teacherId(req.teacherId())
                .roomNumber(req.roomNumber().trim().toUpperCase())
                .build();

        return mapToEntryResponse(entryRepository.save(entry));
    }

    @Transactional
    public TimetableEntryResponse updateEntry(Long timetableId, Long entryId, TimetableEntryRequest req) {
        TimetableEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found: " + entryId));

        if (!entry.getTimetable().getId().equals(timetableId)) {
            throw new IllegalArgumentException("Entry does not belong to timetable " + timetableId);
        }

        TimeSlot timeSlot = timeSlotRepository.findById(req.timeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found: " + req.timeSlotId()));

        checkConflictsForUpdate(timetableId, entryId, req.timeSlotId(), req.teacherId(), req.roomNumber());

        entry.setTimeSlot(timeSlot);
        entry.setSubjectId(req.subjectId());
        entry.setTeacherId(req.teacherId());
        entry.setRoomNumber(req.roomNumber().trim().toUpperCase());

        return mapToEntryResponse(entryRepository.save(entry));
    }

    public ConflictValidationResponse validateSlot(Long timetableId, TimetableEntryRequest req) {
        try {
            checkConflicts(timetableId, req.timeSlotId(), req.teacherId(), req.roomNumber());
            return ConflictValidationResponse.ok();
        } catch (ScheduleConflictException ex) {
            return ConflictValidationResponse.conflict(ex.getMessage(), ex.getConflictType().name());
        }
    }

    private void checkConflicts(Long timetableId, Long slotId, Long teacherId, String roomNumber) {
        entryRepository.findClassSlotConflict(timetableId, slotId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.CLASS_SLOT_TAKEN,
                    "This class already has a subject assigned to period " + e.getTimeSlot().getPeriodNumber());
        });

        entryRepository.findTeacherConflict(slotId, teacherId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.TEACHER_BUSY,
                    "Teacher " + teacherId + " is already assigned to another class during " +
                            e.getTimeSlot().getDayOfWeek() + " Period " + e.getTimeSlot().getPeriodNumber());
        });

        entryRepository.findRoomConflict(slotId, roomNumber.trim()).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.ROOM_OCCUPIED,
                    "Room " + roomNumber + " is already occupied during " +
                            e.getTimeSlot().getDayOfWeek() + " Period " + e.getTimeSlot().getPeriodNumber());
        });
    }

    private void checkConflictsForUpdate(Long timetableId, Long entryId, Long slotId, Long teacherId, String roomNumber) {
        entryRepository.findClassSlotConflictExcludingEntry(timetableId, slotId, entryId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.CLASS_SLOT_TAKEN,
                    "This class already has a subject assigned to period " + e.getTimeSlot().getPeriodNumber());
        });

        entryRepository.findTeacherConflictExcludingEntry(slotId, teacherId, entryId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.TEACHER_BUSY,
                    "Teacher " + teacherId + " is already assigned to another class during " +
                            e.getTimeSlot().getDayOfWeek() + " Period " + e.getTimeSlot().getPeriodNumber());
        });

        entryRepository.findRoomConflictExcludingEntry(slotId, roomNumber.trim(), entryId).ifPresent(e -> {
            throw new ScheduleConflictException(ConflictType.ROOM_OCCUPIED,
                    "Room " + roomNumber + " is already occupied during " +
                            e.getTimeSlot().getDayOfWeek() + " Period " + e.getTimeSlot().getPeriodNumber());
        });
    }

    @Transactional
    public void deleteEntry(Long timetableId, Long entryId) {
        TimetableEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found: " + entryId));

        if (!entry.getTimetable().getId().equals(timetableId)) {
            throw new IllegalArgumentException("Entry does not belong to timetable " + timetableId);
        }
        entryRepository.delete(entry);
    }

    @Transactional
    public TimetableResponse publishTimetable(Long timetableId) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found: " + timetableId));

        if (timetable.getEntries().isEmpty()) {
            throw new IllegalStateException("Cannot publish an empty timetable");
        }

        timetable.setStatus(TimetableStatus.PUBLISHED);
        return mapToResponse(timetableRepository.save(timetable));
    }

    public TimetableResponse getTimetable(Long id) {
        return timetableRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found: " + id));
    }

    public List<TimetableResponse> getTimetablesByClass(Long classId) {
        return timetableRepository.findByClassIdOrderByAcademicYearDescTermDesc(classId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TimetableEntryResponse> getTeacherSchedule(Long teacherId) {
        return entryRepository.findPublishedEntriesByTeacher(teacherId)
                .stream()
                .map(this::mapToEntryResponse)
                .toList();
    }

    public List<TimetableEntryResponse> getRoomSchedule(String roomNumber) {
        return entryRepository.findPublishedEntriesByRoom(roomNumber.trim())
                .stream()
                .map(this::mapToEntryResponse)
                .toList();
    }

    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotRepository.findAllByOrderByDayOfWeekAscPeriodNumberAsc();
    }

    private TimetableResponse mapToResponse(Timetable t) {
        List<TimetableEntryResponse> entries = t.getEntries().stream()
                .map(this::mapToEntryResponse)
                .toList();

        return new TimetableResponse(
                t.getId(),
                t.getClassId(),
                t.getAcademicYear(),
                t.getTerm(),
                t.getStatus(),
                entries,
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }

    private TimetableEntryResponse mapToEntryResponse(TimetableEntry e) {
        return new TimetableEntryResponse(
                e.getId(),
                e.getTimeSlot().getId(),
                e.getTimeSlot().getDayOfWeek().name(),
                e.getTimeSlot().getPeriodNumber(),
                e.getTimeSlot().getStartTime(),
                e.getTimeSlot().getEndTime(),
                e.getSubjectId(),
                e.getTeacherId(),
                e.getRoomNumber()
        );
    }
}

