package schoolInformationsystem.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import schoolInformationsystem.demo.model.Attendance;
import schoolInformationsystem.demo.repository.AttendanceRepository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.LinkedHashMap;
import java.util.Map;

@Controller
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private DataSource dataSource;

    @GetMapping("/mark-attendance")
    public String showAttendancePage() {
        return "mark-attendance";
    }

    @PostMapping("/save-attendance")
    public String saveAttendance(@RequestParam("studentId") String studentId,
                                 @RequestParam("studentName") String studentName,
                                 @RequestParam("date") String date,
                                 @RequestParam("status") String status) {

        String[] ids = studentId.split(",");
        String[] names = studentName.split(",");
        String[] statuses = status.split(",");

        for (int i = 0; i < ids.length; i++) {
            String sid = ids[i].trim();
            if (sid.isEmpty()) continue;
            String rawName = i < names.length ? names[i].trim() : "";
            String cleanName = rawName.replaceAll("[^a-zA-Z\\s]", "");

            Attendance attendance = new Attendance();
            attendance.setStudentId(sid);
            attendance.setStudentName(cleanName);
            attendance.setDate(date);
            attendance.setStatus(i < statuses.length ? statuses[i].trim() : "Present");

            attendanceRepository.save(attendance);
        }

        return "redirect:/view-attendance";
    }

    @GetMapping("/view-attendance")
    public String viewAttendance(Model model) {
        model.addAttribute("attendances", attendanceRepository.findAll());
        return "view-attendance";
    }

    // --- Update Attendance Endpoints ---

    @GetMapping("/update-attendance")
    public String showUpdatePage(@RequestParam("id") Long id, Model model) {
        Attendance attendance = attendanceRepository.findById(id).orElse(null);
        if (attendance == null) {
            return "redirect:/view-attendance?error=notfound";
        }
        model.addAttribute("attendance", attendance);
        return "update-attendance";
    }

    @PostMapping("/update-attendance")
    public String updateAttendance(@RequestParam("id") Long id,
                                   @RequestParam("studentId") String studentId,
                                   @RequestParam("studentName") String studentName,
                                   @RequestParam("date") String date,
                                   @RequestParam("status") String status) {
        Attendance attendance = attendanceRepository.findById(id).orElse(null);
        if (attendance != null) {
            String cleanName = studentName != null ? studentName.replaceAll("[^a-zA-Z\\s]", "").trim() : "";
            attendance.setStudentId(studentId);
            attendance.setStudentName(cleanName);
            attendance.setDate(date);
            attendance.setStatus(status);
            attendanceRepository.save(attendance);
            return "redirect:/view-attendance?updated=true";
        }
        return "redirect:/view-attendance?error=notfound";
    }

    // --- Delete Attendance Endpoints ---

    @GetMapping("/delete-attendance")
    public String showDeletePage(@RequestParam("id") Long id,
                                 @RequestParam(value = "confirm", required = false) Boolean confirm,
                                 Model model) {
        Attendance attendance = attendanceRepository.findById(id).orElse(null);
        if (attendance == null) {
            return "redirect:/view-attendance?error=notfound";
        }
        if (Boolean.TRUE.equals(confirm)) {
            attendanceRepository.deleteById(id);
            return "redirect:/view-attendance?deleted=true";
        }
        model.addAttribute("attendance", attendance);
        return "delete-attendance";
    }

    @PostMapping("/delete-attendance")
    public String deleteAttendance(@RequestParam("id") Long id) {
        if (attendanceRepository.existsById(id)) {
            attendanceRepository.deleteById(id);
            return "redirect:/view-attendance?deleted=true";
        }
        return "redirect:/view-attendance?error=notfound";
    }

    // --- DB Connectivity & System Status Endpoints ---

    @GetMapping("/system-status")
    public String showSystemStatus(Model model) {
        Map<String, Object> status = checkConnectivity();
        model.addAttribute("status", status);
        return "system-status";
    }

    @GetMapping("/api/system-status")
    @ResponseBody
    public Map<String, Object> getSystemStatusApi() {
        return checkConnectivity();
    }

    private Map<String, Object> checkConnectivity() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("apiStatus", "ONLINE");
        status.put("timestamp", java.time.LocalDateTime.now().toString());

        long start = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection()) {
            boolean valid = conn.isValid(2);
            long latency = System.currentTimeMillis() - start;
            DatabaseMetaData metaData = conn.getMetaData();

            status.put("dbConnected", valid);
            status.put("dbStatus", valid ? "CONNECTED" : "UNHEALTHY");
            status.put("databaseProduct", metaData.getDatabaseProductName());
            status.put("databaseVersion", metaData.getDatabaseProductVersion());
            status.put("driverName", metaData.getDriverName());
            status.put("driverVersion", metaData.getDriverVersion());
            status.put("jdbcUrl", metaData.getURL());
            status.put("dbUser", metaData.getUserName());
            status.put("pingLatencyMs", latency);
            status.put("recordCount", attendanceRepository.count());
            status.put("message", "Database connection verified and active.");
        } catch (Exception e) {
            status.put("dbConnected", false);
            status.put("dbStatus", "DISCONNECTED");
            status.put("errorMessage", e.getMessage());
        }
        return status;
    }
}
