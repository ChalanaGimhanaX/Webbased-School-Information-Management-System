package com.sliit.sims.fee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_slips")
public class PaymentSlip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fee_account_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private StudentFeeAccount feeAccount;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "paid_by", length = 150)
    private String paidBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "slip_image_url", length = 500)
    private String slipImageUrl;

    @Column(name = "amount_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private SlipStatus verificationStatus = SlipStatus.PENDING;

    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @Column(name = "review_remarks", length = 500)
    private String reviewRemarks;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @OneToOne(mappedBy = "paymentSlip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"paymentSlip", "hibernateLazyInitializer", "handler"})
    private PaymentReceipt receipt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PaymentSlip() {
        this.verificationStatus = SlipStatus.PENDING;
    }

    public PaymentSlip(Long id, StudentFeeAccount feeAccount, Long studentId, Long parentId, String paidBy,
                       PaymentMethod paymentMethod, String transactionReference, String slipImageUrl,
                       BigDecimal amountPaid, LocalDateTime paymentDate, SlipStatus verificationStatus,
                       String reviewedBy, String reviewRemarks, LocalDateTime reviewedAt) {
        this.id = id;
        this.feeAccount = feeAccount;
        this.studentId = studentId;
        this.parentId = parentId;
        this.paidBy = paidBy;
        this.paymentMethod = paymentMethod;
        this.transactionReference = transactionReference;
        this.slipImageUrl = slipImageUrl;
        this.amountPaid = amountPaid;
        this.paymentDate = paymentDate != null ? paymentDate : LocalDateTime.now();
        this.verificationStatus = verificationStatus != null ? verificationStatus : SlipStatus.PENDING;
        this.reviewedBy = reviewedBy;
        this.reviewRemarks = reviewRemarks;
        this.reviewedAt = reviewedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.paymentDate == null) {
            this.paymentDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentFeeAccount getFeeAccount() { return feeAccount; }
    public void setFeeAccount(StudentFeeAccount feeAccount) { this.feeAccount = feeAccount; }

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

    public SlipStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(SlipStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public PaymentReceipt getReceipt() { return receipt; }
    public void setReceipt(PaymentReceipt receipt) { this.receipt = receipt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private StudentFeeAccount feeAccount;
        private Long studentId;
        private Long parentId;
        private String paidBy;
        private PaymentMethod paymentMethod;
        private String transactionReference;
        private String slipImageUrl;
        private BigDecimal amountPaid;
        private LocalDateTime paymentDate;
        private SlipStatus verificationStatus = SlipStatus.PENDING;
        private String reviewedBy;
        private String reviewRemarks;
        private LocalDateTime reviewedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder feeAccount(StudentFeeAccount feeAccount) { this.feeAccount = feeAccount; return this; }
        public Builder studentId(Long studentId) { this.studentId = studentId; return this; }
        public Builder parentId(Long parentId) { this.parentId = parentId; return this; }
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

        public PaymentSlip build() {
            return new PaymentSlip(id, feeAccount, studentId, parentId, paidBy, paymentMethod, transactionReference,
                    slipImageUrl, amountPaid, paymentDate, verificationStatus, reviewedBy, reviewRemarks, reviewedAt);
        }
    }
}
