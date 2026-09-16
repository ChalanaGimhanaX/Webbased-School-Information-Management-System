package com.sliit.sims.attendance.repository;

import com.sliit.sims.attendance.model.AttendanceEntry;
import com.sliit.sims.attendance.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceEntryRepository extends JpaRepository<AttendanceEntry, Long> {
    List<AttendanceEntry> findByAttendanceRecordId(Long attendanceRecordId);
    List<AttendanceEntry> findByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);
    long countByStudentId(Long studentId);
}
