package com.sliit.sims.exam.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ExamPaperCreateRequest(
    @NotNull(message = "Exam ID is required")
    Long examId,

    @NotNull(message = "Subject ID is required")
    Long subjectId,

    @NotNull(message = "Grade level is required")
    Integer gradeLevel,

    BigDecimal maxMarks
) {}
