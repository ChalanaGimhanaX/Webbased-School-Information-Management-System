package schoolInformationsystem.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import schoolInformationsystem.demo.model.ExamResult;

import java.util.List;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {

    // Fetch marks by exam and subject
    List<ExamResult> findByExam_ExamIdAndSubject_SubjectId(String examId, String subjectId);

    // Fetch all marks for a student in a specific exam (fixes your red line error)
    List<ExamResult> findByStudent_StudentIdAndExam_ExamId(String studentId, String examId);

    // Fetch all results for a given exam
    List<ExamResult> findByExam_ExamId(String examId);
}