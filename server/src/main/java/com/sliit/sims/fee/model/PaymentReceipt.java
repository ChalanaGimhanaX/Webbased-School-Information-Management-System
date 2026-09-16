package com.sliit.sims.fee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_receipts")
public class PaymentReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payment_slip_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"receipt", "hibernateLazyInitializer", "handler"})
    private PaymentSlip paymentSlip;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 50)
    private String receiptNumber;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_admission_number", nullable = false, length = 50)
    private String studentAdmissionNumber;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "fee_structure_name", nullable = false, length = 150)
    private String feeStructureName;

    @Enumerated(EnumType.STRING)
    @Column(name = "fee_type", nullable = false, length = 50)
    private FeeType feeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "receipt_type", nullable = false, length = 20)
    private ReceiptType receiptType;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "remaining_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal remainingBalance;

    @Column(name = "issued_date", nullable = false)
    private LocalDateTime issuedDate;

    @Column(name = "issued_by", length = 100)
    private String issuedBy;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PaymentReceipt() {}

    public PaymentReceipt(Long id, PaymentSlip paymentSlip, String receiptNumber, Long studentId,
                          String studentAdmissionNumber, String studentName, String feeStructureName,
                          FeeType feeType, ReceiptType receiptType, BigDecimal amountPaid,
                          BigDecimal remainingBalance, LocalDateTime issuedDate, String issuedBy, String notes) {
        this.id = id;
        this.paymentSlip = paymentSlip;
        this.receiptNumber = receiptNumber;
        this.studentId = studentId;
        this.studentAdmissionNumber = studentAdmissionNumber;
        this.studentName = studentName;
        this.feeStructureName = feeStructureName;
        this.feeType = feeType;
        this.receiptType = receiptType;
        this.amountPaid = amountPaid;
        this.remainingBalance = remainingBalance;
        this.issuedDate = issuedDate != null ? issuedDate : LocalDateTime.now();
        this.issuedBy = issuedBy;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.issuedDate == null) {
            this.issuedDate = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PaymentSlip getPaymentSlip() { return paymentSlip; }
    public void setPaymentSlip(PaymentSlip paymentSlip) { this.paymentSlip = paymentSlip; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private PaymentSlip paymentSlip;
        private String receiptNumber;
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

        public Builder id(Long id) { this.id = id; return this; }
        public Builder paymentSlip(PaymentSlip paymentSlip) { this.paymentSlip = paymentSlip; return this; }
        public Builder receiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; return this; }
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

        public PaymentReceipt build() {
            return new PaymentReceipt(id, paymentSlip, receiptNumber, studentId, studentAdmissionNumber,
                    studentName, feeStructureName, feeType, receiptType, amountPaid, remainingBalance,
                    issuedDate, issuedBy, notes);
        }
    }
}
