// Assigned module owner: IT25103710
package com.sliit.sims.fee;

import com.sliit.sims.fee.dto.BankSlipSubmitRequest;
import com.sliit.sims.fee.dto.DirectPaymentRequest;
import com.sliit.sims.fee.dto.FeeStructureCreateRequest;
import com.sliit.sims.fee.dto.StudentFeeAccountAssignRequest;
import com.sliit.sims.fee.dto.FeeStructureResponse;
import com.sliit.sims.fee.dto.StudentFeeAccountResponse;
import com.sliit.sims.fee.model.FeeType;
import com.sliit.sims.fee.model.PaymentMethod;
import com.sliit.sims.fee.repository.FeeStructureRepository;
import com.sliit.sims.fee.service.FeeManagementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class FeePaymentDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(FeePaymentDataSeeder.class);

    private final FeeStructureRepository feeStructureRepository;
    private final FeeManagementService feeService;

    public FeePaymentDataSeeder(FeeStructureRepository feeStructureRepository, FeeManagementService feeService) {
        this.feeStructureRepository = feeStructureRepository;
        this.feeService = feeService;
    }

    @Override
    public void run(String... args) {
        if (feeStructureRepository.count() > 0) {
            log.info("Fee and payment data already seeded. Skipping initialization.");
            return;
        }

        try {
            seedData();
        } catch (Exception e) {
            log.warn("Fee seeder skipped — prerequisite data missing: {}", e.getMessage());
        }
    }

    private void seedData() {
        log.info("Seeding initial Fee & Payment Management sample data...");

        // 1. Create Fee Structures
        FeeStructureResponse g10Tuition = feeService.createFeeStructure(FeeStructureCreateRequest.builder()
                .name("Grade 10 Term 1 Tuition Fee")
                .feeType(FeeType.TUITION)
                .gradeLevel(10)
                .academicYear(2026)
                .term(1)
                .amount(new BigDecimal("25000.00"))
                .dueDate(LocalDate.now().plusDays(30))
                .description("First term tuition fees for academic year 2026")
                .build());

        FeeStructureResponse g10Facility = feeService.createFeeStructure(FeeStructureCreateRequest.builder()
                .name("Grade 10 Annual Facility & Sports Fee")
                .feeType(FeeType.FACILITY)
                .gradeLevel(10)
                .academicYear(2026)
                .term(1)
                .amount(new BigDecimal("8000.00"))
                .dueDate(LocalDate.now().plusDays(15))
                .description("Annual school sports complex and facility development charge")
                .build());

        FeeStructureResponse g11Tuition = feeService.createFeeStructure(FeeStructureCreateRequest.builder()
                .name("Grade 11 Term 1 Tuition Fee")
                .feeType(FeeType.TUITION)
                .gradeLevel(11)
                .academicYear(2026)
                .term(1)
                .amount(new BigDecimal("28000.00"))
                .dueDate(LocalDate.now().plusDays(30))
                .description("First term tuition fees for O/L senior secondary")
                .build());

        FeeStructureResponse schoolLibrary = feeService.createFeeStructure(FeeStructureCreateRequest.builder()
                .name("Annual Library & Digital Lab Resource Fee")
                .feeType(FeeType.LIBRARY)
                .academicYear(2026)
                .amount(new BigDecimal("5000.00"))
                .dueDate(LocalDate.now().plusDays(45))
                .description("Applicable to all enrolled students across school")
                .build());

        log.info("Created 4 sample fee structures.");

        // 2. Assign Fee Structures to Students
        // Student 1: Kasun Perera (Grade 10)
        StudentFeeAccountResponse kasunTuition = feeService.assignFeeToStudent(StudentFeeAccountAssignRequest.builder()
                .studentId(101L)
                .studentAdmissionNumber("WYC-2026-00101")
                .studentName("Kasun Perera")
                .gradeLevel(10)
                .feeStructureId(g10Tuition.getId())
                .remarks("Regular admission")
                .build());

        StudentFeeAccountResponse kasunFacility = feeService.assignFeeToStudent(StudentFeeAccountAssignRequest.builder()
                .studentId(101L)
                .studentAdmissionNumber("WYC-2026-00101")
                .studentName("Kasun Perera")
                .gradeLevel(10)
                .feeStructureId(g10Facility.getId())
                .remarks("Annual facilities")
                .build());

        // Student 2: Nimasha Silva (Grade 10)
        StudentFeeAccountResponse nimashaTuition = feeService.assignFeeToStudent(StudentFeeAccountAssignRequest.builder()
                .studentId(102L)
                .studentAdmissionNumber("WYC-2026-00102")
                .studentName("Nimasha Silva")
                .gradeLevel(10)
                .feeStructureId(g10Tuition.getId())
                .remarks("Regular admission")
                .build());

        // Student 3: Ravindu Fernando (Grade 11)
        StudentFeeAccountResponse ravinduTuition = feeService.assignFeeToStudent(StudentFeeAccountAssignRequest.builder()
                .studentId(103L)
                .studentAdmissionNumber("WYC-2026-00103")
                .studentName("Ravindu Fernando")
                .gradeLevel(11)
                .feeStructureId(g11Tuition.getId())
                .remarks("Senior batch")
                .build());

        log.info("Assigned student fee accounts.");

        // 3. Process Sample Payments
        // Kasun pays tuition in full via Direct Cash payment (creates receipt REC-2026-00001)
        feeService.recordDirectPayment(DirectPaymentRequest.builder()
                .feeAccountId(kasunTuition.getId())
                .amount(new BigDecimal("25000.00"))
                .paymentMethod(PaymentMethod.CASH)
                .transactionReference("CASH-COUNTER-001")
                .paidBy("Mr. Sunil Perera (Father)")
                .recordedBy("Admin")
                .notes("Full cash payment at school accounts counter")
                .build());

        // Kasun pays facility fee partially (Rs. 5,000 paid, Rs. 3,000 remaining balance)
        feeService.recordDirectPayment(DirectPaymentRequest.builder()
                .feeAccountId(kasunFacility.getId())
                .amount(new BigDecimal("5000.00"))
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .transactionReference("BOC-TRF-982341")
                .paidBy("Mr. Sunil Perera (Father)")
                .recordedBy("Admin")
                .notes("Partial payment via online bank transfer")
                .build());

        // Nimasha submits a bank deposit slip (status PENDING verification by Admin)
        feeService.submitBankSlip(BankSlipSubmitRequest.builder()
                .feeAccountId(nimashaTuition.getId())
                .studentId(102L)
                .parentId(202L)
                .paidBy("Mrs. Dilani Silva (Mother)")
                .paymentMethod(PaymentMethod.BANK_DEPOSIT)
                .transactionReference("HNB-DEP-774129")
                .slipImageUrl("/uploads/slips/slip_nimasha_tuition_2026.jpg")
                .amountPaid(new BigDecimal("25000.00"))
                .paymentDate(LocalDateTime.now().minusHours(3))
                .build());

        log.info("Successfully seeded initial fee structures, student accounts, payments, and receipts.");
    }
}
