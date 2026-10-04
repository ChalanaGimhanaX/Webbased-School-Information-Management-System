// Assigned module owner: IT25101863
package com.sliit.sims.attendance.dto;

import com.sliit.sims.attendance.model.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public record AttendanceEntryDto(
    @NotNull(message = "Student ID is required")
    Long studentId,

    @NotNull(message = "Status is required")
    AttendanceStatus status,

    String remarks
) {}
