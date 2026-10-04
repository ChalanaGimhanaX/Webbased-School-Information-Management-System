// Assigned module owner: IT25100975
package com.sliit.sims.student.repository;

import com.sliit.sims.student.model.AllocationStatus;
import com.sliit.sims.student.model.StudentClassAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentClassAllocationRepository extends JpaRepository<StudentClassAllocation, Long> {
    Optional<StudentClassAllocation> findByStudentIdAndAcademicYearAndStatus(Long studentId, Integer academicYear, AllocationStatus status);
    List<StudentClassAllocation> findByAcademicClassIdAndStatus(Long classId, AllocationStatus status);
    long countByAcademicClassIdAndStatus(Long classId, AllocationStatus status);

    @Query("SELECT a FROM StudentClassAllocation a JOIN FETCH a.student WHERE a.academicClass.id = :classId AND a.status = 'ACTIVE'")
    List<StudentClassAllocation> findActiveAllocationsByClass(@Param("classId") Long classId);
}
