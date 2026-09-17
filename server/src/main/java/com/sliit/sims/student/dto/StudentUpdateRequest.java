package com.sliit.sims.student.dto;

import com.sliit.sims.student.model.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record StudentUpdateRequest(
    @NotBlank(message = "First name is required")
    String firstName,
    @NotBlank(message = "Last name is required")
    String lastName,
    @NotNull(message = "Date of birth is required")
    LocalDate dob,
    @NotNull(message = "Gender is required")
    Gender gender,
    Long parentId
) {}
