package com.sliit.sims.student.repository;

import com.sliit.sims.student.model.AcademicClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicClassRepository extends JpaRepository<AcademicClass, Long> {
    Optional<AcademicClass> findByGradeLevelAndClassNameAndAcademicYear(Integer gradeLevel, String className, Integer academicYear);
    List<AcademicClass> findByAcademicYearOrderByGradeLevelAscClassNameAsc(Integer academicYear);
}
