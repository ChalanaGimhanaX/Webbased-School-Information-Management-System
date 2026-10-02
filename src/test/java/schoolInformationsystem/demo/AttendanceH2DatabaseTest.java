package schoolInformationsystem.demo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import schoolInformationsystem.demo.controller.AttendanceController;
import schoolInformationsystem.demo.model.Attendance;
import schoolInformationsystem.demo.model.TeacherAttendance;
import schoolInformationsystem.demo.repository.AttendanceRepository;
import schoolInformationsystem.demo.repository.TeacherAttendanceRepository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AttendanceH2DatabaseTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private TeacherAttendanceRepository teacherAttendanceRepository;

    @Autowired
    private AttendanceController attendanceController;

    @Test
    @DisplayName("Verify connection is established with H2 in-memory database")
    void testH2DatabaseConnection() throws Exception {
        assertNotNull(dataSource, "DataSource should not be null");

        try (Connection conn = dataSource.getConnection()) {
            assertNotNull(conn, "Connection should be valid");
            assertTrue(conn.isValid(2), "Connection should be active and valid");

            DatabaseMetaData metaData = conn.getMetaData();
            String productName = metaData.getDatabaseProductName();
            String url = metaData.getURL();

            assertEquals("H2", productName, "Database product name should be H2");
            assertTrue(url.contains("h2:mem"), "JDBC URL should point to H2 in-memory instance: " + url);
        }
    }

    @Test
    @DisplayName("Verify student attendance CRUD operations with H2")
    void testStudentAttendanceCrudOperations() {
        // Create
        Attendance attendance = new Attendance();
        attendance.setStudentId("ST-TEST-001");
        attendance.setStudentName("Test Student");
        attendance.setDate("2026-10-02");
        attendance.setStatus("Present");

        Attendance saved = attendanceRepository.save(attendance);
        assertNotNull(saved.getId(), "Generated ID should not be null");

        // Read
        Optional<Attendance> found = attendanceRepository.findById(saved.getId());
        assertTrue(found.isPresent(), "Saved attendance should be found");
        assertEquals("Test Student", found.get().getStudentName());
        assertEquals("Present", found.get().getStatus());

        // Update
        found.get().setStatus("Absent");
        attendanceRepository.save(found.get());

        Attendance updated = attendanceRepository.findById(saved.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals("Absent", updated.getStatus());

        // Delete
        attendanceRepository.deleteById(saved.getId());
        assertFalse(attendanceRepository.findById(saved.getId()).isPresent(), "Record should be deleted");
    }

    @Test
    @DisplayName("Verify teacher attendance CRUD operations with H2")
    void testTeacherAttendanceCrudOperations() {
        // Create
        TeacherAttendance teacherAttendance = new TeacherAttendance();
        teacherAttendance.setTeacherId("TCH-TEST-001");
        teacherAttendance.setTeacherName("Prof. Tester");
        teacherAttendance.setDepartment("Computer Science");
        teacherAttendance.setDate("2026-10-02");
        teacherAttendance.setStatus("Present");

        TeacherAttendance saved = teacherAttendanceRepository.save(teacherAttendance);
        assertNotNull(saved.getId(), "Generated ID should not be null");

        // Read
        List<TeacherAttendance> list = teacherAttendanceRepository.findAll();
        assertFalse(list.isEmpty(), "Teacher attendance list should not be empty");

        // Update
        saved.setStatus("On Leave");
        teacherAttendanceRepository.save(saved);

        TeacherAttendance updated = teacherAttendanceRepository.findById(saved.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals("On Leave", updated.getStatus());

        // Delete
        teacherAttendanceRepository.deleteById(saved.getId());
        assertFalse(teacherAttendanceRepository.findById(saved.getId()).isPresent(), "Record should be deleted");
    }

    @Test
    @DisplayName("Verify AttendanceController system status endpoint returns H2 status")
    void testSystemStatusEndpoint() {
        Map<String, Object> status = attendanceController.getSystemStatusApi();

        assertNotNull(status, "Status map should not be null");
        assertEquals("ONLINE", status.get("apiStatus"));
        assertEquals(Boolean.TRUE, status.get("dbConnected"));
        assertEquals("CONNECTED", status.get("dbStatus"));
        assertEquals("H2", status.get("databaseProduct"));
        assertTrue(status.get("jdbcUrl").toString().contains("h2:mem"));
    }
}
