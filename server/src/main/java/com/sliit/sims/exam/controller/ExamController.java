// Assigned module owner: IT25103724
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

    @PutMapping("/papers/{id}")
    public ExamPaperResponse updatePaper(@PathVariable Long id, @Valid @RequestBody ExamPaperCreateRequest req) {
        return examService.updateExamPaper(id, req);
    }

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

    @PutMapping("/{id}")
    public ExaminationResponse update(@PathVariable Long id, @Valid @RequestBody ExamUpdateRequest req) {
        return examService.updateExam(id, req);
    }

    @PatchMapping("/{id}/publish")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void publish(@PathVariable Long id) {
        examService.publishExamResults(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        examService.deleteExam(id);
    }

    @DeleteMapping("/papers/{paperId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePaper(@PathVariable Long paperId) {
        examService.deleteExamPaper(paperId);
    }

    @DeleteMapping("/results/{resultId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteResult(@PathVariable Long resultId) {
        examService.deleteExamResult(resultId);
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
