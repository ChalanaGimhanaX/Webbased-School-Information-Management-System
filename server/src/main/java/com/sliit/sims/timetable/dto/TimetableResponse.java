package com.sliit.sims.timetable.dto;

import com.sliit.sims.timetable.model.TimetableStatus;

import java.time.LocalDateTime;
import java.util.List;

public record TimetableResponse(
    Long id,
    Long classId,
    Integer academicYear,
    Integer term,
    TimetableStatus status,
    List<TimetableEntryResponse> entries,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}

