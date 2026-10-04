// Assigned module owner: IT25101863
package com.sliit.sims.attendance.dto;

public record StudentAttendanceSummaryResponse(
    Long studentId,
    long totalDays,
    long presentDays,
    long absentDays,
    long lateDays,
    double attendancePercentage
) {}
