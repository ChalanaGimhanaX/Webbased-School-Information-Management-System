package com.sliit.sims.assistant.service;

import com.sliit.sims.assistant.dto.StudentOverviewResponse;
import com.sliit.sims.assistant.dto.StudentOverviewResponse.Attendance;
import com.sliit.sims.assistant.dto.StudentOverviewResponse.ClassSlot;
import com.sliit.sims.assistant.dto.StudentOverviewResponse.Result;
import com.sliit.sims.attendance.dto.StudentAttendanceSummaryResponse;
import com.sliit.sims.attendance.service.AttendanceService;
import com.sliit.sims.common.auth.model.User;
import com.sliit.sims.common.auth.repository.UserRepository;
import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.exam.model.ExamResult;
import com.sliit.sims.exam.model.Examination;
import com.sliit.sims.exam.repository.ExamResultRepository;
import com.sliit.sims.exam.repository.ExaminationRepository;
import com.sliit.sims.student.model.AcademicClass;
import com.sliit.sims.student.model.AllocationStatus;
import com.sliit.sims.student.model.Student;
import com.sliit.sims.student.model.StudentClassAllocation;
import com.sliit.sims.student.repository.StudentClassAllocationRepository;
import com.sliit.sims.student.repository.StudentRepository;
import com.sliit.sims.teacher.model.Subject;
import com.sliit.sims.teacher.repository.SubjectRepository;
import com.sliit.sims.timetable.dto.StudentTimetableResponse;
import com.sliit.sims.timetable.dto.StudentTimetableSlotDto;
import com.sliit.sims.timetable.service.TimetableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Builds the logged-in student's own academic snapshot. The student is always resolved from the
 * authenticated username (JWT subject) - a client can never ask for another student's data.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentOverviewService {

    private static final List<String> DAY_ORDER =
            List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY");

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentClassAllocationRepository allocationRepository;
    private final AttendanceService attendanceService;
    private final ExamResultRepository examResultRepository;
    private final ExaminationRepository examinationRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableService timetableService;
    private final Clock clock;

    @Transactional
    public StudentOverviewResponse getOverview(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Optional<Student> linked = studentRepository.findByUserId(user.getId());
        if (linked.isEmpty()) {
            // For demo environments where student1 user was seeded without an explicit student.user_id:
            // 1. Try matching by admission number
            linked = studentRepository.findByAdmissionNumber(username);
            // 2. If student1 or demo student, link to the first active student record
            if (linked.isEmpty() && "student1".equalsIgnoreCase(username)) {
                linked = studentRepository.findAll().stream()
                        .filter(s -> (s.getUserId() == null || s.getUserId().equals(user.getId())) && Boolean.TRUE.equals(s.getActive()))
                        .findFirst();
                linked.ifPresent(s -> {
                    s.setUserId(user.getId());
                    studentRepository.save(s);
                });
            }
            if (linked.isEmpty()) {
                return StudentOverviewResponse.unlinked(username);
            }
        }
        Student student = linked.get();

        AcademicClass currentClass = findCurrentClass(student);

        StudentAttendanceSummaryResponse summary = attendanceService.getStudentAttendanceSummary(student.getId());
        Attendance attendance = new Attendance(summary.totalDays(), summary.presentDays(), summary.absentDays(),
                summary.lateDays(), summary.attendancePercentage());

        String timetableStatus = "UNAVAILABLE";
        List<ClassSlot> timetable = List.of();
        if (currentClass != null) {
            try {
                StudentTimetableResponse tt = timetableService.getClassTimetableStudentView(currentClass.getId());
                timetableStatus = tt.status();
                timetable = tt.entries().stream()
                        .sorted(Comparator.comparing((StudentTimetableSlotDto s) -> dayIndex(s.dayOfWeek()))
                                .thenComparing(s -> s.periodNumber() == null ? 0 : s.periodNumber()))
                        .map(s -> new ClassSlot(s.dayOfWeek(), s.periodNumber(), s.startTime(), s.endTime(),
                                s.subjectName(), s.teacherName(), s.roomNumber()))
                        .toList();
            } catch (ResourceNotFoundException ex) {
                log.debug("No timetable for student {}: {}", student.getId(), ex.getMessage());
            }
        }

        return new StudentOverviewResponse(
                username,
                true,
                student.getId(),
                student.getFirstName() + " " + student.getLastName(),
                student.getAdmissionNumber(),
                currentClass != null ? currentClass.getClassName() : null,
                currentClass != null ? currentClass.getGradeLevel() : null,
                currentClass != null ? currentClass.getAcademicYear() : null,
                timetableStatus,
                attendance,
                publishedResults(student.getId()),
                timetable
        );
    }

    /** Active allocation for the current year, otherwise the most recent active allocation. */
    private AcademicClass findCurrentClass(Student student) {
        int year = LocalDate.now(clock).getYear();
        return allocationRepository
                .findByStudentIdAndAcademicYearAndStatus(student.getId(), year, AllocationStatus.ACTIVE)
                .or(() -> allocationRepository
                        .findByStudentIdAndStatusOrderByAcademicYearDesc(student.getId(), AllocationStatus.ACTIVE)
                        .stream().findFirst())
                .map(StudentClassAllocation::getAcademicClass)
                .orElse(null);
    }

    /** Only results that a teacher has published - drafts must never reach the student or the AI. */
    private List<Result> publishedResults(Long studentId) {
        Map<Long, Optional<Examination>> exams = new HashMap<>();
        Map<Long, String> subjects = new HashMap<>();
        return examResultRepository.findPublishedByStudentId(studentId).stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsPublished()))
                .map(r -> toResult(r, exams, subjects))
                .toList();
    }

    private Result toResult(ExamResult r, Map<Long, Optional<Examination>> exams, Map<Long, String> subjects) {
        Long examId = r.getExamPaper().getExamId();
        Optional<Examination> exam = exams.computeIfAbsent(examId, examinationRepository::findById);
        Long subjectId = r.getExamPaper().getSubjectId();
        String subjectName = subjects.computeIfAbsent(subjectId, id -> subjectRepository.findById(id)
                .map(Subject::getSubjectName)
                .orElse("Subject #" + id));
        return new Result(
                exam.map(Examination::getExamName).orElse("Exam #" + examId),
                exam.map(Examination::getTerm).orElse(null),
                exam.map(Examination::getAcademicYear).orElse(null),
                subjectName,
                r.getMarksObtained(),
                r.getExamPaper().getMaxMarks(),
                r.getGrade()
        );
    }

    private static int dayIndex(String day) {
        int i = day == null ? -1 : DAY_ORDER.indexOf(day.toUpperCase());
        return i < 0 ? DAY_ORDER.size() : i;
    }
}
