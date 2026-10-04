// Assigned module owner: IT25103724
package com.sliit.sims.exam.service;

import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.exam.dto.*;
import com.sliit.sims.exam.model.*;
import com.sliit.sims.exam.repository.ExamPaperRepository;
import com.sliit.sims.exam.repository.ExamResultRepository;
import com.sliit.sims.exam.repository.ExaminationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamService {

    private final ExaminationRepository examRepository;
    private final ExamPaperRepository paperRepository;
    private final ExamResultRepository resultRepository;

    @Transactional
    public Examination createExam(ExamCreateRequest req) {
        examRepository.findByExamNameAndTermAndAcademicYear(req.examName().trim(), req.term(), req.academicYear())
                .ifPresent(e -> {
                    throw new IllegalArgumentException("Exam " + req.examName() + " already exists for term " + req.term());
                });

        Examination exam = Examination.builder()
                .examName(req.examName().trim())
                .term(req.term())
                .academicYear(req.academicYear())
                .status(ExamStatus.DRAFT)
                .build();

        return examRepository.save(exam);
    }

    @Transactional
    public ExamPaper createExamPaper(ExamPaperCreateRequest req) {
        if (!examRepository.existsById(req.examId())) throw new ResourceNotFoundException("Examination not found");
        if (req.maxMarks() != null && req.maxMarks().signum() <= 0) throw new IllegalArgumentException("Maximum marks must be positive");
        paperRepository.findByExamIdAndSubjectIdAndGradeLevel(req.examId(), req.subjectId(), req.gradeLevel())
                .ifPresent(p -> {
                    throw new IllegalArgumentException("Exam paper already exists for this subject and grade");
                });

        ExamPaper paper = ExamPaper.builder()
                .examId(req.examId())
                .subjectId(req.subjectId())
                .gradeLevel(req.gradeLevel())
                .maxMarks(req.maxMarks() != null ? req.maxMarks() : BigDecimal.valueOf(100.00))
                .build();

        return paperRepository.save(paper);
    }

    @Transactional
    public ExamPaperResponse updateExamPaper(Long id, ExamPaperCreateRequest req) {
        ExamPaper paper = paperRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Paper not found"));
        if (!paper.getExamId().equals(req.examId())) throw new IllegalArgumentException("Cannot move a paper to another exam");
        BigDecimal maximum = req.maxMarks() == null ? paper.getMaxMarks() : req.maxMarks();
        if (maximum.signum() <= 0) throw new IllegalArgumentException("Maximum marks must be positive");
        List<ExamResult> results = resultRepository.findByExamPaperId(id);
        if (!results.isEmpty() && (!paper.getSubjectId().equals(req.subjectId()) || !paper.getGradeLevel().equals(req.gradeLevel())))
            throw new IllegalArgumentException("Remove results before changing the paper subject or grade");
        if (results.stream().anyMatch(r -> r.getMarksObtained().compareTo(maximum) > 0)) throw new IllegalArgumentException("Maximum marks cannot be below recorded marks");
        paperRepository.findByExamIdAndSubjectIdAndGradeLevel(req.examId(), req.subjectId(), req.gradeLevel()).filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw new IllegalArgumentException("Paper already exists for this subject and grade"); });
        paper.setSubjectId(req.subjectId());
        paper.setGradeLevel(req.gradeLevel());
        paper.setMaxMarks(maximum);
        paperRepository.save(paper);
        results.forEach(r -> r.setGrade(calculateGrade(r.getMarksObtained().multiply(BigDecimal.valueOf(100)).divide(maximum, 4, RoundingMode.HALF_UP))));
        resultRepository.saveAll(results);
        return new ExamPaperResponse(id, paper.getExamId(), paper.getSubjectId(), paper.getGradeLevel(), paper.getMaxMarks());
    }

    @Transactional
    public List<ExamResultResponse> submitMarksBatch(ExamMarksBatchRequest req) {
        ExamPaper paper = paperRepository.findById(req.examPaperId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam paper not found: " + req.examPaperId()));

        List<ExamResult> savedResults = new ArrayList<>();
        for (ExamMarksEntryDto markDto : req.marks()) {
            if (markDto.marksObtained().signum() < 0 || markDto.marksObtained().compareTo(paper.getMaxMarks()) > 0)
                throw new IllegalArgumentException("Marks must be between zero and the paper maximum");
            String grade = calculateGrade(markDto.marksObtained().multiply(BigDecimal.valueOf(100)).divide(paper.getMaxMarks(), 4, RoundingMode.HALF_UP));

            ExamResult result = resultRepository.findByExamPaperIdAndStudentId(paper.getId(), markDto.studentId())
                    .orElse(ExamResult.builder()
                            .examPaper(paper)
                            .studentId(markDto.studentId())
                            .build());

            result.setMarksObtained(markDto.marksObtained());
            result.setGrade(grade);
            savedResults.add(resultRepository.save(result));
        }

        return savedResults.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void publishExamResults(Long examId) {
        Examination exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found: " + examId));

        exam.setStatus(ExamStatus.PUBLISHED);
        examRepository.save(exam);

        List<ExamPaper> papers = paperRepository.findByExamId(examId);
        for (ExamPaper p : papers) {
            List<ExamResult> results = resultRepository.findByExamPaperId(p.getId());
            results.forEach(r -> r.setIsPublished(true));
            resultRepository.saveAll(results);
        }
    }

    @Transactional
    public ExaminationResponse updateExam(Long examId, ExamUpdateRequest req) {
        Examination exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found: " + examId));

        String examName = req.examName() != null ? req.examName().trim() : exam.getExamName();
        if (examName.isBlank()) {
            throw new IllegalArgumentException("Exam name is required");
        }

        Integer term = req.term() != null ? req.term() : exam.getTerm();
        Integer academicYear = req.academicYear() != null ? req.academicYear() : exam.getAcademicYear();

        examRepository.findByExamNameAndTermAndAcademicYear(examName, term, academicYear)
                .filter(existing -> !existing.getId().equals(examId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Exam " + examName + " already exists for term " + term);
                });

        exam.setExamName(examName);
        exam.setTerm(term);
        exam.setAcademicYear(academicYear);

        Examination saved = examRepository.save(exam);
        return new ExaminationResponse(saved.getId(), saved.getExamName(), saved.getTerm(), saved.getAcademicYear(), saved.getStatus());
    }

    @Transactional
    public void deleteExam(Long examId) {
        Examination exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found: " + examId));

        List<ExamPaper> papers = paperRepository.findByExamId(examId);
        for (ExamPaper paper : papers) {
            resultRepository.deleteAll(resultRepository.findByExamPaperId(paper.getId()));
        }
        paperRepository.deleteAll(papers);
        examRepository.delete(exam);
    }

    @Transactional
    public void deleteExamPaper(Long paperId) {
        ExamPaper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam paper not found: " + paperId));

        resultRepository.deleteAll(resultRepository.findByExamPaperId(paperId));
        paperRepository.delete(paper);
    }

    @Transactional
    public void deleteExamResult(Long resultId) {
        if (!resultRepository.existsById(resultId)) {
            throw new ResourceNotFoundException("Exam result not found: " + resultId);
        }
        resultRepository.deleteById(resultId);
    }

    public StudentExamReportResponse getStudentExamReport(Long studentId, Long examId) {
        Examination exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found: " + examId));

        List<ExamResult> results = resultRepository.findByStudentIdAndExamId(studentId, examId);
        if (results.isEmpty()) {
            throw new ResourceNotFoundException("No published results found for student " + studentId + " in exam " + examId);
        }

        BigDecimal total = results.stream()
                .map(ExamResult::getMarksObtained)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal average = total.divide(BigDecimal.valueOf(results.size()), 2, RoundingMode.HALF_UP);

        return new StudentExamReportResponse(
                studentId,
                exam.getId(),
                exam.getExamName(),
                exam.getTerm(),
                exam.getAcademicYear(),
                total,
                average,
                results.stream().map(this::mapToResponse).toList()
        );
    }

    private String calculateGrade(BigDecimal marks) {
        double m = marks.doubleValue();
        if (m >= 90.0) return "A+";
        if (m >= 75.0) return "A";
        if (m >= 65.0) return "B";
        if (m >= 50.0) return "C";
        if (m >= 35.0) return "S";
        return "F";
    }

    private ExamResultResponse mapToResponse(ExamResult r) {
        return new ExamResultResponse(
                r.getId(),
                r.getExamPaper().getId(),
                r.getStudentId(),
                r.getMarksObtained(),
                r.getGrade(),
                r.getIsPublished()
        );
    }

    public List<ExaminationResponse> getAllExams() {
        return examRepository.findAll().stream()
                .map(e -> new ExaminationResponse(e.getId(), e.getExamName(), e.getTerm(), e.getAcademicYear(), e.getStatus()))
                .toList();
    }

    public ExaminationResponse getExamById(Long id) {
        Examination e = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found: " + id));
        return new ExaminationResponse(e.getId(), e.getExamName(), e.getTerm(), e.getAcademicYear(), e.getStatus());
    }

    public List<ExamPaperResponse> getExamPapers(Long examId) {
        return paperRepository.findByExamId(examId).stream()
                .map(p -> new ExamPaperResponse(p.getId(), p.getExamId(), p.getSubjectId(), p.getGradeLevel(), p.getMaxMarks()))
                .toList();
    }

    public List<ExamResultResponse> getExamPaperResults(Long paperId) {
        return resultRepository.findByExamPaperId(paperId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ExamAnalyticsResponse getExamAnalytics(Long examId) {
        List<ExamResult> results = resultRepository.findAllByExamId(examId);

        int totalEntries = results.size();
        if (totalEntries == 0) {
            return new ExamAnalyticsResponse(0, 0, 0.0, 0.0, 0, 0.0, null, 0.0, 
                    java.util.Map.of(), java.util.Map.of(), java.util.Map.of(), java.util.List.of());
        }

        long evaluatedCandidates = results.stream().map(ExamResult::getStudentId).distinct().count();

        double totalMarks = results.stream()
                .map(r -> r.getMarksObtained().doubleValue())
                .mapToDouble(Double::doubleValue)
                .sum();
        double batchAverage = totalMarks / totalEntries;

        long passedCount = results.stream()
                .filter(r -> r.getMarksObtained().doubleValue() >= 35.0)
                .count();
        double passRate = ((double) passedCount / totalEntries) * 100;

        java.util.Map<String, Long> gradeDistribution = results.stream()
                .collect(java.util.stream.Collectors.groupingBy(ExamResult::getGrade, java.util.stream.Collectors.counting()));
        
        java.util.Map<String, Double> gradePercentages = new java.util.HashMap<>();
        for (java.util.Map.Entry<String, Long> entry : gradeDistribution.entrySet()) {
            gradePercentages.put(entry.getKey(), (entry.getValue() * 100.0) / totalEntries);
        }

        java.util.Map<Long, List<ExamResult>> bySubject = results.stream()
                .collect(java.util.stream.Collectors.groupingBy(r -> r.getExamPaper().getSubjectId()));

        java.util.Map<String, Double> subjectAverages = new java.util.HashMap<>();
        String topSubjectName = null;
        double topSubjectAverage = -1.0;

        for (java.util.Map.Entry<Long, List<ExamResult>> entry : bySubject.entrySet()) {
            double subjTotal = entry.getValue().stream().mapToDouble(r -> r.getMarksObtained().doubleValue()).sum();
            double subjAvg = subjTotal / entry.getValue().size();
            String subjIdStr = String.valueOf(entry.getKey());
            subjectAverages.put(subjIdStr, subjAvg);
            
            if (subjAvg > topSubjectAverage) {
                topSubjectAverage = subjAvg;
                topSubjectName = subjIdStr;
            }
        }

        java.util.Map<Long, List<ExamResult>> byStudent = results.stream()
                .collect(java.util.stream.Collectors.groupingBy(ExamResult::getStudentId));
        
        List<ExamAnalyticsResponse.MeritEntry> unsortedMeritList = new java.util.ArrayList<>();
        for (java.util.Map.Entry<Long, List<ExamResult>> entry : byStudent.entrySet()) {
            double stuTotal = entry.getValue().stream().mapToDouble(r -> r.getMarksObtained().doubleValue()).sum();
            double stuAvg = stuTotal / entry.getValue().size();
            unsortedMeritList.add(new ExamAnalyticsResponse.MeritEntry(entry.getKey(), stuTotal, stuAvg, 0));
        }

        unsortedMeritList.sort(java.util.Comparator.comparingDouble(ExamAnalyticsResponse.MeritEntry::totalMarks).reversed());

        List<ExamAnalyticsResponse.MeritEntry> meritList = new java.util.ArrayList<>();
        int rank = 1;
        for (ExamAnalyticsResponse.MeritEntry me : unsortedMeritList) {
            meritList.add(new ExamAnalyticsResponse.MeritEntry(me.studentId(), me.totalMarks(), me.averageMarks(), rank++));
        }

        double highestAggregate = meritList.isEmpty() ? 0.0 : meritList.get(0).totalMarks();

        return new ExamAnalyticsResponse(
                evaluatedCandidates,
                totalEntries,
                batchAverage,
                passRate,
                passedCount,
                highestAggregate,
                topSubjectName,
                topSubjectAverage,
                gradeDistribution,
                gradePercentages,
                subjectAverages,
                meritList
        );
    }
}
