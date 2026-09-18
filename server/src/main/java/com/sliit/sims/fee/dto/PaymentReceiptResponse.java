// Assigned module owner: IT25103710
package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.FeeType;
import com.sliit.sims.fee.model.PaymentReceipt;
import com.sliit.sims.fee.model.ReceiptType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentReceiptResponse {

    private Long id;
    private String receiptNumber;
    private Long paymentSlipId;
    private Long studentId;
    private String studentAdmissionNumber;
    private String studentName;
    private String feeStructureName;
    private FeeType feeType;
    private ReceiptType receiptType;
    private BigDecimal amountPaid;
    private BigDecimal remainingBalance;
    private LocalDateTime issuedDate;
    private String issuedBy;
    private String notes;
    private LocalDateTime createdAt;

    public PaymentReceiptResponse() {}

    public PaymentReceiptResponse(Long id, String receiptNumber, Long paymentSlipId, Long studentId,
                                  String studentAdmissionNumber, String studentName, String feeStructureName,
                                  FeeType feeType, ReceiptType receiptType, BigDecimal amountPaid,
                                  BigDecimal remainingBalance, LocalDateTime issuedDate, String issuedBy,
                                  String notes, LocalDateTime createdAt) {
        this.id = id;
        this.receiptNumber = receiptNumber;
        this.paymentSlipId = paymentSlipId;
        this.studentId = studentId;
        this.studentAdmissionNumber = studentAdmissionNumber;
        this.studentName = studentName;
        this.feeStructureName = feeStructureName;
        this.feeType = feeType;
        this.receiptType = receiptType;
        this.amountPaid = amountPaid;
        this.remainingBalance = remainingBalance;
        this.issuedDate = issuedDate;
        this.issuedBy = issuedBy;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public static PaymentReceiptResponse fromEntity(PaymentReceipt entity) {
        if (entity == null) return null;
        return PaymentReceiptResponse.builder()
                .id(entity.getId())
                .receiptNumber(entity.getReceiptNumber())
                .paymentSlipId(entity.getPaymentSlip() != null ? entity.getPaymentSlip().getId() : null)
                .studentId(entity.getStudentId())
                .studentAdmissionNumber(entity.getStudentAdmissionNumber())
                .studentName(entity.getStudentName())
                .feeStructureName(entity.getFeeStructureName())
                .feeType(entity.getFeeType())
                .receiptType(entity.getReceiptType())
                .amountPaid(entity.getAmountPaid())
                .remainingBalance(entity.getRemainingBalance())
                .issuedDate(entity.getIssuedDate())
                .issuedBy(entity.getIssuedBy())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public Long getPaymentSlipId() { return paymentSlipId; }
    public void setPaymentSlipId(Long paymentSlipId) { this.paymentSlipId = paymentSlipId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentAdmissionNumber() { return studentAdmissionNumber; }
    public void setStudentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getFeeStructureName() { return feeStructureName; }
    public void setFeeStructureName(String feeStructureName) { this.feeStructureName = feeStructureName; }

    public FeeType getFeeType() { return feeType; }
    public void setFeeType(FeeType feeType) { this.feeType = feeType; }

    public ReceiptType getReceiptType() { return receiptType; }
    public void setReceiptType(ReceiptType receiptType) { this.receiptType = receiptType; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public BigDecimal getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(BigDecimal remainingBalance) { this.remainingBalance = remainingBalance; }

    public LocalDateTime getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDateTime issuedDate) { this.issuedDate = issuedDate; }

    public String getIssuedBy() { return issuedBy; }
    public void setIssuedBy(String issuedBy) { this.issuedBy = issuedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String receiptNumber;
        private Long paymentSlipId;
        private Long studentId;
        private String studentAdmissionNumber;
        private String studentName;
        private String feeStructureName;
        private FeeType feeType;
        private ReceiptType receiptType;
        private BigDecimal amountPaid;
        private BigDecimal remainingBalance;
        private LocalDateTime issuedDate;
        private String issuedBy;
        private String notes;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder receiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; return this; }
        public Builder paymentSlipId(Long paymentSlipId) { this.paymentSlipId = paymentSlipId; return this; }
        public Builder studentId(Long studentId) { this.studentId = studentId; return this; }
        public Builder studentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; return this; }
        public Builder studentName(String studentName) { this.studentName = studentName; return this; }
        public Builder feeStructureName(String feeStructureName) { this.feeStructureName = feeStructureName; return this; }
        public Builder feeType(FeeType feeType) { this.feeType = feeType; return this; }
        public Builder receiptType(ReceiptType receiptType) { this.receiptType = receiptType; return this; }
        public Builder amountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; return this; }
        public Builder remainingBalance(BigDecimal remainingBalance) { this.remainingBalance = remainingBalance; return this; }
        public Builder issuedDate(LocalDateTime issuedDate) { this.issuedDate = issuedDate; return this; }
        public Builder issuedBy(String issuedBy) { this.issuedBy = issuedBy; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PaymentReceiptResponse build() {
            return new PaymentReceiptResponse(id, receiptNumber, paymentSlipId, studentId,
                    studentAdmissionNumber, studentName, feeStructureName, feeType, receiptType,
                    amountPaid, remainingBalance, issuedDate, issuedBy, notes, createdAt);
        }
    }
}
