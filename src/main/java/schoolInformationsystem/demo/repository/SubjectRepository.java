package schoolInformationsystem.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import schoolInformationsystem.demo.model.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {
}