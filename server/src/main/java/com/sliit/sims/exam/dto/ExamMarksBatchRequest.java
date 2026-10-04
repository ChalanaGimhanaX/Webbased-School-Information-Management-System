// Assigned module owner: IT25103724
package com.sliit.sims.exam.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ExamMarksBatchRequest(
    @NotNull(message = "Exam Paper ID is required")
    Long examPaperId,

    @NotEmpty(message = "Marks list cannot be empty")
    List<@Valid ExamMarksEntryDto> marks
) {}
