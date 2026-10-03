package schoolInformationsystem.demo.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import schoolInformationsystem.demo.model.Exam;
import schoolInformationsystem.demo.model.ExamResult;
import schoolInformationsystem.demo.model.Student;
import schoolInformationsystem.demo.model.Subject;
import schoolInformationsystem.demo.repository.ExamRepository;
import schoolInformationsystem.demo.repository.ExamResultRepository;
import schoolInformationsystem.demo.repository.StudentRepository;
import schoolInformationsystem.demo.repository.SubjectRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class ExamViewController {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final ExamResultRepository examResultRepository;

    public ExamViewController(ExamRepository examRepository,
                              SubjectRepository subjectRepository,
                              StudentRepository studentRepository,
                              ExamResultRepository examResultRepository) {
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
        this.examResultRepository = examResultRepository;
    }

    @GetMapping({"/", "/exams"})
    public String showExamsDashboard(Model model) {
        List<Exam> exams = examRepository.findAll();
        model.addAttribute("exams", exams);

        long activeStudentsCount = studentRepository.count();
        model.addAttribute("activeStudentsCount", activeStudentsCount);

        long facultyMembersCount = subjectRepository.count();
        model.addAttribute("facultyMembersCount", facultyMembersCount);

        List<ExamResult> allResults = examResultRepository.findAll();
        double overallPassRate = 0.0;
        if (!allResults.isEmpty()) {
            long passedCount = allResults.stream()
                    .filter(r -> r.getMarks() != null && r.getMarks() >= 35.0)
                    .count();
            overallPassRate = Math.round(((double) passedCount / allResults.size()) * 1000.0) / 10.0;
        }
        model.addAttribute("overallPassRate", overallPassRate);

        return "exam-dashboard";
    }

    @PostMapping("/exams/save")
    public String saveExam(@ModelAttribute Exam exam) {
        examRepository.save(exam);
        return "redirect:/exams";
    }

    @PostMapping("/exams/update")
    public String updateExam(@ModelAttribute Exam exam) {
        examRepository.save(exam);
        return "redirect:/exams?updated=true";
    }

    @GetMapping("/exams/delete/{id}")
    public String deleteExam(@PathVariable("id") String examId) {
        List<ExamResult> results = examResultRepository.findByExam_ExamId(examId);
        if (!results.isEmpty()) {
            examResultRepository.deleteAll(results);
        }
        examRepository.deleteById(examId);
        return "redirect:/exams?deleted=true";
    }

    @GetMapping("/marks/entry")
    public String showMarksEntry(@RequestParam(value = "examId", required = false) String examId,
                                 @RequestParam(value = "subjectId", required = false) String subjectId,
                                 @RequestParam(value = "grade", required = false) String grade,
                                 Model model) {
        
        model.addAttribute("exams", examRepository.findAll());
        model.addAttribute("subjects", subjectRepository.findAll());

        List<Student> students;
        if (grade != null && !grade.trim().isEmpty() && !grade.equalsIgnoreCase("ALL")) {
            students = studentRepository.findByClassGrade(grade.trim());
        } else {
            students = studentRepository.findAll();
        }

        model.addAttribute("students", students);
        model.addAttribute("selectedExamId", examId);
        model.addAttribute("selectedSubjectId", subjectId);
        model.addAttribute("selectedGrade", grade);

        return "marks-entry";
    }

    @PostMapping("/marks/save-batch")
    public String saveBatchMarks(@RequestParam("examId") String examId,
                                 @RequestParam("subjectId") String subjectId,
                                 @RequestParam(value = "grade", required = false) String grade,
                                 @RequestParam Map<String, String> allParams,
                                 RedirectAttributes redirectAttributes) {

        Optional<Exam> examOpt = examRepository.findById(examId);
        Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);

        if (examOpt.isPresent() && subjectOpt.isPresent()) {
            Exam exam = examOpt.get();
            Subject subject = subjectOpt.get();

            int savedCount = 0;
            int skippedCount = 0;
//marks Validation (only can enter Marks Betweeen 0 and 100)
            for (Map.Entry<String, String> entry : allParams.entrySet()) {
                if (entry.getKey().startsWith("marks_") && !entry.getValue().trim().isEmpty()) {
                    String studentId = entry.getKey().replace("marks_", "");
                    try {
                        Double marks = Double.parseDouble(entry.getValue().trim());

                        if (marks < 0.0 || marks > 100.0) {
                            skippedCount++;
                            continue;
                        }

                        Optional<Student> studentOpt = studentRepository.findById(studentId);
// Grade Validation (Assigning Grades and Remarks based on Marks)
                        if (studentOpt.isPresent()) {
                            String assignedGrade = "F";
                            String remarks = "Repeat";
                            if (marks >= 75) {
                                assignedGrade = "A";
                                remarks = "Distinction";
                            } else if (marks >= 65) {
                                assignedGrade = "B";
                                remarks = "Very Good";
                            } else if (marks >= 55) {
                                assignedGrade = "C";
                                remarks = "Credit";
                            } else if (marks >= 35) {
                                assignedGrade = "S";
                                remarks = "Simple Pass";
                            }
// Saving or Updating Exam Results
                            Optional<ExamResult> existingResult = examResultRepository
                                    .findByExam_ExamIdAndStudent_StudentIdAndSubject_SubjectId(examId, studentId, subjectId);
                            ExamResult resultToSave;
                            if (existingResult.isPresent()) {
                                resultToSave = existingResult.get();
                            } else {
                                resultToSave = new ExamResult(exam, studentOpt.get(), subject, marks, assignedGrade);
                            }
                            resultToSave.setMarks(marks);
                            resultToSave.setGrade(assignedGrade);
                            resultToSave.setRemarks(remarks);
                            examResultRepository.save(resultToSave);
                            savedCount++;
                        }
                    } catch (NumberFormatException ignored) {
                        skippedCount++;
                    }
                }
            }

            if (skippedCount > 0) {
                redirectAttributes.addFlashAttribute("warningMessage",
                        savedCount + " marks saved. " + skippedCount + " invalid scores skipped.");
            } else {
                redirectAttributes.addFlashAttribute("successMessage", "All marks saved successfully!");
            }
        }

        String redirectUrl = "redirect:/marks/entry?examId=" + examId + "&subjectId=" + subjectId;
        if (grade != null && !grade.trim().isEmpty() && !grade.equalsIgnoreCase("ALL")) {
            redirectUrl += "&grade=" + grade;
        }
        return redirectUrl + "&success=true";
    }
