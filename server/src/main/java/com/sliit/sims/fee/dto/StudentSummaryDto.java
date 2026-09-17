package com.sliit.sims.fee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StudentSummaryDto {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Admission number is required")
    private String admissionNumber;

    @NotBlank(message = "Student name is required")
    private String studentName;

    public StudentSummaryDto() {}

    public StudentSummaryDto(Long studentId, String admissionNumber, String studentName) {
        this.studentId = studentId;
        this.admissionNumber = admissionNumber;
        this.studentName = studentName;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getAdmissionNumber() { return admissionNumber; }
    public void setAdmissionNumber(String admissionNumber) { this.admissionNumber = admissionNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long studentId;
        private String admissionNumber;
        private String studentName;

        public Builder studentId(Long studentId) { this.studentId = studentId; return this; }
        public Builder admissionNumber(String admissionNumber) { this.admissionNumber = admissionNumber; return this; }
        public Builder studentName(String studentName) { this.studentName = studentName; return this; }

        public StudentSummaryDto build() {
            return new StudentSummaryDto(studentId, admissionNumber, studentName);
        }
    }
}
