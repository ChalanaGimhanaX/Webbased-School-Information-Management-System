package com.sliit.sims.fee.repository;

import com.sliit.sims.fee.model.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long> {
    Optional<PaymentReceipt> findByReceiptNumber(String receiptNumber);
    Optional<PaymentReceipt> findByPaymentSlipId(Long paymentSlipId);
}
