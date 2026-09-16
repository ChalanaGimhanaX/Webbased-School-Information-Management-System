package com.sliit.sims.fee.repository;

import com.sliit.sims.fee.model.PaymentSlip;
import com.sliit.sims.fee.model.SlipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentSlipRepository extends JpaRepository<PaymentSlip, Long> {
    List<PaymentSlip> findByVerificationStatus(SlipStatus status);
    List<PaymentSlip> findByParentId(Long parentId);
}