// Displaying Report Card for a Student in a Specific Exam
    @GetMapping("/reports")
    public String showReportCard(@RequestParam(value = "studentId", required = false) String studentId,
                                 @RequestParam(value = "examId", required = false) String examId,
                                 Model model) {
        List<Student> students = studentRepository.findAll();
        List<Exam> exams = examRepository.findAll();

        model.addAttribute("students", students);
        model.addAttribute("exams", exams);
        model.addAttribute("selectedStudentId", studentId);
        model.addAttribute("selectedExamId", examId);
// Fetching Exam Results for the Selected Student and Exam
        List<ExamResult> results = new ArrayList<>();
        double totalMarks = 0.0;
        double averageMarks = 0.0;

        if (studentId != null && !studentId.isEmpty() && examId != null && !examId.isEmpty()) {
            results = examResultRepository.findByStudent_StudentIdAndExam_ExamId(studentId, examId);
            studentRepository.findById(studentId).ifPresent(student -> model.addAttribute("currentStudent", student));
            examRepository.findById(examId).ifPresent(exam -> model.addAttribute("currentExam", exam));

            if (!results.isEmpty()) {
                for (ExamResult res : results) {
                    if (res.getMarks() != null) {
                        totalMarks += res.getMarks();
                    }
                }
                averageMarks = totalMarks / results.size();
            }
        }

        model.addAttribute("results", results);
        model.addAttribute("totalMarks", totalMarks);
        model.addAttribute("averageMarks", Math.round(averageMarks * 10.0) / 10.0);
        return "report-card";
    }

    @GetMapping("/subjects")
    public String showSubjectManagement(Model model) {
        model.addAttribute("subjects", subjectRepository.findAll());
        return "subject-management";
    }

    @PostMapping("/subjects/save")
    public String saveSubject(@ModelAttribute Subject subject) {
        subjectRepository.save(subject);
        return "redirect:/subjects";
    }

    @PostMapping("/subjects/update")
    public String updateSubject(@ModelAttribute Subject subject) {
        subjectRepository.save(subject);
        return "redirect:/subjects?updated=true";
    }

    @GetMapping("/subjects/delete/{id}")
    public String deleteSubject(@PathVariable("id") String subjectId) {
        List<ExamResult> results = examResultRepository.findAll().stream()
                .filter(r -> r.getSubject() != null && r.getSubject().getSubjectId().equals(subjectId))
                .toList();

        if (!results.isEmpty()) {
            examResultRepository.deleteAll(results);
        }
        subjectRepository.deleteById(subjectId);
        return "redirect:/subjects?deleted=true";
    }

    @GetMapping("/analytics")
    public String showClassAnalytics(@RequestParam(value = "examId", required = false) String examId, Model model) {
        List<Exam> exams = examRepository.findAll();
        model.addAttribute("exams", exams);

        if ((examId == null || examId.isEmpty()) && !exams.isEmpty()) {
            examId = exams.get(0).getExamId();
        }
        model.addAttribute("selectedExamId", examId);

        List<ExamResult> results = (examId != null && !examId.isEmpty())
                ? examResultRepository.findByExam_ExamId(examId)
                : new ArrayList<>();

        int totalEntries = results.size();
        long evaluatedCandidates = results.stream().map(r -> r.getStudent().getStudentId()).distinct().count();

        double totalMarksSum = 0;
        long passedCount = 0;
        long gradeA = 0, gradeB = 0, gradeC = 0, gradeS = 0, gradeF = 0;
// Calculating Total Marks, Pass Count, and Grade Distribution
        for (ExamResult r : results) {
            double m = (r.getMarks() != null) ? r.getMarks() : 0.0;
            totalMarksSum += m;
            if (m >= 35.0) passedCount++;

            String g = (r.getGrade() != null) ? r.getGrade() : "F";
            switch (g) {
                case "A" -> gradeA++;
                case "B" -> gradeB++;
                case "C" -> gradeC++;
                case "S" -> gradeS++;
                default -> gradeF++;
            }
        }

        double batchAverage = totalEntries > 0 ? (totalMarksSum / totalEntries) : 0.0;
        double passRate = totalEntries > 0 ? ((double) passedCount / totalEntries) * 100.0 : 0.0;

        Map<String, List<Double>> subjectMarksMap = new HashMap<>();
        for (ExamResult r : results) {
            if (r.getSubject() != null && r.getMarks() != null) {
                String subName = r.getSubject().getSubjectName() + " (" + r.getSubject().getSubjectId() + ")";
                subjectMarksMap.computeIfAbsent(subName, k -> new ArrayList<>()).add(r.getMarks());
            }
        }

        Map<String, Double> subjectAverages = new LinkedHashMap<>();
        String topSubjectName = "N/A";
        double topSubjectAvg = 0.0;

        for (Map.Entry<String, List<Double>> entry : subjectMarksMap.entrySet()) {
            double avg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double roundedAvg = Math.round(avg * 10.0) / 10.0;
            subjectAverages.put(entry.getKey(), roundedAvg);

            if (roundedAvg > topSubjectAvg) {
                topSubjectAvg = roundedAvg;
                topSubjectName = entry.getKey().split(" \\(")[0];
            }
        }

        Map<Student, Double> studentTotals = new HashMap<>();
        Map<Student, Integer> studentCounts = new HashMap<>();
        for (ExamResult r : results) {
            if (r.getStudent() != null && r.getMarks() != null) {
                studentTotals.merge(r.getStudent(), r.getMarks(), Double::sum);
                studentCounts.merge(r.getStudent(), 1, Integer::sum);
            }
        }

        record StudentMerit(String studentId, String fullName, double total, double avg) {}
        List<StudentMerit> meritList = studentTotals.entrySet().stream()
                .map(e -> {
                    double tot = e.getValue();
                    int count = studentCounts.getOrDefault(e.getKey(), 1);
                    double avg = Math.round((tot / count) * 10.0) / 10.0;
                    return new StudentMerit(e.getKey().getStudentId(), e.getKey().getFullName(), tot, avg);
                })
                .sorted(Comparator.comparingDouble(StudentMerit::total).reversed())
                .toList();

        double highestAggregate = !meritList.isEmpty() ? meritList.get(0).total() : 0.0;

        model.addAttribute("evaluatedCandidates", evaluatedCandidates);
        model.addAttribute("totalEntries", totalEntries);
        model.addAttribute("batchAverage", Math.round(batchAverage * 10.0) / 10.0);
        model.addAttribute("passRate", Math.round(passRate * 10.0) / 10.0);
        model.addAttribute("passedCount", passedCount);
        model.addAttribute("highestAggregate", highestAggregate);
        model.addAttribute("topSubjectName", topSubjectName);
        model.addAttribute("topSubjectAvg", topSubjectAvg);

        model.addAttribute("gradeA", gradeA);
        model.addAttribute("gradeB", gradeB);
        model.addAttribute("gradeC", gradeC);
        model.addAttribute("gradeS", gradeS);
        model.addAttribute("gradeF", gradeF);

        model.addAttribute("gradeAPercent", totalEntries > 0 ? Math.round(((double) gradeA / totalEntries) * 1000.0) / 10.0 : 0.0);
        model.addAttribute("gradeBPercent", totalEntries > 0 ? Math.round(((double) gradeB / totalEntries) * 1000.0) / 10.0 : 0.0);
        model.addAttribute("gradeCPercent", totalEntries > 0 ? Math.round(((double) gradeC / totalEntries) * 1000.0) / 10.0 : 0.0);
        model.addAttribute("gradeSPercent", totalEntries > 0 ? Math.round(((double) gradeS / totalEntries) * 1000.0) / 10.0 : 0.0);
        model.addAttribute("gradeFPercent", totalEntries > 0 ? Math.round(((double) gradeF / totalEntries) * 1000.0) / 10.0 : 0.0);

        model.addAttribute("subjectAverages", subjectAverages);
        model.addAttribute("meritList", meritList);

        return "class-analytics";
    }
