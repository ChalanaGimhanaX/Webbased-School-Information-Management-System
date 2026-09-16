package com.sliit.sims.fee.service;

import com.sliit.sims.common.exception.PaymentValidationException;
import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.fee.dto.*;
import com.sliit.sims.fee.model.*;
import com.sliit.sims.fee.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeeManagementService {

    private final FeeStructureRepository feeStructureRepository;
    private final StudentFeeAccountRepository feeAccountRepository;
    private final PaymentSlipRepository paymentSlipRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;

    public FeeManagementService(FeeStructureRepository feeStructureRepository,
                                StudentFeeAccountRepository feeAccountRepository,
                                PaymentSlipRepository paymentSlipRepository,
                                PaymentReceiptRepository paymentReceiptRepository) {
        this.feeStructureRepository = feeStructureRepository;
        this.feeAccountRepository = feeAccountRepository;
        this.paymentSlipRepository = paymentSlipRepository;
        this.paymentReceiptRepository = paymentReceiptRepository;
    }

    // ==========================================
    // 1. Fee Structure Management (CRUD)
    // ==========================================

    @Transactional
    public FeeStructureResponse createFeeStructure(FeeStructureCreateRequest req) {
        FeeStructure feeStructure = FeeStructure.builder()
                .name(req.getName())
                .feeType(req.getFeeType())
                .gradeLevel(req.getGradeLevel())
                .academicYear(req.getAcademicYear())
                .term(req.getTerm())
                .amount(req.getAmount())
                .dueDate(req.getDueDate())
                .description(req.getDescription())
                .active(true)
                .build();

        FeeStructure saved = feeStructureRepository.save(feeStructure);
        return FeeStructureResponse.fromEntity(saved);
    }

    public List<FeeStructureResponse> getAllFeeStructures() {
        return feeStructureRepository.findByActiveTrue().stream()
                .map(FeeStructureResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<FeeStructureResponse> getFeeStructuresByAcademicYear(Integer academicYear) {
        return feeStructureRepository.findByAcademicYearAndActiveTrue(academicYear).stream()
                .map(FeeStructureResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<FeeStructureResponse> getFeeStructuresByGradeAndYear(Integer gradeLevel, Integer academicYear) {
        List<FeeStructure> gradeSpecific = feeStructureRepository.findByGradeLevelAndAcademicYearAndActiveTrue(gradeLevel, academicYear);
        List<FeeStructure> general = feeStructureRepository.findByGradeLevelIsNullAndAcademicYearAndActiveTrue(academicYear);

        List<FeeStructure> combined = new ArrayList<>(gradeSpecific);
        combined.addAll(general);

        return combined.stream()
                .map(FeeStructureResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<FeeStructureResponse> getFeeStructuresByType(FeeType feeType) {
        return feeStructureRepository.findByFeeTypeAndActiveTrue(feeType).stream()
                .map(FeeStructureResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public FeeStructureResponse getFeeStructureById(Long id) {
        FeeStructure entity = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found with id: " + id));
        return FeeStructureResponse.fromEntity(entity);
    }

    @Transactional
    public FeeStructureResponse updateFeeStructure(Long id, FeeStructureUpdateRequest req) {
        FeeStructure entity = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found with id: " + id));

        if (req.getName() != null && !req.getName().isBlank()) {
            entity.setName(req.getName());
        }
        if (req.getAmount() != null) {
            if (req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new PaymentValidationException("Fee amount must be greater than zero");
            }
            entity.setAmount(req.getAmount());
        }
        if (req.getDueDate() != null) {
            entity.setDueDate(req.getDueDate());
        }
        if (req.getDescription() != null) {
            entity.setDescription(req.getDescription());
        }
        if (req.getActive() != null) {
            entity.setActive(req.getActive());
        }

        FeeStructure updated = feeStructureRepository.save(entity);
        return FeeStructureResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteFeeStructure(Long id) {
        FeeStructure entity = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found with id: " + id));
        entity.setActive(false);
        feeStructureRepository.save(entity);
    }

    // ==========================================
    // 2. Student Fee Account Allocation (CRUD)
    // ==========================================

    @Transactional
    public StudentFeeAccountResponse assignFeeToStudent(StudentFeeAccountAssignRequest req) {
        FeeStructure feeStructure = feeStructureRepository.findById(req.getFeeStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found with id: " + req.getFeeStructureId()));

        if (!Boolean.TRUE.equals(feeStructure.getActive())) {
            throw new PaymentValidationException("Cannot assign an inactive fee structure");
        }

        if (feeAccountRepository.existsByStudentIdAndFeeStructureId(req.getStudentId(), req.getFeeStructureId())) {
            throw new PaymentValidationException("Student already has an active fee account for this fee structure");
        }

        LocalDate effectiveDueDate = req.getDueDate() != null ? req.getDueDate() : feeStructure.getDueDate();

        StudentFeeAccount account = StudentFeeAccount.builder()
                .studentId(req.getStudentId())
                .studentAdmissionNumber(req.getStudentAdmissionNumber())
                .studentName(req.getStudentName())
                .gradeLevel(req.getGradeLevel())
                .feeStructure(feeStructure)
                .academicYear(feeStructure.getAcademicYear())
                .totalAmount(feeStructure.getAmount())
                .paidAmount(BigDecimal.ZERO)
                .balanceAmount(feeStructure.getAmount())
                .status(PaymentStatus.PENDING)
                .dueDate(effectiveDueDate)
                .remarks(req.getRemarks())
                .build();

        StudentFeeAccount saved = feeAccountRepository.save(account);
        return StudentFeeAccountResponse.fromEntity(saved);
    }

    @Transactional
    public List<StudentFeeAccountResponse> assignFeeToGrade(GradeFeeAssignRequest req) {
        FeeStructure feeStructure = feeStructureRepository.findById(req.getFeeStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found with id: " + req.getFeeStructureId()));

        if (!Boolean.TRUE.equals(feeStructure.getActive())) {
            throw new PaymentValidationException("Cannot assign an inactive fee structure");
        }

        LocalDate effectiveDueDate = req.getDueDate() != null ? req.getDueDate() : feeStructure.getDueDate();
        List<StudentFeeAccount> createdAccounts = new ArrayList<>();

        for (StudentSummaryDto student : req.getStudents()) {
            if (!feeAccountRepository.existsByStudentIdAndFeeStructureId(student.getStudentId(), feeStructure.getId())) {
                StudentFeeAccount account = StudentFeeAccount.builder()
                        .studentId(student.getStudentId())
                        .studentAdmissionNumber(student.getAdmissionNumber())
                        .studentName(student.getStudentName())
                        .gradeLevel(req.getGradeLevel())
                        .feeStructure(feeStructure)
                        .academicYear(feeStructure.getAcademicYear())
                        .totalAmount(feeStructure.getAmount())
                        .paidAmount(BigDecimal.ZERO)
                        .balanceAmount(feeStructure.getAmount())
                        .status(PaymentStatus.PENDING)
                        .dueDate(effectiveDueDate)
                        .remarks(req.getRemarks())
                        .build();
                createdAccounts.add(account);
            }
        }

        List<StudentFeeAccount> saved = feeAccountRepository.saveAll(createdAccounts);
        return saved.stream()
                .map(StudentFeeAccountResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<StudentFeeAccountResponse> getAllFeeAccounts(Long studentId, PaymentStatus status, Integer gradeLevel, Integer academicYear) {
        List<StudentFeeAccount> accounts;

        if (studentId != null) {
            accounts = feeAccountRepository.findByStudentId(studentId);
        } else if (gradeLevel != null && academicYear != null) {
            accounts = feeAccountRepository.findByGradeLevelAndAcademicYear(gradeLevel, academicYear);
        } else if (gradeLevel != null) {
            accounts = feeAccountRepository.findByGradeLevel(gradeLevel);
        } else if (academicYear != null) {
            accounts = feeAccountRepository.findByAcademicYear(academicYear);
        } else if (status != null) {
            accounts = feeAccountRepository.findByStatus(status);
        } else {
            accounts = feeAccountRepository.findAll();
        }

        if (status != null && studentId != null) {
            accounts = accounts.stream().filter(a -> a.getStatus() == status).collect(Collectors.toList());
        }

        return accounts.stream()
                .map(StudentFeeAccountResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public StudentFeeAccountResponse getFeeAccountById(Long id) {
        StudentFeeAccount account = feeAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student fee account not found with id: " + id));
        return StudentFeeAccountResponse.fromEntity(account);
    }

    public List<StudentFeeAccountResponse> getStudentFeeAccounts(Long studentId) {
        return feeAccountRepository.findByStudentId(studentId).stream()
                .map(StudentFeeAccountResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<StudentFeeAccountResponse> getStudentOutstandingAccounts(Long studentId) {
        List<PaymentStatus> outstandingStatuses = Arrays.asList(PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE);
        return feeAccountRepository.findByStudentIdAndStatusIn(studentId, outstandingStatuses).stream()
                .map(StudentFeeAccountResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentFeeAccountResponse updateFeeAccount(Long id, FeeAccountUpdateRequest req) {
        StudentFeeAccount account = feeAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student fee account not found with id: " + id));

        if (account.getStatus() == PaymentStatus.CANCELLED) {
            throw new PaymentValidationException("Cannot modify a cancelled fee account");
        }

        if (req.getTotalAmount() != null) {
            if (req.getTotalAmount().compareTo(account.getPaidAmount()) < 0) {
                throw new PaymentValidationException("New total amount cannot be less than already paid amount (" + account.getPaidAmount() + ")");
            }
            account.setTotalAmount(req.getTotalAmount());
        }
        if (req.getDueDate() != null) {
            account.setDueDate(req.getDueDate());
        }
        if (req.getRemarks() != null) {
            account.setRemarks(req.getRemarks());
        }

        account.recalculateStatus();
        StudentFeeAccount updated = feeAccountRepository.save(account);
        return StudentFeeAccountResponse.fromEntity(updated);
    }

    @Transactional
    public void cancelFeeAccount(Long id) {
        StudentFeeAccount account = feeAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student fee account not found with id: " + id));

        if (account.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            throw new PaymentValidationException("Cannot cancel account with existing payments. Revert payments first.");
        }

        account.setStatus(PaymentStatus.CANCELLED);
        feeAccountRepository.save(account);
    }

    // ==========================================
    // 3. Payment Processing & Slip Verification
    // ==========================================

    @Transactional
    public PaymentReceiptResponse recordDirectPayment(DirectPaymentRequest req) {
        StudentFeeAccount account = feeAccountRepository.findById(req.getFeeAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee account not found with id: " + req.getFeeAccountId()));

        if (account.getStatus() == PaymentStatus.CANCELLED) {
            throw new PaymentValidationException("Cannot record payment for a cancelled fee account");
        }
        if (account.getStatus() == PaymentStatus.PAID) {
            throw new PaymentValidationException("Fee account is already fully paid");
        }
        if (req.getAmount().compareTo(account.getBalanceAmount()) > 0) {
            throw new PaymentValidationException("Payment amount (" + req.getAmount() + ") exceeds remaining balance (" + account.getBalanceAmount() + ")");
        }

        // Create Payment Slip (immediate approval for counter/direct payment)
        String reviewer = req.getRecordedBy() != null ? req.getRecordedBy() : "Admin";
        String payer = req.getPaidBy() != null ? req.getPaidBy() : account.getStudentName();
        String txRef = req.getTransactionReference() != null ? req.getTransactionReference() : generateTransactionReference();

        PaymentSlip slip = PaymentSlip.builder()
                .feeAccount(account)
                .studentId(account.getStudentId())
                .paidBy(payer)
                .paymentMethod(req.getPaymentMethod())
                .transactionReference(txRef)
                .amountPaid(req.getAmount())
                .paymentDate(LocalDateTime.now())
                .verificationStatus(SlipStatus.APPROVED)
                .reviewedBy(reviewer)
                .reviewRemarks(req.getNotes() != null ? req.getNotes() : "Direct payment processed")
                .reviewedAt(LocalDateTime.now())
                .build();

        PaymentSlip savedSlip = paymentSlipRepository.save(slip);

        // Deduct balance on account
        account.applyPayment(req.getAmount());
        feeAccountRepository.save(account);

        // Generate official Receipt
        ReceiptType receiptType = account.getBalanceAmount().compareTo(BigDecimal.ZERO) == 0 ? ReceiptType.FULL : ReceiptType.PARTIAL;
        String receiptNumber = generateReceiptNumber();

        PaymentReceipt receipt = PaymentReceipt.builder()
                .paymentSlip(savedSlip)
                .receiptNumber(receiptNumber)
                .studentId(account.getStudentId())
                .studentAdmissionNumber(account.getStudentAdmissionNumber())
                .studentName(account.getStudentName())
                .feeStructureName(account.getFeeStructure().getName())
                .feeType(account.getFeeStructure().getFeeType())
                .receiptType(receiptType)
                .amountPaid(req.getAmount())
                .remainingBalance(account.getBalanceAmount())
                .issuedDate(LocalDateTime.now())
                .issuedBy(reviewer)
                .notes(req.getNotes())
                .build();

        PaymentReceipt savedReceipt = paymentReceiptRepository.save(receipt);
        savedSlip.setReceipt(savedReceipt);

        return PaymentReceiptResponse.fromEntity(savedReceipt);
    }

    @Transactional
    public PaymentSlipResponse submitBankSlip(BankSlipSubmitRequest req) {
        StudentFeeAccount account = feeAccountRepository.findById(req.getFeeAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee account not found with id: " + req.getFeeAccountId()));

        if (account.getStatus() == PaymentStatus.CANCELLED) {
            throw new PaymentValidationException("Cannot submit payment for a cancelled fee account");
        }
        if (account.getStatus() == PaymentStatus.PAID) {
            throw new PaymentValidationException("Fee account is already fully paid");
        }
        if (req.getAmountPaid().compareTo(account.getBalanceAmount()) > 0) {
            throw new PaymentValidationException("Amount paid (" + req.getAmountPaid() + ") exceeds remaining balance (" + account.getBalanceAmount() + ")");
        }

        paymentSlipRepository.findByTransactionReference(req.getTransactionReference())
                .ifPresent(existing -> {
                    throw new PaymentValidationException("Transaction / slip reference '" + req.getTransactionReference() + "' has already been submitted");
                });

        PaymentSlip slip = PaymentSlip.builder()
                .feeAccount(account)
                .studentId(req.getStudentId())
                .parentId(req.getParentId())
                .paidBy(req.getPaidBy())
                .paymentMethod(req.getPaymentMethod())
                .transactionReference(req.getTransactionReference())
                .slipImageUrl(req.getSlipImageUrl())
                .amountPaid(req.getAmountPaid())
                .paymentDate(req.getPaymentDate() != null ? req.getPaymentDate() : LocalDateTime.now())
                .verificationStatus(SlipStatus.PENDING)
                .build();

        PaymentSlip saved = paymentSlipRepository.save(slip);
        return PaymentSlipResponse.fromEntity(saved);
    }

    @Transactional
    public PaymentSlipResponse verifyPaymentSlip(Long paymentSlipId, SlipVerificationRequest req) {
        PaymentSlip slip = paymentSlipRepository.findById(paymentSlipId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment slip not found with id: " + paymentSlipId));

        if (slip.getVerificationStatus() != SlipStatus.PENDING) {
            throw new PaymentValidationException("Payment slip has already been processed with status: " + slip.getVerificationStatus());
        }

        if (req.getStatus() == SlipStatus.APPROVED) {
            StudentFeeAccount account = slip.getFeeAccount();

            if (account.getStatus() == PaymentStatus.CANCELLED) {
                throw new PaymentValidationException("Associated fee account is cancelled");
            }
            if (slip.getAmountPaid().compareTo(account.getBalanceAmount()) > 0) {
                throw new PaymentValidationException("Approved amount (" + slip.getAmountPaid() + ") exceeds current account balance (" + account.getBalanceAmount() + ")");
            }

            // Update account balance
            account.applyPayment(slip.getAmountPaid());
            feeAccountRepository.save(account);

            // Update slip
            slip.setVerificationStatus(SlipStatus.APPROVED);
            slip.setReviewedBy(req.getReviewedBy());
            slip.setReviewRemarks(req.getReviewRemarks());
            slip.setReviewedAt(LocalDateTime.now());

            // Generate receipt
            ReceiptType receiptType = account.getBalanceAmount().compareTo(BigDecimal.ZERO) == 0 ? ReceiptType.FULL : ReceiptType.PARTIAL;
            String receiptNumber = generateReceiptNumber();

            PaymentReceipt receipt = PaymentReceipt.builder()
                    .paymentSlip(slip)
                    .receiptNumber(receiptNumber)
                    .studentId(account.getStudentId())
                    .studentAdmissionNumber(account.getStudentAdmissionNumber())
                    .studentName(account.getStudentName())
                    .feeStructureName(account.getFeeStructure().getName())
                    .feeType(account.getFeeStructure().getFeeType())
                    .receiptType(receiptType)
                    .amountPaid(slip.getAmountPaid())
                    .remainingBalance(account.getBalanceAmount())
                    .issuedDate(LocalDateTime.now())
                    .issuedBy(req.getReviewedBy())
                    .notes(req.getReviewRemarks())
                    .build();

            paymentReceiptRepository.save(receipt);
            slip.setReceipt(receipt);

        } else if (req.getStatus() == SlipStatus.REJECTED) {
            slip.setVerificationStatus(SlipStatus.REJECTED);
            slip.setReviewedBy(req.getReviewedBy());
            slip.setReviewRemarks(req.getReviewRemarks());
            slip.setReviewedAt(LocalDateTime.now());
        } else {
            throw new PaymentValidationException("Invalid verification status: " + req.getStatus() + ". Must be APPROVED or REJECTED.");
        }

        PaymentSlip updated = paymentSlipRepository.save(slip);
        return PaymentSlipResponse.fromEntity(updated);
    }

    public List<PaymentSlipResponse> getAllPaymentSlips(SlipStatus status, Long studentId) {
        List<PaymentSlip> slips;

        if (status != null && studentId != null) {
            slips = paymentSlipRepository.findByStudentId(studentId).stream()
                    .filter(s -> s.getVerificationStatus() == status)
                    .collect(Collectors.toList());
        } else if (status != null) {
            slips = paymentSlipRepository.findByVerificationStatus(status);
        } else if (studentId != null) {
            slips = paymentSlipRepository.findByStudentId(studentId);
        } else {
            slips = paymentSlipRepository.findAll();
        }

        return slips.stream()
                .map(PaymentSlipResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PaymentSlipResponse getPaymentSlipById(Long id) {
        PaymentSlip slip = paymentSlipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment slip not found with id: " + id));
        return PaymentSlipResponse.fromEntity(slip);
    }

    @Transactional
    public PaymentSlipResponse cancelPayment(Long paymentSlipId, String reason, String cancelledBy) {
        PaymentSlip slip = paymentSlipRepository.findById(paymentSlipId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment slip not found with id: " + paymentSlipId));

        if (slip.getVerificationStatus() == SlipStatus.CANCELLED) {
            throw new PaymentValidationException("Payment slip is already cancelled");
        }

        if (slip.getVerificationStatus() == SlipStatus.APPROVED) {
            // Revert the payment amount from student fee account
            StudentFeeAccount account = slip.getFeeAccount();
            account.revertPayment(slip.getAmountPaid());
            feeAccountRepository.save(account);
        }

        slip.setVerificationStatus(SlipStatus.CANCELLED);
        slip.setReviewRemarks((slip.getReviewRemarks() != null ? slip.getReviewRemarks() + " | " : "") +
                "Cancelled by " + cancelledBy + ": " + reason);
        slip.setReviewedAt(LocalDateTime.now());

        PaymentSlip updated = paymentSlipRepository.save(slip);
        return PaymentSlipResponse.fromEntity(updated);
    }

    // ==========================================
    // 4. Receipt Management
    // ==========================================

    public PaymentReceiptResponse getReceiptByNumber(String receiptNumber) {
        PaymentReceipt receipt = paymentReceiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with number: " + receiptNumber));
        return PaymentReceiptResponse.fromEntity(receipt);
    }

    public PaymentReceiptResponse getReceiptByPaymentSlipId(Long paymentSlipId) {
        PaymentReceipt receipt = paymentReceiptRepository.findByPaymentSlipId(paymentSlipId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found for payment slip id: " + paymentSlipId));
        return PaymentReceiptResponse.fromEntity(receipt);
    }

    public List<PaymentReceiptResponse> getReceiptsByStudentId(Long studentId) {
        return paymentReceiptRepository.findByStudentId(studentId).stream()
                .map(PaymentReceiptResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ==========================================
    // 5. Reports & Financial Summaries
    // ==========================================

    public FinancialSummaryResponse getFinancialSummary() {
        BigDecimal totalInvoiced = feeAccountRepository.sumTotalInvoiced();
        BigDecimal totalCollected = feeAccountRepository.sumTotalPaid();
        BigDecimal totalOutstanding = feeAccountRepository.sumTotalBalance();

        Double collectionRate = 0.0;
        if (totalInvoiced.compareTo(BigDecimal.ZERO) > 0) {
            collectionRate = totalCollected.divide(totalInvoiced, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        long totalAccounts = feeAccountRepository.count();
        long paidCount = feeAccountRepository.countByStatus(PaymentStatus.PAID);
        long partialCount = feeAccountRepository.countByStatus(PaymentStatus.PARTIAL);
        long pendingCount = feeAccountRepository.countByStatus(PaymentStatus.PENDING);
        long overdueCount = feeAccountRepository.findOverdueAccounts(LocalDate.now()).size();

        // Breakdown by fee type
        List<StudentFeeAccount> allAccounts = feeAccountRepository.findAll();
        Map<FeeType, List<StudentFeeAccount>> accountsByType = allAccounts.stream()
                .filter(a -> a.getStatus() != PaymentStatus.CANCELLED && a.getFeeStructure() != null)
                .collect(Collectors.groupingBy(a -> a.getFeeStructure().getFeeType()));

        List<FeeTypeBreakdownDto> feeTypeBreakdowns = new ArrayList<>();
        for (Map.Entry<FeeType, List<StudentFeeAccount>> entry : accountsByType.entrySet()) {
            BigDecimal invoiced = entry.getValue().stream().map(StudentFeeAccount::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal collected = entry.getValue().stream().map(StudentFeeAccount::getPaidAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal outstanding = entry.getValue().stream().map(StudentFeeAccount::getBalanceAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            Double pct = invoiced.compareTo(BigDecimal.ZERO) > 0
                    ? collected.divide(invoiced, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;

            feeTypeBreakdowns.add(FeeTypeBreakdownDto.builder()
                    .feeType(entry.getKey())
                    .totalInvoiced(invoiced)
                    .totalCollected(collected)
                    .totalOutstanding(outstanding)
                    .collectionPercentage(pct)
                    .build());
        }

        // Breakdown by grade level
        Map<Integer, List<StudentFeeAccount>> accountsByGrade = allAccounts.stream()
                .filter(a -> a.getStatus() != PaymentStatus.CANCELLED)
                .collect(Collectors.groupingBy(StudentFeeAccount::getGradeLevel));

        List<GradeBreakdownDto> gradeBreakdowns = new ArrayList<>();
        for (Map.Entry<Integer, List<StudentFeeAccount>> entry : accountsByGrade.entrySet()) {
            BigDecimal invoiced = entry.getValue().stream().map(StudentFeeAccount::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal collected = entry.getValue().stream().map(StudentFeeAccount::getPaidAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal outstanding = entry.getValue().stream().map(StudentFeeAccount::getBalanceAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            Double pct = invoiced.compareTo(BigDecimal.ZERO) > 0
                    ? collected.divide(invoiced, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;

            gradeBreakdowns.add(GradeBreakdownDto.builder()
                    .gradeLevel(entry.getKey())
                    .totalAccounts((long) entry.getValue().size())
                    .totalInvoiced(invoiced)
                    .totalCollected(collected)
                    .totalOutstanding(outstanding)
                    .collectionPercentage(pct)
                    .build());
        }

        // Sort grade breakdowns ascending
        gradeBreakdowns.sort(Comparator.comparing(GradeBreakdownDto::getGradeLevel));

        return FinancialSummaryResponse.builder()
                .totalInvoiced(totalInvoiced)
                .totalCollected(totalCollected)
                .totalOutstanding(totalOutstanding)
                .collectionRatePercentage(collectionRate)
                .totalFeeAccounts(totalAccounts)
                .paidAccountsCount(paidCount)
                .partialAccountsCount(partialCount)
                .pendingAccountsCount(pendingCount)
                .overdueAccountsCount(overdueCount)
                .feeTypeBreakdowns(feeTypeBreakdowns)
                .gradeBreakdowns(gradeBreakdowns)
                .build();
    }

    public List<StudentFeeAccountResponse> getOverdueAccounts() {
        return feeAccountRepository.findOverdueAccounts(LocalDate.now()).stream()
                .map(StudentFeeAccountResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public GradeBreakdownDto getGradeReport(Integer gradeLevel) {
        BigDecimal invoiced = feeAccountRepository.sumTotalInvoicedByGrade(gradeLevel);
        BigDecimal paid = feeAccountRepository.sumTotalPaidByGrade(gradeLevel);
        BigDecimal balance = feeAccountRepository.sumTotalBalanceByGrade(gradeLevel);
        List<StudentFeeAccount> accounts = feeAccountRepository.findByGradeLevel(gradeLevel);

        Double pct = invoiced.compareTo(BigDecimal.ZERO) > 0
                ? paid.divide(invoiced, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        return GradeBreakdownDto.builder()
                .gradeLevel(gradeLevel)
                .totalAccounts((long) accounts.size())
                .totalInvoiced(invoiced)
                .totalCollected(paid)
                .totalOutstanding(balance)
                .collectionPercentage(pct)
                .build();
    }

    // ==========================================
    // Internal Helper Methods
    // ==========================================

    private synchronized String generateReceiptNumber() {
        long count = paymentReceiptRepository.count() + 1;
        int currentYear = LocalDate.now().getYear();
        return String.format("REC-%d-%05d", currentYear, count);
    }

    private String generateTransactionReference() {
        return "TXN-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 1000);
    }
}
