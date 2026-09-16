package com.sliit.sims.fee.repository;

import com.sliit.sims.fee.model.FeeStructure;
import com.sliit.sims.fee.model.FeeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    Optional<FeeStructure> findByFeeTypeAndGradeLevelAndAcademicYear(FeeType feeType, Integer gradeLevel, Integer academicYear);
    List<FeeStructure> findByAcademicYear(Integer academicYear);
}
