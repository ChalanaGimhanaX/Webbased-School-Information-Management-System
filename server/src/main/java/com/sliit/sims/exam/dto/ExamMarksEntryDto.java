// Assigned module owner: IT25103724
package com.sliit.sims.exam.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ExamMarksEntryDto(
    @NotNull(message = "Student ID is required")
    Long studentId,

    @NotNull(message = "Marks obtained is required")
    @DecimalMin(value = "0.00", message = "Marks cannot be negative")
    @DecimalMax(value = "100.00", message = "Marks cannot exceed 100")
    BigDecimal marksObtained
) {}
