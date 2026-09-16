package com.sliit.sims.fee.dto;

import jakarta.validation.constraints.NotNull;

public record FeeAccountAssignRequest(
    @NotNull(message = "Student ID is required")
    Long studentId,

    @NotNull(message = "Fee structure ID is required")
    Long feeStructureId
) {}
