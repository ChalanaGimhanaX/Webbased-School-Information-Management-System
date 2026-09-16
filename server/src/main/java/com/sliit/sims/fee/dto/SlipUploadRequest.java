package com.sliit.sims.fee.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SlipUploadRequest(
    @NotNull(message = "Fee account ID is required")
    Long feeAccountId,

    @NotNull(message = "Parent ID is required")
    Long parentId,

    @NotBlank(message = "Slip image URL is required")
    String slipImageUrl,

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    BigDecimal amountPaid
) {}
