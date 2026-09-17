package com.sliit.sims.exam.dto;

import com.sliit.sims.exam.model.ExamStatus;

public record ExaminationResponse(
    Long id,
    String examName,
    Integer term,
    Integer academicYear,
    ExamStatus status
) {}
