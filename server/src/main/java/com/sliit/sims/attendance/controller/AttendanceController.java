// Assigned module owner: IT25101863
package com.sliit.sims.attendance.controller;

import com.sliit.sims.attendance.dto.*;
import com.sliit.sims.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @DeleteMapping("/{id}/students/{studentId}")
    public void deleteEntry(@PathVariable Long id, @PathVariable Long studentId) {
        attendanceService.deleteEntry(id, studentId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceRecordResponse submit(@Valid @RequestBody AttendanceBatchSubmitRequest req) {
        return attendanceService.submitAttendance(req);
    }

    @GetMapping("/class/{classId}")
    public AttendanceRecordResponse getClassAttendance(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getClassAttendance(classId, date);
    }

    @GetMapping("/student/{studentId}/summary")
    public StudentAttendanceSummaryResponse getStudentSummary(@PathVariable Long studentId) {
        return attendanceService.getStudentAttendanceSummary(studentId);
    }

    @PatchMapping("/{id}/lock")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void lock(@PathVariable Long id) {
        attendanceService.lockAttendance(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
    }

    @GetMapping("/student/{studentId}/range")
    public StudentAttendanceSummaryResponse getStudentSummaryRange(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return attendanceService.getStudentAttendanceSummaryByRange(studentId, from, to);
    }

    @GetMapping("/class/{classId}/summary")
    public ClassAttendanceSummaryResponse getClassSummary(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getClassAttendanceSummary(classId, date);
    }
}
