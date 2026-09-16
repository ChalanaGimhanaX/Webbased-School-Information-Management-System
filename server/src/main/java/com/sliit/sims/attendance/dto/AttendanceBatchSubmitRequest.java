package com.sliit.sims.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record AttendanceBatchSubmitRequest(
    @NotNull(message = "Class ID is required")
    Long classId,

    @NotNull(message = "Teacher ID is required")
    Long teacherId,

    @NotNull(message = "Attendance date is required")
    LocalDate attendanceDate,

    @NotNull(message = "Academic year is required")
    Integer academicYear,

    @NotEmpty(message = "Attendance entries cannot be empty")
    List<@Valid AttendanceEntryDto> entries
) {}
