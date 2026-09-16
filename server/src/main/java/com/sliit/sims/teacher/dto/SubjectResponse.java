package com.sliit.sims.teacher.dto;

public record SubjectResponse(
    Long id,
    String subjectCode,
    String subjectName,
    Integer gradeLevel
) {}
