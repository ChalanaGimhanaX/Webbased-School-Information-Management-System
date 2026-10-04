// Assigned module owner: IT25101913
package com.sliit.sims.timetable.dto;

import java.time.LocalTime;

public record StudentTimetableSlotDto(
        Long entryId,
        String dayOfWeek,
        Integer periodNumber,
        LocalTime startTime,
        LocalTime endTime,
        Long subjectId,
        String subjectCode,
        String subjectName,
        Long teacherId,
        String teacherName,
        String roomNumber
) {}

