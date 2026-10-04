// Assigned module owner: IT25103724
package com.sliit.sims.exam.repository;

import com.sliit.sims.exam.model.ExamStatus;
import com.sliit.sims.exam.model.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Long> {
    Optional<Examination> findByExamNameAndTermAndAcademicYear(String examName, Integer term, Integer academicYear);
    List<Examination> findByAcademicYearAndStatus(Integer academicYear, ExamStatus status);
}
