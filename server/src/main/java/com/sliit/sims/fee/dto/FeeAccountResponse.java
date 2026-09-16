package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.FeeType;
import com.sliit.sims.fee.model.PaymentStatus;
import java.math.BigDecimal;

public record FeeAccountResponse(
    Long id,
    Long studentId,
    Long feeStructureId,
    FeeType feeType,
    Integer gradeLevel,
    Integer academicYear,
    BigDecimal totalAmount,
    BigDecimal paidAmount,
    BigDecimal balanceAmount,
    PaymentStatus status
) {}
