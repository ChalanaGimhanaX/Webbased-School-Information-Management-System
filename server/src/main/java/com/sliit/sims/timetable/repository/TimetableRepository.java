// Assigned module owner: IT25101913
package com.sliit.sims.timetable.repository;

import com.sliit.sims.timetable.model.Timetable;
import com.sliit.sims.timetable.model.TimetableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    Optional<Timetable> findByClassIdAndAcademicYearAndTerm(Long classId, Integer academicYear, Integer term);
    List<Timetable> findByClassIdOrderByAcademicYearDescTermDesc(Long classId);
    List<Timetable> findByStatus(TimetableStatus status);
}

