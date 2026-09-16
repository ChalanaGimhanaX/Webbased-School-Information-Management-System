package com.sliit.sims.fee.repository;

import com.sliit.sims.fee.model.StudentFeeAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeAccountRepository extends JpaRepository<StudentFeeAccount, Long> {
    Optional<StudentFeeAccount> findByStudentIdAndFeeStructureId(Long studentId, Long feeStructureId);
    List<StudentFeeAccount> findByStudentId(Long studentId);
}
