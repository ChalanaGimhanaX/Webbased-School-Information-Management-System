package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class DirectPaymentRequest {

    @NotNull(message = "Fee account ID is required")
    private Long feeAccountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String transactionReference;
    private String paidBy;
    private String recordedBy;
    private String notes;

    public DirectPaymentRequest() {}

    public DirectPaymentRequest(Long feeAccountId, BigDecimal amount, PaymentMethod paymentMethod,
                                String transactionReference, String paidBy, String recordedBy, String notes) {
        this.feeAccountId = feeAccountId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.transactionReference = transactionReference;
        this.paidBy = paidBy;
        this.recordedBy = recordedBy;
        this.notes = notes;
    }

    public Long getFeeAccountId() { return feeAccountId; }
    public void setFeeAccountId(Long feeAccountId) { this.feeAccountId = feeAccountId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }

    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long feeAccountId;
        private BigDecimal amount;
        private PaymentMethod paymentMethod;
        private String transactionReference;
        private String paidBy;
        private String recordedBy;
        private String notes;

        public Builder feeAccountId(Long feeAccountId) { this.feeAccountId = feeAccountId; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder paymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder transactionReference(String transactionReference) { this.transactionReference = transactionReference; return this; }
        public Builder paidBy(String paidBy) { this.paidBy = paidBy; return this; }
        public Builder recordedBy(String recordedBy) { this.recordedBy = recordedBy; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }

        public DirectPaymentRequest build() {
            return new DirectPaymentRequest(feeAccountId, amount, paymentMethod, transactionReference, paidBy, recordedBy, notes);
        }
    }
}
