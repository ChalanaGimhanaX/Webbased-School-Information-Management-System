// Assigned module owner: IT25100975
package com.sliit.sims.student.repository;

import com.sliit.sims.student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);
    Optional<Student> findByUserId(Long userId);
    boolean existsByAdmissionNumber(String admissionNumber);
}
