package com.sliit.sims.exam.controller;

import com.sliit.sims.exam.dto.*;
import com.sliit.sims.exam.model.ExamPaper;
import com.sliit.sims.exam.model.Examination;
import com.sliit.sims.exam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Examination create(@Valid @RequestBody ExamCreateRequest req) {
        return examService.createExam(req);
    }

    @PostMapping("/papers")
    @ResponseStatus(HttpStatus.CREATED)
    public ExamPaper createPaper(@Valid @RequestBody ExamPaperCreateRequest req) {
        return examService.createExamPaper(req);
    }

    @PostMapping("/marks")
    @ResponseStatus(HttpStatus.CREATED)
    public List<ExamResultResponse> submitMarks(@Valid @RequestBody ExamMarksBatchRequest req) {
        return examService.submitMarksBatch(req);
    }

    @PatchMapping("/{id}/publish")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void publish(@PathVariable Long id) {
        examService.publishExamResults(id);
    }

    @GetMapping("/student/{studentId}/exam/{examId}")
    public StudentExamReportResponse getStudentReport(@PathVariable Long studentId, @PathVariable Long examId) {
        return examService.getStudentExamReport(studentId, examId);
    }

    @GetMapping
    public List<ExaminationResponse> getAll() {
        return examService.getAllExams();
    }

    @GetMapping("/{id}")
    public ExaminationResponse getById(@PathVariable Long id) {
        return examService.getExamById(id);
    }

    @GetMapping("/{id}/papers")
    public List<ExamPaperResponse> getExamPapers(@PathVariable Long id) {
        return examService.getExamPapers(id);
    }

    @GetMapping("/papers/{paperId}/results")
    public List<ExamResultResponse> getPaperResults(@PathVariable Long paperId) {
        return examService.getExamPaperResults(paperId);
    }

    @GetMapping("/{id}/analytics")
    public ExamAnalyticsResponse getAnalytics(@PathVariable Long id) {
        return examService.getExamAnalytics(id);
    }
}
