package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BankSlipSubmitRequest {

    @NotNull(message = "Fee account ID is required")
    private Long feeAccountId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private Long parentId;

    @NotBlank(message = "Paid by name is required")
    private String paidBy;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Transaction / bank reference is required")
    private String transactionReference;

    @NotBlank(message = "Bank deposit slip image URL / filename is required")
    private String slipImageUrl;

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amountPaid;

    private LocalDateTime paymentDate;

    public BankSlipSubmitRequest() {}

    public BankSlipSubmitRequest(Long feeAccountId, Long studentId, Long parentId, String paidBy,
                                 PaymentMethod paymentMethod, String transactionReference,
                                 String slipImageUrl, BigDecimal amountPaid, LocalDateTime paymentDate) {
        this.feeAccountId = feeAccountId;
        this.studentId = studentId;
        this.parentId = parentId;
        this.paidBy = paidBy;
        this.paymentMethod = paymentMethod;
        this.transactionReference = transactionReference;
        this.slipImageUrl = slipImageUrl;
        this.amountPaid = amountPaid;
        this.paymentDate = paymentDate;
    }

    public Long getFeeAccountId() { return feeAccountId; }
    public void setFeeAccountId(Long feeAccountId) { this.feeAccountId = feeAccountId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }

    public String getSlipImageUrl() { return slipImageUrl; }
    public void setSlipImageUrl(String slipImageUrl) { this.slipImageUrl = slipImageUrl; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long feeAccountId;
        private Long studentId;
        private Long parentId;
        private String paidBy;
        private PaymentMethod paymentMethod;
        private String transactionReference;
        private String slipImageUrl;
        private BigDecimal amountPaid;
        private LocalDateTime paymentDate;

        public Builder feeAccountId(Long feeAccountId) { this.feeAccountId = feeAccountId; return this; }
        public Builder studentId(Long studentId) { this.studentId = studentId; return this; }
        public Builder parentId(Long parentId) { this.parentId = parentId; return this; }
        public Builder paidBy(String paidBy) { this.paidBy = paidBy; return this; }
        public Builder paymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder transactionReference(String transactionReference) { this.transactionReference = transactionReference; return this; }
        public Builder slipImageUrl(String slipImageUrl) { this.slipImageUrl = slipImageUrl; return this; }
        public Builder amountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; return this; }
        public Builder paymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; return this; }

        public BankSlipSubmitRequest build() {
            return new BankSlipSubmitRequest(feeAccountId, studentId, parentId, paidBy, paymentMethod, transactionReference, slipImageUrl, amountPaid, paymentDate);
        }
    }
}
