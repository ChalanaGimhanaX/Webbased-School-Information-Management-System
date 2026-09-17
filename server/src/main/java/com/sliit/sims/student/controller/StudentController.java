package com.sliit.sims.student.controller;

import com.sliit.sims.student.dto.*;
import com.sliit.sims.student.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse register(@Valid @RequestBody StudentRegisterRequest req) {
        return studentService.registerStudent(req);
    }

    @GetMapping("/{id}")
    public StudentResponse getById(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    @PostMapping("/allocate")
    @ResponseStatus(HttpStatus.OK)
    public void allocate(@Valid @RequestBody ClassAllocateRequest req) {
        studentService.allocateToClass(req);
    }

    @GetMapping("/class/{classId}")
    public List<StudentResponse> getStudentsByClass(@PathVariable Long classId) {
        return studentService.getActiveStudentsInClass(classId);
    }

    @PostMapping("/classes")
    @ResponseStatus(HttpStatus.CREATED)
    public AcademicClassResponse createClass(@Valid @RequestBody ClassCreateRequest req) {
        return studentService.createClass(req);
    }

    @GetMapping("/classes")
    public List<AcademicClassResponse> getClasses(@RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return studentService.getAllClasses(targetYear);
    }
}