// Student Portal for Viewing Exam Results
    @GetMapping("/portal")
    public String showStudentPortal(@RequestParam(value = "studentId", required = false) String studentId,
                                    @RequestParam(value = "examId", required = false) String examId,
                                    Authentication authentication,
                                    Model model) {

        model.addAttribute("exams", examRepository.findAll());
        model.addAttribute("students", studentRepository.findAll());

        boolean isRestrictedUser = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT") || a.getAuthority().equals("ROLE_PARENT"));

        model.addAttribute("isRestrictedUser", isRestrictedUser);

        String queryStudentId = studentId;
        if (isRestrictedUser) {
            queryStudentId = "ST-2024-001";
        }

        model.addAttribute("selectedStudentId", queryStudentId);
        model.addAttribute("selectedExamId", examId);

        List<ExamResult> results = new ArrayList<>();
        double totalMarks = 0.0;
        double averageMarks = 0.0;

        if (queryStudentId != null && !queryStudentId.trim().isEmpty() && examId != null && !examId.trim().isEmpty()) {
            results = examResultRepository.findByStudent_StudentIdAndExam_ExamId(queryStudentId.trim(), examId.trim());
            studentRepository.findById(queryStudentId.trim()).ifPresent(s -> model.addAttribute("currentStudent", s));
            examRepository.findById(examId.trim()).ifPresent(e -> model.addAttribute("currentExam", e));

            if (!results.isEmpty()) {
                for (ExamResult res : results) {
                    if (res.getMarks() != null) {
                        totalMarks += res.getMarks();
                    }
                }
                averageMarks = totalMarks / results.size();
            }
        }

        model.addAttribute("results", results);
        model.addAttribute("totalMarks", totalMarks);
        model.addAttribute("averageMarks", Math.round(averageMarks * 10.0) / 10.0);

        return "student-result-portal";
    }
}