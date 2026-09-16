package com.sliit.sims.fee.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentReceiptResponse(
    Long id,
    Long paymentSlipId,
    String receiptNumber,
    LocalDateTime issuedDate,
    String receiptType,
    BigDecimal amount
) {}
