package com.sliit.sims.exam.dto;

import java.math.BigDecimal;

public record ExamResultResponse(
    Long id,
    Long examPaperId,
    Long studentId,
    BigDecimal marksObtained,
    String grade,
    Boolean isPublished
) {}
