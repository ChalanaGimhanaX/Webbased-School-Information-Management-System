// Assigned module owner: IT25103724
package com.sliit.sims.exam.dto;

import jakarta.validation.constraints.Min;

public record ExamUpdateRequest(
    String examName,

    @Min(value = 1, message = "Term must be at least 1")
    Integer term,

    @Min(value = 2000, message = "Academic year must be valid")
    Integer academicYear
) {}
