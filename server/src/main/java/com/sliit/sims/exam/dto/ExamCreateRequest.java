package com.sliit.sims.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ExamCreateRequest(
    @NotBlank(message = "Exam name is required")
    String examName,

    @NotNull(message = "Term is required")
    Integer term,

    @NotNull(message = "Academic year is required")
    Integer academicYear
) {}
