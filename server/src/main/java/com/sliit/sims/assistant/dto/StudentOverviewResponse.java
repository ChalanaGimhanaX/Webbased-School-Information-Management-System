package com.sliit.sims.assistant.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

/**
 * The logged-in student's own academic snapshot. Used by the student dashboard and as the
 * grounding context for the AI assistant. Only published exam results are included.
 */
public record StudentOverviewResponse(
        String username,
        boolean profileLinked,
        Long studentId,
        String fullName,
        String admissionNumber,
        String className,
        Integer gradeLevel,
        Integer academicYear,
        String timetableStatus,
        Attendance attendance,
        List<Result> results,
        List<ClassSlot> timetable
) {
    public record Attendance(long totalDays, long presentDays, long absentDays, long lateDays, double percentage) {
        public static Attendance empty() {
            return new Attendance(0, 0, 0, 0, 0.0);
        }
    }

    public record Result(
            String examName,
            Integer term,
            Integer academicYear,
            String subjectName,
            BigDecimal marksObtained,
            BigDecimal maxMarks,
            String grade
    ) {}

    public record ClassSlot(
            String dayOfWeek,
            Integer periodNumber,
            LocalTime startTime,
            LocalTime endTime,
            String subjectName,
            String teacherName,
            String roomNumber
    ) {}

    public static StudentOverviewResponse unlinked(String username) {
        return new StudentOverviewResponse(username, false, null, null, null, null, null, null,
                "UNAVAILABLE", Attendance.empty(), List.of(), List.of());
    }
}

