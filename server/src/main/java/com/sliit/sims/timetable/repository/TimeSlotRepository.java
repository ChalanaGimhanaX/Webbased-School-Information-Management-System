// Assigned module owner: IT25101913
package com.sliit.sims.timetable.repository;

import com.sliit.sims.timetable.model.DayOfWeek;
import com.sliit.sims.timetable.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    List<TimeSlot> findAllByOrderByDayOfWeekAscPeriodNumberAsc();
    Optional<TimeSlot> findByDayOfWeekAndPeriodNumber(DayOfWeek dayOfWeek, Integer periodNumber);
}

