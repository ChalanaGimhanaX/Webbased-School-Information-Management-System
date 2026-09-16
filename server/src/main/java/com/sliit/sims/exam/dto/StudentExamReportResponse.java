package com.sliit.sims.exam.dto;

import java.math.BigDecimal;
import java.util.List;

public record StudentExamReportResponse(
    Long studentId,
    Long examId,
    String examName,
    Integer term,
    Integer academicYear,
    BigDecimal totalMarks,
    BigDecimal averageMarks,
    List<ExamResultResponse> subjectResults
) {}
