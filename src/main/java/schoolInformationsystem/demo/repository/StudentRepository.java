package schoolInformationsystem.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import schoolInformationsystem.demo.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
}