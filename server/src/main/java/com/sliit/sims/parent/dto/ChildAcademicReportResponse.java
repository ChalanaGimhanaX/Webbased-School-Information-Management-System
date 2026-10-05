package com.sliit.sims.parent.dto;

import java.math.BigDecimal;
import java.util.List;

public record ChildAcademicReportResponse(
        Long studentId,
        String studentName,
        String admissionNumber,
        String className,
        Integer gradeLevel,
        Double attendanceRate,
        Long attendancePresentDays,
        Long attendanceTotalDays,
        List<ChildExamCard> exams
) {
    public record ChildExamCard(
            Long examId,
            String examName,
            Integer term,
            Integer academicYear,
            BigDecimal totalMarks,
            BigDecimal averageMarks,
            String overallStatus,
            List<ChildSubjectResult> subjectResults
    ) {}

    public record ChildSubjectResult(
            Long examPaperId,
            Long subjectId,
            String subjectName,
            String subjectCode,
            BigDecimal marksObtained,
            BigDecimal maxMarks,
            String grade,
            String remarks
    ) {}
}

