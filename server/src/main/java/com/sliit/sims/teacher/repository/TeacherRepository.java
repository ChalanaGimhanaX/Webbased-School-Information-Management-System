package com.sliit.sims.teacher.repository;

import com.sliit.sims.teacher.model.Teacher;
import com.sliit.sims.teacher.model.TeacherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByEmployeeNumber(String employeeNumber);
    boolean existsByEmployeeNumber(String employeeNumber);
    List<Teacher> findByStatus(TeacherStatus status);
}
