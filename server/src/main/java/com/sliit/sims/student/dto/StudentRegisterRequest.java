package com.sliit.sims.student.dto;

import com.sliit.sims.student.model.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

public record StudentRegisterRequest(
    @NotBlank(message = "Admission number is required")
    String admissionNumber,

    @NotBlank(message = "First name is required")
    String firstName,

    @NotBlank(message = "Last name is required")
    String lastName,

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    LocalDate dob,

    @NotNull(message = "Gender is required")
    Gender gender,

    Long parentId,
    Long initialClassId
) {}
