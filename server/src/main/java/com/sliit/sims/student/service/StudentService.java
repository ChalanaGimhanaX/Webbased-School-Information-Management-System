package com.sliit.sims.student.service;

import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.student.dto.*;
import com.sliit.sims.student.model.*;
import com.sliit.sims.student.repository.AcademicClassRepository;
import com.sliit.sims.student.repository.StudentClassAllocationRepository;
import com.sliit.sims.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentService {

    private final StudentRepository studentRepository;
    private final AcademicClassRepository classRepository;
    private final StudentClassAllocationRepository allocationRepository;

    @Transactional
    public StudentResponse registerStudent(StudentRegisterRequest req) {
        if (studentRepository.existsByAdmissionNumber(req.admissionNumber().trim())) {
            throw new IllegalArgumentException("Student with admission number " + req.admissionNumber() + " already exists");
        }

        Student student = Student.builder()
                .admissionNumber(req.admissionNumber().trim().toUpperCase())
                .firstName(req.firstName().trim())
                .lastName(req.lastName().trim())
                .dob(req.dob())
                .gender(req.gender())
                .parentId(req.parentId())
                .build();

        Student saved = studentRepository.save(student);

        if (req.initialClassId() != null) {
            AcademicClass initialClass = classRepository.findById(req.initialClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + req.initialClassId()));
            allocateStudentToClass(saved, initialClass, initialClass.getAcademicYear());
        }

        return getStudentById(saved.getId());
    }

    @Transactional
    public void allocateToClass(ClassAllocateRequest req) {
        Student student = studentRepository.findById(req.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + req.studentId()));

        AcademicClass targetClass = classRepository.findById(req.classId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + req.classId()));

        allocateStudentToClass(student, targetClass, req.academicYear());
    }

    private void allocateStudentToClass(Student student, AcademicClass targetClass, Integer year) {
        long currentEnrolled = allocationRepository.countByAcademicClassIdAndStatus(targetClass.getId(), AllocationStatus.ACTIVE);
        if (currentEnrolled >= targetClass.getCapacity()) {
            throw new IllegalStateException("Class " + targetClass.getClassName() + " has reached maximum capacity of " + targetClass.getCapacity());
        }

        // Archive previous allocation to retain historical records (UC-01 Open Issue 02)
        allocationRepository.findByStudentIdAndAcademicYearAndStatus(student.getId(), year, AllocationStatus.ACTIVE)
                .ifPresent(prev -> {
                    prev.setStatus(AllocationStatus.TRANSFERRED);
                    allocationRepository.save(prev);
                });

        StudentClassAllocation allocation = StudentClassAllocation.builder()
                .student(student)
                .academicClass(targetClass)
                .academicYear(year)
                .allocatedDate(LocalDate.now())
                .status(AllocationStatus.ACTIVE)
                .build();

        allocationRepository.save(allocation);
    }

    @Transactional
    public AcademicClassResponse createClass(ClassCreateRequest req) {
        classRepository.findByGradeLevelAndClassNameAndAcademicYear(req.gradeLevel(), req.className().trim(), req.academicYear())
                .ifPresent(c -> {
                    throw new IllegalArgumentException("Class " + req.className() + " already exists for year " + req.academicYear());
                });

        AcademicClass academicClass = AcademicClass.builder()
                .gradeLevel(req.gradeLevel())
                .className(req.className().trim().toUpperCase())
                .academicYear(req.academicYear())
                .capacity(req.capacity() != null ? req.capacity() : 40)
                .classTeacherId(req.classTeacherId())
                .build();

        AcademicClass saved = classRepository.save(academicClass);
        return new AcademicClassResponse(saved.getId(), saved.getGradeLevel(), saved.getClassName(), saved.getAcademicYear(), saved.getCapacity(), saved.getClassTeacherId(), 0L);
    }

    public StudentResponse getStudentById(Long id) {
        Student s = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));

        int currentYear = LocalDate.now().getYear();
        var allocOpt = allocationRepository.findByStudentIdAndAcademicYearAndStatus(s.getId(), currentYear, AllocationStatus.ACTIVE);

        String className = allocOpt.map(a -> a.getAcademicClass().getClassName()).orElse("Unallocated");
        Integer grade = allocOpt.map(a -> a.getAcademicClass().getGradeLevel()).orElse(null);

        return new StudentResponse(s.getId(), s.getAdmissionNumber(), s.getFirstName(), s.getLastName(), s.getDob(), s.getGender().name(), s.getParentId(), className, grade);
    }

    public List<StudentResponse> getActiveStudentsInClass(Long classId) {
        return allocationRepository.findActiveAllocationsByClass(classId).stream()
                .map(a -> {
                    Student s = a.getStudent();
                    return new StudentResponse(s.getId(), s.getAdmissionNumber(), s.getFirstName(), s.getLastName(), s.getDob(), s.getGender().name(), s.getParentId(), a.getAcademicClass().getClassName(), a.getAcademicClass().getGradeLevel());
                })
                .toList();
    }

    public List<AcademicClassResponse> getAllClasses(Integer year) {
        return classRepository.findByAcademicYearOrderByGradeLevelAscClassNameAsc(year).stream()
                .map(c -> {
                    long count = allocationRepository.countByAcademicClassIdAndStatus(c.getId(), AllocationStatus.ACTIVE);
                    return new AcademicClassResponse(c.getId(), c.getGradeLevel(), c.getClassName(), c.getAcademicYear(), c.getCapacity(), c.getClassTeacherId(), count);
                })
                .toList();
    }
}
