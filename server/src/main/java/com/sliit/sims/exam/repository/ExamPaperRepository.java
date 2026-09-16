package com.sliit.sims.exam.repository;

import com.sliit.sims.exam.model.ExamPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamPaperRepository extends JpaRepository<ExamPaper, Long> {
    List<ExamPaper> findByExamId(Long examId);
    Optional<ExamPaper> findByExamIdAndSubjectIdAndGradeLevel(Long examId, Long subjectId, Integer gradeLevel);
}
