package com.sliit.sims.parent.service;

import com.sliit.sims.attendance.dto.StudentAttendanceSummaryResponse;
import com.sliit.sims.attendance.service.AttendanceService;
import com.sliit.sims.common.auth.model.User;
import com.sliit.sims.common.auth.repository.UserRepository;
import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.exam.model.ExamPaper;
import com.sliit.sims.exam.model.ExamResult;
import com.sliit.sims.exam.model.Examination;
import com.sliit.sims.exam.repository.ExamPaperRepository;
import com.sliit.sims.exam.repository.ExamResultRepository;
import com.sliit.sims.exam.repository.ExaminationRepository;
import com.sliit.sims.parent.dto.ChildAcademicReportResponse;
import com.sliit.sims.parent.dto.ChildAcademicReportResponse.ChildExamCard;
import com.sliit.sims.parent.dto.ChildAcademicReportResponse.ChildSubjectResult;
import com.sliit.sims.parent.model.Parent;
import com.sliit.sims.parent.repository.ParentRepository;
import com.sliit.sims.student.dto.StudentResponse;
import com.sliit.sims.student.model.Student;
import com.sliit.sims.student.model.StudentClassAllocation;
import com.sliit.sims.student.model.AllocationStatus;
import com.sliit.sims.student.repository.StudentClassAllocationRepository;
import com.sliit.sims.student.repository.StudentRepository;
import com.sliit.sims.teacher.model.Subject;
import com.sliit.sims.teacher.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ParentService {

    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final StudentClassAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final ExamResultRepository examResultRepository;
    private final ExaminationRepository examinationRepository;
    private final ExamPaperRepository paperRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceService attendanceService;

    public List<StudentResponse> getChildrenByParentId(Long parentId) {
        List<Student> students = studentRepository.findByParentId(parentId);
        int currentYear = LocalDate.now().getYear();

        return students.stream()
                .filter(s -> Boolean.TRUE.equals(s.getActive()))
                .map(s -> mapToStudentResponse(s, currentYear))
                .toList();
    }

    public List<StudentResponse> getChildrenByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Parent parent = parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No parent profile found for user: " + username));

        return getChildrenByParentId(parent.getId());
    }

    public ChildAcademicReportResponse getChildAcademicReport(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        int currentYear = LocalDate.now().getYear();
        Optional<StudentClassAllocation> alloc = allocationRepository
                .findByStudentIdAndAcademicYearAndStatus(student.getId(), currentYear, AllocationStatus.ACTIVE)
                .or(() -> allocationRepository.findByStudentIdAndStatusOrderByAcademicYearDesc(student.getId(), AllocationStatus.ACTIVE).stream().findFirst());

        String className = alloc.map(a -> a.getAcademicClass().getClassName()).orElse("Unassigned");
        Integer gradeLevel = alloc.map(a -> a.getAcademicClass().getGradeLevel()).orElse(null);

        // Attendance
        StudentAttendanceSummaryResponse att = attendanceService.getStudentAttendanceSummary(studentId);

        // Published Exam Results
        List<ExamResult> publishedResults = examResultRepository.findPublishedByStudentId(studentId);

        // Group results by exam
        Map<Long, List<ExamResult>> byExamId = new LinkedHashMap<>();
        for (ExamResult r : publishedResults) {
            Long examId = r.getExamPaper().getExamId();
            byExamId.computeIfAbsent(examId, k -> new ArrayList<>()).add(r);
        }

        List<ChildExamCard> examCards = new ArrayList<>();
        for (Map.Entry<Long, List<ExamResult>> entry : byExamId.entrySet()) {
            Long examId = entry.getKey();
            List<ExamResult> results = entry.getValue();

            Optional<Examination> examOpt = examinationRepository.findById(examId);
            String examName = examOpt.map(Examination::getExamName).orElse("Exam #" + examId);
            Integer term = examOpt.map(Examination::getTerm).orElse(1);
            Integer year = examOpt.map(Examination::getAcademicYear).orElse(currentYear);

            BigDecimal total = BigDecimal.ZERO;
            List<ChildSubjectResult> subjectResults = new ArrayList<>();

            for (ExamResult r : results) {
                ExamPaper paper = r.getExamPaper();
                Long subjectId = paper.getSubjectId();
                Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
                String subjectName = subjectOpt.map(Subject::getSubjectName).orElse("Subject #" + subjectId);
                String subjectCode = subjectOpt.map(Subject::getSubjectCode).orElse("SUB-" + subjectId);

                BigDecimal marks = r.getMarksObtained() != null ? r.getMarksObtained() : BigDecimal.ZERO;
                BigDecimal max = paper.getMaxMarks() != null ? paper.getMaxMarks() : BigDecimal.valueOf(100);
                total = total.add(marks);

                String remarks = getRemarksForGrade(r.getGrade(), marks);
                subjectResults.add(new ChildSubjectResult(
                        paper.getId(),
                        subjectId,
                        subjectName,
                        subjectCode,
                        marks,
                        max,
                        r.getGrade(),
                        remarks
                ));
            }

            BigDecimal average = results.isEmpty() ? BigDecimal.ZERO :
                    total.divide(BigDecimal.valueOf(results.size()), 1, RoundingMode.HALF_UP);

            String overallStatus;
            if (average.doubleValue() >= 75.0) {
                overallStatus = "DISTINCTION";
            } else if (average.doubleValue() >= 35.0) {
                overallStatus = "PASS";
            } else {
                overallStatus = "FAIL";
            }

            examCards.add(new ChildExamCard(
                    examId,
                    examName,
                    term,
                    year,
                    total,
                    average,
                    overallStatus,
                    subjectResults
            ));
        }

        return new ChildAcademicReportResponse(
                student.getId(),
                student.getFirstName() + " " + student.getLastName(),
                student.getAdmissionNumber(),
                className,
                gradeLevel,
                att.attendancePercentage(),
                att.presentDays() + att.lateDays(),
                att.totalDays(),
                examCards
        );
    }

    private String getRemarksForGrade(String grade, BigDecimal marks) {
        if (grade == null) return "Ungraded";
        return switch (grade.toUpperCase()) {
            case "A+" -> "Outstanding Achievement";
            case "A" -> "Distinction";
            case "B" -> "Very Good Pass";
            case "C" -> "Credit Pass";
            case "S" -> "Ordinary Pass";
            case "F" -> "Needs Improvement";
            default -> marks.doubleValue() >= 35.0 ? "Pass" : "Fail";
        };
    }

    private StudentResponse mapToStudentResponse(Student s, int currentYear) {
        var allocOpt = allocationRepository.findByStudentIdAndAcademicYearAndStatus(s.getId(), currentYear, AllocationStatus.ACTIVE);
        String className = allocOpt.map(a -> a.getAcademicClass().getClassName()).orElse("Unallocated");
        Integer grade = allocOpt.map(a -> a.getAcademicClass().getGradeLevel()).orElse(null);

        return new StudentResponse(
                s.getId(),
                s.getAdmissionNumber(),
                s.getFirstName(),
                s.getLastName(),
                s.getDob(),
                s.getGender().name(),
                s.getParentId(),
                className,
                grade
        );
    }
}

