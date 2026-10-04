package schoolInformationsystem.demo.controller;

import schoolInformationsystem.demo.model.TeacherAttendance;
import schoolInformationsystem.demo.repository.TeacherAttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class TeacherAttendanceController {

    @Autowired
    private TeacherAttendanceRepository teacherAttendanceRepository;

    @GetMapping("/teacher-attendance")
    public String showTeacherAttendancePage() {
        return "teacher-attendance";
    }

    @PostMapping("/save-teacher-attendance")
    public String saveTeacherAttendance(@RequestParam("teacherId") String teacherId,
                                        @RequestParam("teacherName") String teacherName,
                                        @RequestParam("department") String department,
                                        @RequestParam("date") String date,
                                        @RequestParam("status") String status) {

        String[] ids = teacherId.split(",");
        String[] names = teacherName.split(",");
        String[] statuses = status.split(",");

        for (int i = 0; i < ids.length; i++) {
            String tid = ids[i].trim();
            if (tid.isEmpty()) continue;
            String rawName = i < names.length ? names[i].trim() : "";
            String cleanName = rawName.replaceAll("[^a-zA-Z\\s]", "").trim();
            String stat = i < statuses.length ? statuses[i].trim() : "Present";

            TeacherAttendance attendance = new TeacherAttendance();
            attendance.setTeacherId(tid);
            attendance.setTeacherName(cleanName.isEmpty() ? rawName : cleanName);
            attendance.setDepartment(department.trim());
            attendance.setDate(date.trim());
            attendance.setStatus(stat);

            teacherAttendanceRepository.save(attendance);
        }
        return "redirect:/view-teacher-attendance";
    }

    @GetMapping("/view-teacher-attendance")
    public String viewTeacherAttendance(Model model) {
        model.addAttribute("teachers", teacherAttendanceRepository.findAll());
        return "view-teacher-attendance";
    }

    @GetMapping("/delete-teacher-attendance/{id}")
    public String deleteTeacherAttendance(@PathVariable("id") Long id) {
        teacherAttendanceRepository.deleteById(id);
        return "redirect:/view-teacher-attendance";
    }

    @GetMapping("/edit-teacher-attendance/{id}")
    public String showEditTeacherPage(@PathVariable("id") Long id, Model model) {
        TeacherAttendance attendance = teacherAttendanceRepository.findById(id).orElse(null);
        model.addAttribute("teacher", attendance);
        return "edit-teacher-attendance";
    }

    @PostMapping("/update-teacher-attendance/{id}")
    public String updateTeacherAttendance(@PathVariable("id") Long id,
                                          @RequestParam("teacherId") String teacherId,
                                          @RequestParam("teacherName") String teacherName,
                                          @RequestParam("department") String department,
                                          @RequestParam("date") String date,
                                          @RequestParam("status") String status) {

        TeacherAttendance attendance = teacherAttendanceRepository.findById(id).orElse(null);
        if (attendance != null) {
            attendance.setTeacherId(teacherId);
            attendance.setTeacherName(teacherName);
            attendance.setDepartment(department);
            attendance.setDate(date);
            attendance.setStatus(status);
            teacherAttendanceRepository.save(attendance);
        }
        return "redirect:/view-teacher-attendance";
    }
}
