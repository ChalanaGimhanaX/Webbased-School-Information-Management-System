package com.sliit.sims.attendance.repository;

import com.sliit.sims.attendance.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    Optional<AttendanceRecord> findByClassIdAndAttendanceDate(Long classId, LocalDate attendanceDate);
}
