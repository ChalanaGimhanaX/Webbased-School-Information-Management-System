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
    String roomNumber
) {}

