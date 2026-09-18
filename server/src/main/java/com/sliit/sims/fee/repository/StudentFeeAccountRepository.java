// Assigned module owner: IT25103710
package com.sliit.sims.fee.repository;

import com.sliit.sims.fee.model.PaymentStatus;
import com.sliit.sims.fee.model.StudentFeeAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeAccountRepository extends JpaRepository<StudentFeeAccount, Long> {

    List<StudentFeeAccount> findByStudentId(Long studentId);

    List<StudentFeeAccount> findByStudentAdmissionNumber(String studentAdmissionNumber);

    Optional<StudentFeeAccount> findByStudentIdAndFeeStructureId(Long studentId, Long feeStructureId);

    boolean existsByStudentIdAndFeeStructureId(Long studentId, Long feeStructureId);

    List<StudentFeeAccount> findByStatus(PaymentStatus status);

    List<StudentFeeAccount> findByGradeLevel(Integer gradeLevel);

    List<StudentFeeAccount> findByGradeLevelAndAcademicYear(Integer gradeLevel, Integer academicYear);

    List<StudentFeeAccount> findByAcademicYear(Integer academicYear);

    List<StudentFeeAccount> findByStudentIdAndStatusIn(Long studentId, List<PaymentStatus> statuses);

    @Query("SELECT a FROM StudentFeeAccount a WHERE a.status != 'PAID' AND a.status != 'CANCELLED' AND a.dueDate IS NOT NULL AND a.dueDate < :currentDate")
    List<StudentFeeAccount> findOverdueAccounts(@Param("currentDate") LocalDate currentDate);

    long countByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(a.totalAmount), 0) FROM StudentFeeAccount a WHERE a.status != 'CANCELLED'")
    BigDecimal sumTotalInvoiced();

    @Query("SELECT COALESCE(SUM(a.paidAmount), 0) FROM StudentFeeAccount a WHERE a.status != 'CANCELLED'")
    BigDecimal sumTotalPaid();

    @Query("SELECT COALESCE(SUM(a.balanceAmount), 0) FROM StudentFeeAccount a WHERE a.status != 'CANCELLED'")
    BigDecimal sumTotalBalance();

    @Query("SELECT COALESCE(SUM(a.totalAmount), 0) FROM StudentFeeAccount a WHERE a.gradeLevel = :gradeLevel AND a.status != 'CANCELLED'")
    BigDecimal sumTotalInvoicedByGrade(@Param("gradeLevel") Integer gradeLevel);

    @Query("SELECT COALESCE(SUM(a.paidAmount), 0) FROM StudentFeeAccount a WHERE a.gradeLevel = :gradeLevel AND a.status != 'CANCELLED'")
    BigDecimal sumTotalPaidByGrade(@Param("gradeLevel") Integer gradeLevel);

    @Query("SELECT COALESCE(SUM(a.balanceAmount), 0) FROM StudentFeeAccount a WHERE a.gradeLevel = :gradeLevel AND a.status != 'CANCELLED'")
    BigDecimal sumTotalBalanceByGrade(@Param("gradeLevel") Integer gradeLevel);
}
