package com.sliit.sims.teacher.dto;

public record TeacherAssignmentResponse(
    Long id,
    Long teacherId,
    Long subjectId,
    String subjectName,
    Long classId,
    Integer academicYear
) {}
