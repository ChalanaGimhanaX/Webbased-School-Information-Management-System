// Assigned module owner: IT25101863
package com.sliit.sims.attendance.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AttendanceRecordResponse(
    Long id,
    Long classId,
    Long teacherId,
    LocalDate attendanceDate,
    Integer academicYear,
    Boolean isLocked,
    LocalDateTime submittedAt,
    List<AttendanceEntryDto> entries
) {}
