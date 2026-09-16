package com.sliit.sims.fee.repository;

import com.sliit.sims.fee.model.PaymentSlip;
import com.sliit.sims.fee.model.SlipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentSlipRepository extends JpaRepository<PaymentSlip, Long> {

    List<PaymentSlip> findByFeeAccountId(Long feeAccountId);

    List<PaymentSlip> findByStudentId(Long studentId);

    List<PaymentSlip> findByVerificationStatus(SlipStatus verificationStatus);

    List<PaymentSlip> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);

    Optional<PaymentSlip> findByTransactionReference(String transactionReference);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM PaymentSlip p WHERE p.verificationStatus = 'APPROVED'")
    BigDecimal sumTotalApprovedPayments();

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM PaymentSlip p WHERE p.verificationStatus = 'APPROVED' AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumApprovedPaymentsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
