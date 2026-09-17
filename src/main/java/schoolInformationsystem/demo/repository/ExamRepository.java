package schoolInformationsystem.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import schoolInformationsystem.demo.model.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, String> {
}