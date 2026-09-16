package com.sliit.sims.fee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_fee_accounts", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "fee_structure_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "balance_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal balanceAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO;
        }
        if (this.balanceAmount == null) {
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
}
