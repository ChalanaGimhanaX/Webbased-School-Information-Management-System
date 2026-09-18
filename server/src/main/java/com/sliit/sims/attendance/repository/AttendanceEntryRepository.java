// Assigned module owner: IT25101863
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

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM AttendanceEntry e WHERE e.studentId = :studentId AND e.attendanceRecord.attendanceDate >= :fromDate AND e.attendanceRecord.attendanceDate <= :toDate")
    long countByStudentIdAndDateRange(@org.springframework.data.repository.query.Param("studentId") Long studentId, @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDate fromDate, @org.springframework.data.repository.query.Param("toDate") java.time.LocalDate toDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM AttendanceEntry e WHERE e.studentId = :studentId AND e.status = :status AND e.attendanceRecord.attendanceDate >= :fromDate AND e.attendanceRecord.attendanceDate <= :toDate")
    long countByStudentIdAndStatusAndDateRange(@org.springframework.data.repository.query.Param("studentId") Long studentId, @org.springframework.data.repository.query.Param("status") AttendanceStatus status, @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDate fromDate, @org.springframework.data.repository.query.Param("toDate") java.time.LocalDate toDate);
}
