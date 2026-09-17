package com.sliit.sims.exam.repository;

import com.sliit.sims.exam.model.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    Optional<ExamResult> findByExamPaperIdAndStudentId(Long examPaperId, Long studentId);
    List<ExamResult> findByExamPaperId(Long examPaperId);

    @Query("SELECT r FROM ExamResult r JOIN FETCH r.examPaper p WHERE r.studentId = :studentId AND p.examId = :examId")
    List<ExamResult> findByStudentIdAndExamId(@Param("studentId") Long studentId, @Param("examId") Long examId);

    @Query("SELECT r FROM ExamResult r JOIN FETCH r.examPaper p WHERE p.examId = :examId")
    List<ExamResult> findAllByExamId(@Param("examId") Long examId);
}
