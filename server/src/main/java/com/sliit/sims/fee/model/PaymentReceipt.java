package com.sliit.sims.fee.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.issuedDate == null) {
            this.issuedDate = LocalDateTime.now();
        }
    }
}
