package com.sliit.sims.student.dto;

import java.time.LocalDate;

public record StudentResponse(
    Long id,
    String admissionNumber,
    String firstName,
    String lastName,
    LocalDate dob,
    String gender,
    Long parentId,
    String currentClassName,
    Integer currentGrade
) {}
