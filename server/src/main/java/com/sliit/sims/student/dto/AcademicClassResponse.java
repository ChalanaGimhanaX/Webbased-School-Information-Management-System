// Assigned module owner: IT25100975
package com.sliit.sims.student.dto;

public record AcademicClassResponse(
    Long id,
    Integer gradeLevel,
    String className,
    Integer academicYear,
    Integer capacity,
    Long classTeacherId,
    Long enrolledStudentCount
) {}
