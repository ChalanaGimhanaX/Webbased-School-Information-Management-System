package schoolInformationsystem.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import schoolInformationsystem.demo.model.Attendance;
import schoolInformationsystem.demo.model.Exam;
import schoolInformationsystem.demo.model.Student;
import schoolInformationsystem.demo.model.Subject;
import schoolInformationsystem.demo.model.TeacherAttendance;
import schoolInformationsystem.demo.repository.AttendanceRepository;
import schoolInformationsystem.demo.repository.ExamRepository;
import schoolInformationsystem.demo.repository.StudentRepository;
import schoolInformationsystem.demo.repository.SubjectRepository;
import schoolInformationsystem.demo.repository.TeacherAttendanceRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final TeacherAttendanceRepository teacherAttendanceRepository;

    public DataInitializer(ExamRepository examRepository,
                           StudentRepository studentRepository,
                           SubjectRepository subjectRepository,
                           AttendanceRepository attendanceRepository,
                           TeacherAttendanceRepository teacherAttendanceRepository) {
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.teacherAttendanceRepository = teacherAttendanceRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initial Exams
        if (examRepository.count() == 0) {
            examRepository.save(new Exam("EX-101", "Mid-Year Assessment 2026", "Term 02"));
            examRepository.save(new Exam("EX-102", "First Term Evaluation", "Term 01"));
        }

        // Initial Subjects
        if (subjectRepository.count() == 0) {
            subjectRepository.save(new Subject("SUB-01", "Mathematics", "Mr. K. Perera", "B.Sc. Mathematics, PGDE"));
            subjectRepository.save(new Subject("SUB-02", "Science", "Mrs. S. Silva", "B.Sc. Biological Science"));
            subjectRepository.save(new Subject("SUB-03", "English Language", "Ms. A. Fernando", "BA in English Linguistics"));
            subjectRepository.save(new Subject("SUB-04", "Information Technology", "Mr. D. Wickramasinghe", "B.Sc. Computer Science"));
        }

        // Initial Students
        if (studentRepository.count() == 0) {
            studentRepository.save(new Student("ST-2024-001", "Kasun Bandara", "Grade 10 - Class A", "2009-04-14"));
            studentRepository.save(new Student("ST-2024-002", "Nimali Fonseka", "Grade 10 - Class A", "2009-08-22"));
            studentRepository.save(new Student("ST-2024-003", "Sandun Perera", "Grade 10 - Class A", "2009-01-10"));
            studentRepository.save(new Student("ST-2024-004", "Dinithi Jayasinghe", "Grade 10 - Class A", "2009-11-05"));
        }

        // Initial Student Attendance
        if (attendanceRepository.count() == 0) {
            Attendance a1 = new Attendance();
            a1.setStudentId("ST-2024-001");
            a1.setStudentName("Kasun Bandara");
            a1.setDate("2026-10-02");
            a1.setStatus("Present");
            attendanceRepository.save(a1);

            Attendance a2 = new Attendance();
            a2.setStudentId("ST-2024-002");
            a2.setStudentName("Nimali Fonseka");
            a2.setDate("2026-10-02");
            a2.setStatus("Present");
            attendanceRepository.save(a2);

            Attendance a3 = new Attendance();
            a3.setStudentId("ST-2024-003");
            a3.setStudentName("Sandun Perera");
            a3.setDate("2026-10-02");
            a3.setStatus("Absent");
            attendanceRepository.save(a3);
        }

        // Initial Teacher Attendance
        if (teacherAttendanceRepository.count() == 0) {
            TeacherAttendance ta1 = new TeacherAttendance();
            ta1.setTeacherId("TCH-001");
            ta1.setTeacherName("Mr. K. Perera");
            ta1.setDepartment("Mathematics");
            ta1.setDate("2026-10-02");
            ta1.setStatus("Present");
            teacherAttendanceRepository.save(ta1);

            TeacherAttendance ta2 = new TeacherAttendance();
            ta2.setTeacherId("TCH-002");
            ta2.setTeacherName("Mrs. S. Silva");
            ta2.setDepartment("Science");
            ta2.setDate("2026-10-02");
            ta2.setStatus("Present");
            teacherAttendanceRepository.save(ta2);
        }
    }
}