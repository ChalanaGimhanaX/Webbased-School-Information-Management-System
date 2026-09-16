package com.sliit.sims.student.dto;

import jakarta.validation.constraints.NotNull;

public record ClassAllocateRequest(
    @NotNull(message = "Student ID is required")
    Long studentId,

    @NotNull(message = "Class ID is required")
    Long classId,

    @NotNull(message = "Academic year is required")
    Integer academicYear
) {}
