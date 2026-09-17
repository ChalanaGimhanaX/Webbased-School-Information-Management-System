package com.sliit.sims.teacher.service;

import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.teacher.dto.*;
import com.sliit.sims.teacher.model.*;
import com.sliit.sims.teacher.repository.SubjectRepository;
import com.sliit.sims.teacher.repository.TeacherRepository;
import com.sliit.sims.teacher.repository.TeacherSubjectAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherSubjectAssignmentRepository assignmentRepository;

    @Transactional
    public TeacherResponse registerTeacher(TeacherRegisterRequest req) {
        if (teacherRepository.existsByEmployeeNumber(req.employeeNumber().trim())) {
            throw new IllegalArgumentException("Teacher with employee number " + req.employeeNumber() + " already exists");
        }

        Teacher teacher = Teacher.builder()
                .employeeNumber(req.employeeNumber().trim().toUpperCase())
                .firstName(req.firstName().trim())
                .lastName(req.lastName().trim())
                .qualification(req.qualification())
                .phone(req.phone())
                .hireDate(req.hireDate())
                .status(TeacherStatus.ACTIVE)
                .build();

        return mapToResponse(teacherRepository.save(teacher));
    }

    @Transactional
    public TeacherResponse updateStatus(Long teacherId, TeacherStatus status) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherId));

        teacher.setStatus(status);
        return mapToResponse(teacherRepository.save(teacher));
    }

    @Transactional
    public SubjectResponse createSubject(SubjectCreateRequest req) {
        subjectRepository.findBySubjectCode(req.subjectCode().trim().toUpperCase())
                .ifPresent(s -> {
                    throw new IllegalArgumentException("Subject code " + req.subjectCode() + " already exists");
                });

        Subject subject = Subject.builder()
                .subjectCode(req.subjectCode().trim().toUpperCase())
                .subjectName(req.subjectName().trim())
                .gradeLevel(req.gradeLevel())
                .build();

        Subject saved = subjectRepository.save(subject);
        return new SubjectResponse(saved.getId(), saved.getSubjectCode(), saved.getSubjectName(), saved.getGradeLevel());
    }

    @Transactional
    public void assignSubject(TeacherSubjectAssignRequest req) {
        Teacher teacher = teacherRepository.findById(req.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + req.teacherId()));

        if (teacher.getStatus() != TeacherStatus.ACTIVE) {
            throw new IllegalStateException("Cannot assign subjects to an inactive teacher");
        }

        Subject subject = subjectRepository.findById(req.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + req.subjectId()));

        if (assignmentRepository.existsByTeacherIdAndSubjectIdAndClassIdAndAcademicYear(
                req.teacherId(), req.subjectId(), req.classId(), req.academicYear())) {
            throw new IllegalArgumentException("Assignment already exists for this teacher, subject, class, and year");
        }

        TeacherSubjectAssignment assignment = TeacherSubjectAssignment.builder()
                .teacher(teacher)
                .subject(subject)
                .classId(req.classId())
                .academicYear(req.academicYear())
                .build();

        assignmentRepository.save(assignment);
    }

    public List<TeacherResponse> getAllTeachers(TeacherStatus status) {
        List<Teacher> list = status != null ? teacherRepository.findByStatus(status) : teacherRepository.findAll();
        return list.stream().map(this::mapToResponse).toList();
    }

    public TeacherResponse getTeacherById(Long id) {
        return teacherRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + id));
    }

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(s -> new SubjectResponse(s.getId(), s.getSubjectCode(), s.getSubjectName(), s.getGradeLevel()))
                .toList();
    }

    private TeacherResponse mapToResponse(Teacher t) {
        return new TeacherResponse(
                t.getId(),
                t.getEmployeeNumber(),
                t.getFirstName(),
                t.getLastName(),
                t.getQualification(),
                t.getPhone(),
                t.getStatus(),
                t.getHireDate()
        );
    }

    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherUpdateRequest req) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + id));
        
        teacher.setFirstName(req.firstName().trim());
        teacher.setLastName(req.lastName().trim());
        teacher.setQualification(req.qualification());
        teacher.setPhone(req.phone());
        teacher.setHireDate(req.hireDate());
        
        return mapToResponse(teacherRepository.save(teacher));
    }

    @Transactional
    public void deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Teacher not found: " + id);
        }
        teacherRepository.deleteById(id);
    }

    public TeacherResponse searchByEmployeeNumber(String employeeNumber) {
        return teacherRepository.findByEmployeeNumber(employeeNumber)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with employee number: " + employeeNumber));
    }

    public List<TeacherAssignmentResponse> getTeacherAssignments(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Teacher not found: " + id);
        }
        int currentYear = java.time.LocalDate.now().getYear();
        return assignmentRepository.findByTeacherIdAndAcademicYear(id, currentYear).stream()
                .map(a -> new TeacherAssignmentResponse(a.getId(), a.getTeacher().getId(), a.getSubject().getId(), a.getSubject().getSubjectName(), a.getClassId(), a.getAcademicYear()))
                .toList();
    }

    public List<SubjectResponse> getSubjectsByGrade(Integer gradeLevel) {
        return subjectRepository.findByGradeLevel(gradeLevel).stream()
                .map(s -> new SubjectResponse(s.getId(), s.getSubjectCode(), s.getSubjectName(), s.getGradeLevel()))
                .toList();
    }
}
