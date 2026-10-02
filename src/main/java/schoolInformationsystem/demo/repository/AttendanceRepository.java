package schoolInformationsystem.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import schoolInformationsystem.demo.model.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

}