package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.SlipStatus;
import jakarta.validation.constraints.NotNull;

public record SlipVerificationRequest(
    @NotNull(message = "Verification status is required")
    SlipStatus status,

    Long reviewedBy,
    String remarks
) {}
