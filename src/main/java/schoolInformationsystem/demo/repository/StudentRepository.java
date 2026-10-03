package schoolInformationsystem.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import schoolInformationsystem.demo.model.Student;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    
    List<Student> findByClassGrade(String classGrade);
}