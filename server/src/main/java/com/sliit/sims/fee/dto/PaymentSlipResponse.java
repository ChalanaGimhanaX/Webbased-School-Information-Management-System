// Assigned module owner: IT25103710
package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.PaymentMethod;
import com.sliit.sims.fee.model.PaymentSlip;
import com.sliit.sims.fee.model.SlipStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentSlipResponse {

    private Long id;
    private Long feeAccountId;
    private Long studentId;
    private Long parentId;
    private String studentName;
    private String studentAdmissionNumber;
    private Integer gradeLevel;
    private String feeStructureName;
    private BigDecimal accountBalance;
    private BigDecimal accountTotal;
    private String paidBy;
    private PaymentMethod paymentMethod;
    private String transactionReference;
    private String slipImageUrl;
    private BigDecimal amountPaid;
    private LocalDateTime paymentDate;
    private SlipStatus verificationStatus;
    private String reviewedBy;
    private String reviewRemarks;
    private LocalDateTime reviewedAt;
    private String receiptNumber;
    private LocalDateTime createdAt;

    public PaymentSlipResponse() {}

    public PaymentSlipResponse(Long id, Long feeAccountId, Long studentId, Long parentId,
                               String studentName, String studentAdmissionNumber, Integer gradeLevel,
                               String feeStructureName, BigDecimal accountBalance, BigDecimal accountTotal,
                               String paidBy, PaymentMethod paymentMethod, String transactionReference,
                               String slipImageUrl, BigDecimal amountPaid, LocalDateTime paymentDate,
                               SlipStatus verificationStatus, String reviewedBy, String reviewRemarks,
                               LocalDateTime reviewedAt, String receiptNumber, LocalDateTime createdAt) {
        this.id = id;
        this.feeAccountId = feeAccountId;
        this.studentId = studentId;
        this.parentId = parentId;
        this.studentName = studentName;
        this.studentAdmissionNumber = studentAdmissionNumber;
        this.gradeLevel = gradeLevel;
        this.feeStructureName = feeStructureName;
        this.accountBalance = accountBalance;
        this.accountTotal = accountTotal;
        this.paidBy = paidBy;
        this.paymentMethod = paymentMethod;
        this.transactionReference = transactionReference;
        this.slipImageUrl = slipImageUrl;
        this.amountPaid = amountPaid;
        this.paymentDate = paymentDate;
        this.verificationStatus = verificationStatus;
        this.reviewedBy = reviewedBy;
        this.reviewRemarks = reviewRemarks;
        this.reviewedAt = reviewedAt;
        this.receiptNumber = receiptNumber;
        this.createdAt = createdAt;
    }

    public static PaymentSlipResponse fromEntity(PaymentSlip entity) {
        if (entity == null) return null;
        Builder builder = PaymentSlipResponse.builder()
                .id(entity.getId())
                .feeAccountId(entity.getFeeAccount() != null ? entity.getFeeAccount().getId() : null)
                .studentId(entity.getStudentId())
                .parentId(entity.getParentId())
                .paidBy(entity.getPaidBy())
                .paymentMethod(entity.getPaymentMethod())
                .transactionReference(entity.getTransactionReference())
                .slipImageUrl(entity.getSlipImageUrl())
                .amountPaid(entity.getAmountPaid())
                .paymentDate(entity.getPaymentDate())
                .verificationStatus(entity.getVerificationStatus())
                .reviewedBy(entity.getReviewedBy())
                .reviewRemarks(entity.getReviewRemarks())
                .reviewedAt(entity.getReviewedAt())
                .receiptNumber(entity.getReceipt() != null ? entity.getReceipt().getReceiptNumber() : null)
                .createdAt(entity.getCreatedAt());

        if (entity.getFeeAccount() != null) {
            builder.studentName(entity.getFeeAccount().getStudentName())
                   .studentAdmissionNumber(entity.getFeeAccount().getStudentAdmissionNumber())
                   .gradeLevel(entity.getFeeAccount().getGradeLevel())
                   .accountBalance(entity.getFeeAccount().getBalanceAmount())
                   .accountTotal(entity.getFeeAccount().getTotalAmount());
            if (entity.getFeeAccount().getFeeStructure() != null) {
                builder.feeStructureName(entity.getFeeAccount().getFeeStructure().getName());
            }
        }

        return builder.build();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFeeAccountId() { return feeAccountId; }
    public void setFeeAccountId(Long feeAccountId) { this.feeAccountId = feeAccountId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentAdmissionNumber() { return studentAdmissionNumber; }
    public void setStudentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; }

    public Integer getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; }

    public String getFeeStructureName() { return feeStructureName; }
    public void setFeeStructureName(String feeStructureName) { this.feeStructureName = feeStructureName; }

    public BigDecimal getAccountBalance() { return accountBalance; }
    public void setAccountBalance(BigDecimal accountBalance) { this.accountBalance = accountBalance; }

    public BigDecimal getAccountTotal() { return accountTotal; }
    public void setAccountTotal(BigDecimal accountTotal) { this.accountTotal = accountTotal; }

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

    public SlipStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(SlipStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long feeAccountId;
        private Long studentId;
        private Long parentId;
        private String studentName;
        private String studentAdmissionNumber;
        private Integer gradeLevel;
        private String feeStructureName;
        private BigDecimal accountBalance;
        private BigDecimal accountTotal;
        private String paidBy;
        private PaymentMethod paymentMethod;
        private String transactionReference;
        private String slipImageUrl;
        private BigDecimal amountPaid;
        private LocalDateTime paymentDate;
        private SlipStatus verificationStatus;
        private String reviewedBy;
        private String reviewRemarks;
        private LocalDateTime reviewedAt;
        private String receiptNumber;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder feeAccountId(Long feeAccountId) { this.feeAccountId = feeAccountId; return this; }
        public Builder studentId(Long studentId) { this.studentId = studentId; return this; }
        public Builder parentId(Long parentId) { this.parentId = parentId; return this; }
        public Builder studentName(String studentName) { this.studentName = studentName; return this; }
        public Builder studentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; return this; }
        public Builder gradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; return this; }
        public Builder feeStructureName(String feeStructureName) { this.feeStructureName = feeStructureName; return this; }
        public Builder accountBalance(BigDecimal accountBalance) { this.accountBalance = accountBalance; return this; }
        public Builder accountTotal(BigDecimal accountTotal) { this.accountTotal = accountTotal; return this; }
        public Builder paidBy(String paidBy) { this.paidBy = paidBy; return this; }
        public Builder paymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder transactionReference(String transactionReference) { this.transactionReference = transactionReference; return this; }
        public Builder slipImageUrl(String slipImageUrl) { this.slipImageUrl = slipImageUrl; return this; }
        public Builder amountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; return this; }
        public Builder paymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; return this; }
        public Builder verificationStatus(SlipStatus verificationStatus) { this.verificationStatus = verificationStatus; return this; }
        public Builder reviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; return this; }
        public Builder reviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; return this; }
        public Builder reviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; return this; }
        public Builder receiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PaymentSlipResponse build() {
            return new PaymentSlipResponse(id, feeAccountId, studentId, parentId, studentName, studentAdmissionNumber,
                    gradeLevel, feeStructureName, accountBalance, accountTotal, paidBy, paymentMethod,
                    transactionReference, slipImageUrl, amountPaid, paymentDate, verificationStatus,
                    reviewedBy, reviewRemarks, reviewedAt, receiptNumber, createdAt);
        }
    }
}
