package com.sliit.sims.timetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TimetableEntryRequest(
    @NotNull(message = "Time slot ID is required")
    Long timeSlotId,

    @NotNull(message = "Subject ID is required")
    Long subjectId,

    @NotNull(message = "Teacher ID is required")
    Long teacherId,

    @NotBlank(message = "Room number is required")
    @Size(max = 50, message = "Room number cannot exceed 50 characters")
    String roomNumber
) {}

