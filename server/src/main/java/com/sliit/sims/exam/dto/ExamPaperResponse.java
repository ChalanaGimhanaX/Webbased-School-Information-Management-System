package com.sliit.sims.exam.dto;

import java.math.BigDecimal;

public record ExamPaperResponse(
    Long id,
    Long examId,
    Long subjectId,
    Integer gradeLevel,
    BigDecimal maxMarks
) {}
