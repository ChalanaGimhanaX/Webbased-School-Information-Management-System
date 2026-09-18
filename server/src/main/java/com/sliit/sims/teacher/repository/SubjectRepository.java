// Assigned module owner: IT25102861
package com.sliit.sims.teacher.repository;

import com.sliit.sims.teacher.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectCode(String subjectCode);
    List<Subject> findByGradeLevel(Integer gradeLevel);
}
