package com.sliit.sims.teacher.repository;

import com.sliit.sims.teacher.model.TeacherSubjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherSubjectAssignmentRepository extends JpaRepository<TeacherSubjectAssignment, Long> {
    List<TeacherSubjectAssignment> findByTeacherIdAndAcademicYear(Long teacherId, Integer academicYear);
    List<TeacherSubjectAssignment> findByClassIdAndAcademicYear(Long classId, Integer academicYear);
    boolean existsByTeacherIdAndSubjectIdAndClassIdAndAcademicYear(Long teacherId, Long subjectId, Long classId, Integer academicYear);
}
