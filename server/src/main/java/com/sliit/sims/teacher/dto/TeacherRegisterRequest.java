// Assigned module owner: IT25102861
package com.sliit.sims.teacher.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record TeacherRegisterRequest(
    @NotBlank(message = "Employee number is required")
    String employeeNumber,

    @NotBlank(message = "First name is required")
    String firstName,

    @NotBlank(message = "Last name is required")
    String lastName,

    String qualification,
    String phone,
    LocalDate hireDate
) {}
