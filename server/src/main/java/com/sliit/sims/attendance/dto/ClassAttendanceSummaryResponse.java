// Assigned module owner: IT25101863
package com.sliit.sims.attendance.dto;

import java.time.LocalDate;

public record ClassAttendanceSummaryResponse(
    Long classId,
    LocalDate date,
    long totalStudents,
    long presentCount,
    long absentCount,
    long lateCount
) {}
