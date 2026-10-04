// Assigned module owner: IT25101913
package com.sliit.sims.timetable.dto;

import java.util.List;

public record StudentTimetableResponse(
        Long studentId,
        String studentName,
        String admissionNumber,
        Long classId,
        String className,
        Integer gradeLevel,
        Integer academicYear,
        Integer term,
        String status,
        List<StudentTimetableSlotDto> entries
) {}

