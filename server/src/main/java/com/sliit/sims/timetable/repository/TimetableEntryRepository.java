package com.sliit.sims.timetable.repository;

import com.sliit.sims.timetable.model.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {

    @Query("""
        SELECT e FROM TimetableEntry e 
        WHERE e.timeSlot.id = :slotId 
          AND e.teacherId = :teacherId 
          AND e.timetable.status != com.sliit.sims.timetable.model.TimetableStatus.ARCHIVED
    """)
    Optional<TimetableEntry> findTeacherConflict(
        @Param("slotId") Long slotId, 
        @Param("teacherId") Long teacherId
    );

    @Query("""
        SELECT e FROM TimetableEntry e 
        WHERE e.timeSlot.id = :slotId 
          AND LOWER(e.roomNumber) = LOWER(:roomNumber)
          AND e.timetable.status != com.sliit.sims.timetable.model.TimetableStatus.ARCHIVED
    """)
    Optional<TimetableEntry> findRoomConflict(
        @Param("slotId") Long slotId, 
        @Param("roomNumber") String roomNumber
    );

    @Query("""
        SELECT e FROM TimetableEntry e 
        WHERE e.timetable.id = :timetableId 
          AND e.timeSlot.id = :slotId
    """)
    Optional<TimetableEntry> findClassSlotConflict(
        @Param("timetableId") Long timetableId, 
        @Param("slotId") Long slotId
    );

    @Query("""
        SELECT e FROM TimetableEntry e
        JOIN FETCH e.timeSlot
        WHERE e.teacherId = :teacherId
          AND e.timetable.status = com.sliit.sims.timetable.model.TimetableStatus.PUBLISHED
        ORDER BY e.timeSlot.dayOfWeek, e.timeSlot.periodNumber
    """)
    List<TimetableEntry> findPublishedEntriesByTeacher(@Param("teacherId") Long teacherId);

    @Query("""
        SELECT e FROM TimetableEntry e
        JOIN FETCH e.timeSlot
        WHERE LOWER(e.roomNumber) = LOWER(:roomNumber)
          AND e.timetable.status = com.sliit.sims.timetable.model.TimetableStatus.PUBLISHED
        ORDER BY e.timeSlot.dayOfWeek, e.timeSlot.periodNumber
    """)
    List<TimetableEntry> findPublishedEntriesByRoom(@Param("roomNumber") String roomNumber);
}
