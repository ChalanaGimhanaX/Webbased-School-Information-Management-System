// Assigned module owner: IT25102861
package com.sliit.sims.teacher.dto;

import jakarta.validation.constraints.NotNull;

public record TeacherSubjectAssignRequest(
    @NotNull(message = "Teacher ID is required")
    Long teacherId,

    @NotNull(message = "Subject ID is required")
    Long subjectId,

    @NotNull(message = "Class ID is required")
    Long classId,

    @NotNull(message = "Academic year is required")
    Integer academicYear
) {}
