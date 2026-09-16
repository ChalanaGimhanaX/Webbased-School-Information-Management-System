package com.sliit.sims.fee.repository;

import com.sliit.sims.fee.model.FeeStructure;
import com.sliit.sims.fee.model.FeeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {

    List<FeeStructure> findByActiveTrue();

    List<FeeStructure> findByAcademicYearAndActiveTrue(Integer academicYear);

    List<FeeStructure> findByGradeLevelAndAcademicYearAndActiveTrue(Integer gradeLevel, Integer academicYear);

    List<FeeStructure> findByFeeTypeAndActiveTrue(FeeType feeType);

    List<FeeStructure> findByGradeLevelIsNullAndAcademicYearAndActiveTrue(Integer academicYear);
}
