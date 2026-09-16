package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.FeeType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record FeeStructureCreateRequest(
    @NotNull(message = "Fee type is required")
    FeeType feeType,

    @NotNull(message = "Grade level is required")
    Integer gradeLevel,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    BigDecimal amount,

    @NotNull(message = "Academic year is required")
    Integer academicYear
) {}
