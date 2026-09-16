package com.sliit.sims.fee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_fee_accounts", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "fee_structure_id"})
})
public class StudentFeeAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_admission_number", nullable = false, length = 50)
    private String studentAdmissionNumber;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fee_structure_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private FeeStructure feeStructure;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "balance_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal balanceAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public StudentFeeAccount() {
        this.paidAmount = BigDecimal.ZERO;
        this.status = PaymentStatus.PENDING;
    }

    public StudentFeeAccount(Long id, Long studentId, String studentAdmissionNumber, String studentName,
                             Integer gradeLevel, FeeStructure feeStructure, Integer academicYear,
                             BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal balanceAmount,
                             PaymentStatus status, LocalDate dueDate, String remarks) {
        this.id = id;
        this.studentId = studentId;
        this.studentAdmissionNumber = studentAdmissionNumber;
        this.studentName = studentName;
        this.gradeLevel = gradeLevel;
        this.feeStructure = feeStructure;
        this.academicYear = academicYear;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount != null ? paidAmount : BigDecimal.ZERO;
        this.balanceAmount = balanceAmount != null ? balanceAmount : (totalAmount != null ? totalAmount.subtract(this.paidAmount) : BigDecimal.ZERO);
        this.status = status != null ? status : PaymentStatus.PENDING;
        this.dueDate = dueDate;
        this.remarks = remarks;
        recalculateStatus();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO;
        }
        if (this.balanceAmount == null && this.totalAmount != null) {
            this.balanceAmount = this.totalAmount.subtract(this.paidAmount);
        }
        recalculateStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        recalculateStatus();
    }

    public void recalculateStatus() {
        if (this.status == PaymentStatus.CANCELLED) {
            return;
        }
        if (this.balanceAmount == null && this.totalAmount != null) {
            this.balanceAmount = this.totalAmount.subtract(this.paidAmount != null ? this.paidAmount : BigDecimal.ZERO);
        }

        if (this.balanceAmount != null && this.balanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
            this.status = PaymentStatus.PAID;
        } else if (this.paidAmount != null && this.paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            this.status = PaymentStatus.PARTIAL;
        } else {
            if (this.dueDate != null && this.dueDate.isBefore(LocalDate.now())) {
                this.status = PaymentStatus.OVERDUE;
            } else {
                this.status = PaymentStatus.PENDING;
            }
        }
    }

    public void applyPayment(BigDecimal amount) {
        if (this.paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO;
        }
        this.paidAmount = this.paidAmount.add(amount);
        this.balanceAmount = this.totalAmount.subtract(this.paidAmount);
        recalculateStatus();
    }

    public void revertPayment(BigDecimal amount) {
        if (this.paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO;
        }
        this.paidAmount = this.paidAmount.subtract(amount);
        if (this.paidAmount.compareTo(BigDecimal.ZERO) < 0) {
            this.paidAmount = BigDecimal.ZERO;
        }
        this.balanceAmount = this.totalAmount.subtract(this.paidAmount);
        recalculateStatus();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentAdmissionNumber() { return studentAdmissionNumber; }
    public void setStudentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Integer getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; }

    public FeeStructure getFeeStructure() { return feeStructure; }
    public void setFeeStructure(FeeStructure feeStructure) { this.feeStructure = feeStructure; }

    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getBalanceAmount() { return balanceAmount; }
    public void setBalanceAmount(BigDecimal balanceAmount) { this.balanceAmount = balanceAmount; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long studentId;
        private String studentAdmissionNumber;
        private String studentName;
        private Integer gradeLevel;
        private FeeStructure feeStructure;
        private Integer academicYear;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount = BigDecimal.ZERO;
        private BigDecimal balanceAmount;
        private PaymentStatus status = PaymentStatus.PENDING;
        private LocalDate dueDate;
        private String remarks;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder studentId(Long studentId) { this.studentId = studentId; return this; }
        public Builder studentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; return this; }
        public Builder studentName(String studentName) { this.studentName = studentName; return this; }
        public Builder gradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; return this; }
        public Builder feeStructure(FeeStructure feeStructure) { this.feeStructure = feeStructure; return this; }
        public Builder academicYear(Integer academicYear) { this.academicYear = academicYear; return this; }
        public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder paidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; return this; }
        public Builder balanceAmount(BigDecimal balanceAmount) { this.balanceAmount = balanceAmount; return this; }
        public Builder status(PaymentStatus status) { this.status = status; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }

        public StudentFeeAccount build() {
            return new StudentFeeAccount(id, studentId, studentAdmissionNumber, studentName, gradeLevel,
                    feeStructure, academicYear, totalAmount, paidAmount, balanceAmount, status, dueDate, remarks);
        }
    }
}
