package com.sliit.sims.teacher.controller;

import com.sliit.sims.teacher.dto.*;
import com.sliit.sims.teacher.model.TeacherStatus;
import com.sliit.sims.teacher.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherResponse register(@Valid @RequestBody TeacherRegisterRequest req) {
        return teacherService.registerTeacher(req);
    }

    @GetMapping
    public List<TeacherResponse> getAll(@RequestParam(required = false) TeacherStatus status) {
        return teacherService.getAllTeachers(status);
    }

    @GetMapping("/{id}")
    public TeacherResponse getById(@PathVariable Long id) {
        return teacherService.getTeacherById(id);
    }

    @PatchMapping("/{id}/status")
    public TeacherResponse updateStatus(@PathVariable Long id, @RequestParam TeacherStatus status) {
        return teacherService.updateStatus(id, status);
    }

    @PostMapping("/assign-subject")
    @ResponseStatus(HttpStatus.OK)
    public void assignSubject(@Valid @RequestBody TeacherSubjectAssignRequest req) {
        teacherService.assignSubject(req);
    }

    @PostMapping("/subjects")
    @ResponseStatus(HttpStatus.CREATED)
    public SubjectResponse createSubject(@Valid @RequestBody SubjectCreateRequest req) {
        return teacherService.createSubject(req);
    }

    @GetMapping("/subjects")
    public List<SubjectResponse> getSubjects(@RequestParam(required = false) Integer grade) {
        if (grade != null) {
            return teacherService.getSubjectsByGrade(grade);
        }
        return teacherService.getAllSubjects();
    }

    @PutMapping("/{id}")
    public TeacherResponse update(@PathVariable Long id, @Valid @RequestBody TeacherUpdateRequest req) {
        return teacherService.updateTeacher(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
    }

    @GetMapping("/search")
    public TeacherResponse search(@RequestParam String employee) {
        return teacherService.searchByEmployeeNumber(employee);
    }

    @GetMapping("/{id}/assignments")
    public List<TeacherAssignmentResponse> getAssignments(@PathVariable Long id) {
        return teacherService.getTeacherAssignments(id);
    }
}
