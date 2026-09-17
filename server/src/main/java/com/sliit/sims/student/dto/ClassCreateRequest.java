package com.sliit.sims.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClassCreateRequest(
    @NotNull(message = "Grade level is required")
    Integer gradeLevel,

    @NotBlank(message = "Class name is required")
    String className,

    @NotNull(message = "Academic year is required")
    Integer academicYear,

    Integer capacity,
    Long classTeacherId
) {}
