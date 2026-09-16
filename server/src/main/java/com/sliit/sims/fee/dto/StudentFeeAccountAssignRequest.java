package com.sliit.sims.fee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class StudentFeeAccountAssignRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Student admission number is required")
    private String studentAdmissionNumber;

    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotNull(message = "Grade level is required")
    private Integer gradeLevel;

    @NotNull(message = "Fee structure ID is required")
    private Long feeStructureId;

    private LocalDate dueDate;

    private String remarks;

    public StudentFeeAccountAssignRequest() {}

    public StudentFeeAccountAssignRequest(Long studentId, String studentAdmissionNumber, String studentName,
                                          Integer gradeLevel, Long feeStructureId, LocalDate dueDate, String remarks) {
        this.studentId = studentId;
        this.studentAdmissionNumber = studentAdmissionNumber;
        this.studentName = studentName;
        this.gradeLevel = gradeLevel;
        this.feeStructureId = feeStructureId;
        this.dueDate = dueDate;
        this.remarks = remarks;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentAdmissionNumber() { return studentAdmissionNumber; }
    public void setStudentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Integer getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; }

    public Long getFeeStructureId() { return feeStructureId; }
    public void setFeeStructureId(Long feeStructureId) { this.feeStructureId = feeStructureId; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long studentId;
        private String studentAdmissionNumber;
        private String studentName;
        private Integer gradeLevel;
        private Long feeStructureId;
        private LocalDate dueDate;
        private String remarks;

        public Builder studentId(Long studentId) { this.studentId = studentId; return this; }
        public Builder studentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; return this; }
        public Builder studentName(String studentName) { this.studentName = studentName; return this; }
        public Builder gradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; return this; }
        public Builder feeStructureId(Long feeStructureId) { this.feeStructureId = feeStructureId; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }

        public StudentFeeAccountAssignRequest build() {
            return new StudentFeeAccountAssignRequest(studentId, studentAdmissionNumber, studentName, gradeLevel, feeStructureId, dueDate, remarks);
        }
    }
}
