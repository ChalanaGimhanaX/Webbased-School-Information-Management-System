// Assigned module owner: IT25103710
package com.sliit.sims.fee.dto;
import com.sliit.sims.fee.model.PaymentMethod;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record PaymentUpdateRequest(@NotNull @DecimalMin("0.01") BigDecimal amountPaid,
        @NotNull PaymentMethod paymentMethod, @NotBlank @Size(max = 150) String paidBy,
        @Size(max = 100) String transactionReference) {}
