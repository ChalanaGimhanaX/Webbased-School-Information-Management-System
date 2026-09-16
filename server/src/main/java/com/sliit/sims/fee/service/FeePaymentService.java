package com.sliit.sims.fee.service;

import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.fee.dto.*;
import com.sliit.sims.fee.model.*;
import com.sliit.sims.fee.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeePaymentService {

    private final FeeStructureRepository feeStructureRepository;
    private final StudentFeeAccountRepository accountRepository;
    private final PaymentSlipRepository slipRepository;
    private final PaymentReceiptRepository receiptRepository;

    @Transactional
    public FeeStructure createFeeStructure(FeeStructureCreateRequest req) {
        feeStructureRepository.findByFeeTypeAndGradeLevelAndAcademicYear(req.feeType(), req.gradeLevel(), req.academicYear())
                .ifPresent(f -> {
                    throw new IllegalArgumentException("Fee structure already defined for " + req.feeType() + " Grade " + req.gradeLevel());
                });

        FeeStructure structure = FeeStructure.builder()
                .feeType(req.feeType())
                .gradeLevel(req.gradeLevel())
                .amount(req.amount())
                .academicYear(req.academicYear())
                .build();

        return feeStructureRepository.save(structure);
    }

    @Transactional
    public FeeAccountResponse assignFeeToStudent(FeeAccountAssignRequest req) {
        FeeStructure structure = feeStructureRepository.findById(req.feeStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found: " + req.feeStructureId()));

        accountRepository.findByStudentIdAndFeeStructureId(req.studentId(), req.feeStructureId())
                .ifPresent(a -> {
                    throw new IllegalArgumentException("Fee already assigned to student " + req.studentId());
                });

        StudentFeeAccount account = StudentFeeAccount.builder()
                .studentId(req.studentId())
                .feeStructure(structure)
                .totalAmount(structure.getAmount())
                .paidAmount(BigDecimal.ZERO)
                .balanceAmount(structure.getAmount())
                .status(PaymentStatus.PENDING)
                .build();

        return mapToResponse(accountRepository.save(account));
    }

    @Transactional
    public PaymentSlip uploadPaymentSlip(SlipUploadRequest req) {
        StudentFeeAccount account = accountRepository.findById(req.feeAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee account not found: " + req.feeAccountId()));

        if (account.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Fee account is already fully paid");
        }

        PaymentSlip slip = PaymentSlip.builder()
                .feeAccount(account)
                .parentId(req.parentId())
                .slipImageUrl(req.slipImageUrl().trim())
                .amountPaid(req.amountPaid())
                .verificationStatus(SlipStatus.PENDING)
                .build();

        return slipRepository.save(slip);
    }

    @Transactional
    public PaymentReceiptResponse verifyPaymentSlip(Long slipId, SlipVerificationRequest req) {
        PaymentSlip slip = slipRepository.findById(slipId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment slip not found: " + slipId));

        if (slip.getVerificationStatus() != SlipStatus.PENDING) {
            throw new IllegalStateException("Payment slip has already been reviewed");
        }

        slip.setVerificationStatus(req.status());
        slip.setReviewedBy(req.reviewedBy());
        slip.setRemarks(req.remarks());
        slipRepository.save(slip);

        if (req.status() == SlipStatus.REJECTED) {
            return null; // No receipt for rejected slips (Activity Diagram 06)
        }

        // Recalculate balance (UC-06 Step 08 & Activity Diagram 06)
        StudentFeeAccount account = slip.getFeeAccount();
        BigDecimal newPaid = account.getPaidAmount().add(slip.getAmountPaid());
        BigDecimal newBalance = account.getTotalAmount().subtract(newPaid);

        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            account.setBalanceAmount(BigDecimal.ZERO);
            account.setPaidAmount(account.getTotalAmount());
            account.setStatus(PaymentStatus.PAID);
        } else {
            account.setBalanceAmount(newBalance);
            account.setPaidAmount(newPaid);
            account.setStatus(PaymentStatus.PARTIAL);
        }
        accountRepository.save(account);

        String receiptType = account.getStatus() == PaymentStatus.PAID ? "FULL" : "PARTIAL";
        String receiptNumber = "REC-" + account.getFeeStructure().getAcademicYear() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PaymentReceipt receipt = PaymentReceipt.builder()
                .paymentSlip(slip)
                .receiptNumber(receiptNumber)
                .receiptType(receiptType)
                .amount(slip.getAmountPaid())
                .build();

        PaymentReceipt savedReceipt = receiptRepository.save(receipt);
        return new PaymentReceiptResponse(
                savedReceipt.getId(),
                slip.getId(),
                savedReceipt.getReceiptNumber(),
                savedReceipt.getIssuedDate(),
                savedReceipt.getReceiptType(),
                savedReceipt.getAmount()
        );
    }

    public List<FeeAccountResponse> getStudentFeeAccounts(Long studentId) {
        return accountRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PaymentReceiptResponse getReceiptBySlip(Long slipId) {
        return receiptRepository.findByPaymentSlipId(slipId)
                .map(r -> new PaymentReceiptResponse(r.getId(), slipId, r.getReceiptNumber(), r.getIssuedDate(), r.getReceiptType(), r.getAmount()))
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found for slip " + slipId));
    }

    private FeeAccountResponse mapToResponse(StudentFeeAccount a) {
        return new FeeAccountResponse(
                a.getId(),
                a.getStudentId(),
                a.getFeeStructure().getId(),
                a.getFeeStructure().getFeeType(),
                a.getFeeStructure().getGradeLevel(),
                a.getFeeStructure().getAcademicYear(),
                a.getTotalAmount(),
                a.getPaidAmount(),
                a.getBalanceAmount(),
                a.getStatus()
        );
    }
}
