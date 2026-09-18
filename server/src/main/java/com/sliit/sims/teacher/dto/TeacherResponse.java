// Assigned module owner: IT25102861
package com.sliit.sims.teacher.dto;

import com.sliit.sims.teacher.model.TeacherStatus;

import java.time.LocalDate;

public record TeacherResponse(
    Long id,
    String employeeNumber,
    String firstName,
    String lastName,
    String qualification,
    String phone,
    TeacherStatus status,
    LocalDate hireDate
) {}
