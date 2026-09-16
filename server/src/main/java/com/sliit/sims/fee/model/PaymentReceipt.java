package com.sliit.sims.fee.model;

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
    private PaymentSlip paymentSlip;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 100)
    private String receiptNumber;

    @Column(name = "issued_date", nullable = false, updatable = false)
    private LocalDateTime issuedDate;

    @Column(name = "receipt_type", nullable = false, length = 20)
    private String receiptType; // "FULL", "PARTIAL"

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @PrePersist
    protected void onCreate() {
        this.issuedDate = LocalDateTime.now();
    }
}
