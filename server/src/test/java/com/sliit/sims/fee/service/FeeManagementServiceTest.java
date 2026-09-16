package com.sliit.sims.fee.service;

import com.sliit.sims.common.exception.PaymentValidationException;
import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.fee.dto.*;
import com.sliit.sims.fee.model.*;
import com.sliit.sims.fee.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeeManagementServiceTest {

    @Mock
    private FeeStructureRepository feeStructureRepository;

    @Mock
    private StudentFeeAccountRepository feeAccountRepository;

    @Mock
    private PaymentSlipRepository paymentSlipRepository;

    @Mock
    private PaymentReceiptRepository paymentReceiptRepository;

    @InjectMocks
    private FeeManagementService feeService;

    private FeeStructure sampleFeeStructure;
    private StudentFeeAccount sampleAccount;

    @BeforeEach
    void setUp() {
        sampleFeeStructure = FeeStructure.builder()
                .id(1L)
                .name("Grade 10 Tuition Fee")
                .feeType(FeeType.TUITION)
                .gradeLevel(10)
                .academicYear(2026)
                .term(1)
                .amount(new BigDecimal("25000.00"))
                .dueDate(LocalDate.now().plusDays(30))
                .active(true)
                .build();

        sampleAccount = StudentFeeAccount.builder()
                .id(10L)
                .studentId(101L)
                .studentAdmissionNumber("WYC-2026-00101")
                .studentName("Kasun Perera")
                .gradeLevel(10)
                .feeStructure(sampleFeeStructure)
                .academicYear(2026)
                .totalAmount(new BigDecimal("25000.00"))
                .paidAmount(BigDecimal.ZERO)
                .balanceAmount(new BigDecimal("25000.00"))
                .status(PaymentStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(30))
                .build();
    }

    @Test
    @DisplayName("Should create fee structure successfully")
    void testCreateFeeStructure_Success() {
        FeeStructureCreateRequest req = FeeStructureCreateRequest.builder()
                .name("Grade 10 Tuition Fee")
                .feeType(FeeType.TUITION)
                .gradeLevel(10)
                .academicYear(2026)
                .term(1)
                .amount(new BigDecimal("25000.00"))
                .dueDate(LocalDate.now().plusDays(30))
                .build();

        when(feeStructureRepository.save(any(FeeStructure.class))).thenReturn(sampleFeeStructure);

        FeeStructureResponse response = feeService.createFeeStructure(req);

        assertNotNull(response);
        assertEquals("Grade 10 Tuition Fee", response.getName());
        assertEquals(new BigDecimal("25000.00"), response.getAmount());
        assertEquals(FeeType.TUITION, response.getFeeType());
        verify(feeStructureRepository, times(1)).save(any(FeeStructure.class));
    }

    @Test
    @DisplayName("Should assign fee to an individual student successfully")
    void testAssignFeeToStudent_Success() {
        StudentFeeAccountAssignRequest req = StudentFeeAccountAssignRequest.builder()
                .studentId(101L)
                .studentAdmissionNumber("WYC-2026-00101")
                .studentName("Kasun Perera")
                .gradeLevel(10)
                .feeStructureId(1L)
                .build();

        when(feeStructureRepository.findById(1L)).thenReturn(Optional.of(sampleFeeStructure));
        when(feeAccountRepository.existsByStudentIdAndFeeStructureId(101L, 1L)).thenReturn(false);
        when(feeAccountRepository.save(any(StudentFeeAccount.class))).thenReturn(sampleAccount);

        StudentFeeAccountResponse response = feeService.assignFeeToStudent(req);

        assertNotNull(response);
        assertEquals(101L, response.getStudentId());
        assertEquals(new BigDecimal("25000.00"), response.getTotalAmount());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        verify(feeAccountRepository, times(1)).save(any(StudentFeeAccount.class));
    }

    @Test
    @DisplayName("Should reject assigning fee if student already has account for that fee")
    void testAssignFeeToStudent_DuplicateThrowsException() {
        StudentFeeAccountAssignRequest req = StudentFeeAccountAssignRequest.builder()
                .studentId(101L)
                .studentAdmissionNumber("WYC-2026-00101")
                .studentName("Kasun Perera")
                .gradeLevel(10)
                .feeStructureId(1L)
                .build();

        when(feeStructureRepository.findById(1L)).thenReturn(Optional.of(sampleFeeStructure));
        when(feeAccountRepository.existsByStudentIdAndFeeStructureId(101L, 1L)).thenReturn(true);

        assertThrows(PaymentValidationException.class, () -> feeService.assignFeeToStudent(req));
        verify(feeAccountRepository, never()).save(any(StudentFeeAccount.class));
    }

    @Test
    @DisplayName("Should record full direct payment and generate receipt")
    void testRecordDirectPayment_FullPayment() {
        DirectPaymentRequest req = DirectPaymentRequest.builder()
                .feeAccountId(10L)
                .amount(new BigDecimal("25000.00"))
                .paymentMethod(PaymentMethod.CASH)
                .transactionReference("CASH-REC-01")
                .paidBy("Mr. Sunil Perera")
                .recordedBy("Admin")
                .notes("Settled in full")
                .build();

        when(feeAccountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(paymentSlipRepository.save(any(PaymentSlip.class))).thenAnswer(i -> {
            PaymentSlip slip = i.getArgument(0);
            slip.setId(50L);
            return slip;
        });
        when(paymentReceiptRepository.count()).thenReturn(0L);
        when(paymentReceiptRepository.save(any(PaymentReceipt.class))).thenAnswer(i -> {
            PaymentReceipt r = i.getArgument(0);
            r.setId(100L);
            return r;
        });

        PaymentReceiptResponse receipt = feeService.recordDirectPayment(req);

        assertNotNull(receipt);
        assertEquals(new BigDecimal("25000.00"), receipt.getAmountPaid());
        assertEquals(BigDecimal.ZERO, receipt.getRemainingBalance());
        assertEquals(ReceiptType.FULL, receipt.getReceiptType());
        assertEquals(PaymentStatus.PAID, sampleAccount.getStatus());
        assertEquals(BigDecimal.ZERO, sampleAccount.getBalanceAmount());
        verify(feeAccountRepository, times(1)).save(sampleAccount);
    }

    @Test
    @DisplayName("Should record partial direct payment with remaining balance")
    void testRecordDirectPayment_PartialPayment() {
        DirectPaymentRequest req = DirectPaymentRequest.builder()
                .feeAccountId(10L)
                .amount(new BigDecimal("10000.00"))
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .paidBy("Kasun Perera")
                .recordedBy("Admin")
                .build();

        when(feeAccountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(paymentSlipRepository.save(any(PaymentSlip.class))).thenAnswer(i -> {
            PaymentSlip slip = i.getArgument(0);
            slip.setId(51L);
            return slip;
        });
        when(paymentReceiptRepository.count()).thenReturn(1L);
        when(paymentReceiptRepository.save(any(PaymentReceipt.class))).thenAnswer(i -> {
            PaymentReceipt r = i.getArgument(0);
            r.setId(101L);
            return r;
        });

        PaymentReceiptResponse receipt = feeService.recordDirectPayment(req);

        assertNotNull(receipt);
        assertEquals(new BigDecimal("10000.00"), receipt.getAmountPaid());
        assertEquals(new BigDecimal("15000.00"), receipt.getRemainingBalance());
        assertEquals(ReceiptType.PARTIAL, receipt.getReceiptType());
        assertEquals(PaymentStatus.PARTIAL, sampleAccount.getStatus());
        assertEquals(new BigDecimal("15000.00"), sampleAccount.getBalanceAmount());
    }

    @Test
    @DisplayName("Should reject payment exceeding balance")
    void testRecordDirectPayment_OverpaymentThrowsException() {
        DirectPaymentRequest req = DirectPaymentRequest.builder()
                .feeAccountId(10L)
                .amount(new BigDecimal("30000.00"))
                .paymentMethod(PaymentMethod.CASH)
                .build();

        when(feeAccountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));

        assertThrows(PaymentValidationException.class, () -> feeService.recordDirectPayment(req));
        verify(paymentSlipRepository, never()).save(any(PaymentSlip.class));
    }

    @Test
    @DisplayName("Should submit bank slip in PENDING state")
    void testSubmitBankSlip_PendingStatus() {
        BankSlipSubmitRequest req = BankSlipSubmitRequest.builder()
                .feeAccountId(10L)
                .studentId(101L)
                .paidBy("Parent")
                .paymentMethod(PaymentMethod.BANK_DEPOSIT)
                .transactionReference("SLIP-998811")
                .slipImageUrl("/slips/slip1.jpg")
                .amountPaid(new BigDecimal("25000.00"))
                .build();

        when(feeAccountRepository.findById(10L)).thenReturn(Optional.of(sampleAccount));
        when(paymentSlipRepository.findByTransactionReference("SLIP-998811")).thenReturn(Optional.empty());
        when(paymentSlipRepository.save(any(PaymentSlip.class))).thenAnswer(i -> {
            PaymentSlip slip = i.getArgument(0);
            slip.setId(60L);
            return slip;
        });

        PaymentSlipResponse response = feeService.submitBankSlip(req);

        assertNotNull(response);
        assertEquals(SlipStatus.PENDING, response.getVerificationStatus());
        assertEquals("SLIP-998811", response.getTransactionReference());
        // Balance must not be deducted while pending
        assertEquals(new BigDecimal("25000.00"), sampleAccount.getBalanceAmount());
    }

    @Test
    @DisplayName("Should verify and approve bank slip, updating balance and issuing receipt")
    void testVerifyPaymentSlip_Approve() {
        PaymentSlip pendingSlip = PaymentSlip.builder()
                .id(60L)
                .feeAccount(sampleAccount)
                .studentId(101L)
                .amountPaid(new BigDecimal("25000.00"))
                .verificationStatus(SlipStatus.PENDING)
                .build();

        SlipVerificationRequest verifyReq = SlipVerificationRequest.builder()
                .status(SlipStatus.APPROVED)
                .reviewedBy("Admin")
                .reviewRemarks("Bank deposit verified with statement")
                .build();

        when(paymentSlipRepository.findById(60L)).thenReturn(Optional.of(pendingSlip));
        when(paymentReceiptRepository.count()).thenReturn(2L);
        when(paymentSlipRepository.save(any(PaymentSlip.class))).thenReturn(pendingSlip);

        PaymentSlipResponse response = feeService.verifyPaymentSlip(60L, verifyReq);

        assertNotNull(response);
        assertEquals(SlipStatus.APPROVED, response.getVerificationStatus());
        assertEquals(PaymentStatus.PAID, sampleAccount.getStatus());
        assertEquals(BigDecimal.ZERO, sampleAccount.getBalanceAmount());
        verify(paymentReceiptRepository, times(1)).save(any(PaymentReceipt.class));
    }

    @Test
    @DisplayName("Should verify and reject bank slip without deducting balance")
    void testVerifyPaymentSlip_Reject() {
        PaymentSlip pendingSlip = PaymentSlip.builder()
                .id(61L)
                .feeAccount(sampleAccount)
                .studentId(101L)
                .amountPaid(new BigDecimal("25000.00"))
                .verificationStatus(SlipStatus.PENDING)
                .build();

        SlipVerificationRequest verifyReq = SlipVerificationRequest.builder()
                .status(SlipStatus.REJECTED)
                .reviewedBy("Admin")
                .reviewRemarks("Blurry slip image, unreadable bank stamp")
                .build();

        when(paymentSlipRepository.findById(61L)).thenReturn(Optional.of(pendingSlip));
        when(paymentSlipRepository.save(any(PaymentSlip.class))).thenReturn(pendingSlip);

        PaymentSlipResponse response = feeService.verifyPaymentSlip(61L, verifyReq);

        assertNotNull(response);
        assertEquals(SlipStatus.REJECTED, response.getVerificationStatus());
        assertEquals(new BigDecimal("25000.00"), sampleAccount.getBalanceAmount());
        verify(paymentReceiptRepository, never()).save(any(PaymentReceipt.class));
    }

    @Test
    @DisplayName("Should cancel approved payment and revert account balance")
    void testCancelPayment_ApprovedPayment_RevertsBalance() {
        sampleAccount.applyPayment(new BigDecimal("25000.00")); // Now paid
        assertEquals(PaymentStatus.PAID, sampleAccount.getStatus());

        PaymentSlip approvedSlip = PaymentSlip.builder()
                .id(70L)
                .feeAccount(sampleAccount)
                .studentId(101L)
                .amountPaid(new BigDecimal("25000.00"))
                .verificationStatus(SlipStatus.APPROVED)
                .build();

        when(paymentSlipRepository.findById(70L)).thenReturn(Optional.of(approvedSlip));
        when(paymentSlipRepository.save(any(PaymentSlip.class))).thenReturn(approvedSlip);

        PaymentSlipResponse cancelled = feeService.cancelPayment(70L, "Duplicate cheque entry", "Admin");

        assertNotNull(cancelled);
        assertEquals(SlipStatus.CANCELLED, approvedSlip.getVerificationStatus());
        // Balance reverted back to 25000.00 and status PENDING
        assertEquals(new BigDecimal("25000.00"), sampleAccount.getBalanceAmount());
        assertEquals(PaymentStatus.PENDING, sampleAccount.getStatus());
        verify(feeAccountRepository, times(1)).save(sampleAccount);
    }

    @Test
    @DisplayName("Should compute financial summary and collection rate percentage correctly")
    void testGetFinancialSummary_AccurateAggregations() {
        when(feeAccountRepository.sumTotalInvoiced()).thenReturn(new BigDecimal("100000.00"));
        when(feeAccountRepository.sumTotalPaid()).thenReturn(new BigDecimal("60000.00"));
        when(feeAccountRepository.sumTotalBalance()).thenReturn(new BigDecimal("40000.00"));
        when(feeAccountRepository.count()).thenReturn(4L);
        when(feeAccountRepository.countByStatus(PaymentStatus.PAID)).thenReturn(2L);
        when(feeAccountRepository.countByStatus(PaymentStatus.PARTIAL)).thenReturn(1L);
        when(feeAccountRepository.countByStatus(PaymentStatus.PENDING)).thenReturn(1L);
        when(feeAccountRepository.findOverdueAccounts(any(LocalDate.class))).thenReturn(Collections.emptyList());
        when(feeAccountRepository.findAll()).thenReturn(List.of(sampleAccount));

        FinancialSummaryResponse summary = feeService.getFinancialSummary();

        assertNotNull(summary);
        assertEquals(new BigDecimal("100000.00"), summary.getTotalInvoiced());
        assertEquals(new BigDecimal("60000.00"), summary.getTotalCollected());
        assertEquals(new BigDecimal("40000.00"), summary.getTotalOutstanding());
        assertEquals(60.0, summary.getCollectionRatePercentage());
        assertEquals(4L, summary.getTotalFeeAccounts());
        assertEquals(2L, summary.getPaidAccountsCount());
    }
}
