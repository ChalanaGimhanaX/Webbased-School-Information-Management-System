package com.sliit.sims.timetable.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TimetableCreateRequest(
    @NotNull(message = "Class ID is required")
    Long classId,

    @NotNull(message = "Academic year is required")
    @Min(value = 2024, message = "Academic year must be 2024 or later")
    Integer academicYear,

    @NotNull(message = "Term is required")
    @Min(value = 1, message = "Term must be 1, 2, or 3")
    @Max(value = 3, message = "Term must be 1, 2, or 3")
    Integer term
) {}

