package schoolInformationsystem.demo.repository;

import schoolInformationsystem.demo.model.TeacherAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherAttendanceRepository extends JpaRepository<TeacherAttendance, Long> {
}