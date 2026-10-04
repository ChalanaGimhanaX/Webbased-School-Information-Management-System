// Assigned module owner: IT25102861
package com.sliit.sims.teacher.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubjectCreateRequest(
    @NotBlank(message = "Subject code is required")
    String subjectCode,

    @NotBlank(message = "Subject name is required")
    String subjectName,

    @NotNull(message = "Grade level is required")
    Integer gradeLevel
) {}
