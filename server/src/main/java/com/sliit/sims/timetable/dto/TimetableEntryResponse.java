// Assigned module owner: IT25101913
package com.sliit.sims.timetable.dto;

import java.time.LocalTime;

public record TimetableEntryResponse(
    Long id,
    Long timeSlotId,
    String dayOfWeek,
    Integer periodNumber,
    LocalTime startTime,
    LocalTime endTime,
    Long subjectId,
    Long teacherId,
    String roomNumber,
    Long classId
) {
    public TimetableEntryResponse(
        Long id,
        Long timeSlotId,
        String dayOfWeek,
        Integer periodNumber,
        LocalTime startTime,
        LocalTime endTime,
        Long subjectId,
        Long teacherId,
        String roomNumber
    ) {
        this(id, timeSlotId, dayOfWeek, periodNumber, startTime, endTime, subjectId, teacherId, roomNumber, null);
    }
}

