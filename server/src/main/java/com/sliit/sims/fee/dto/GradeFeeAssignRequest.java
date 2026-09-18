// Assigned module owner: IT25103710
package com.sliit.sims.fee.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class GradeFeeAssignRequest {

    @NotNull(message = "Grade level is required")
    private Integer gradeLevel;

    @NotNull(message = "Fee structure ID is required")
    private Long feeStructureId;

    @NotEmpty(message = "At least one student must be provided")
    @Valid
    private List<StudentSummaryDto> students;

    private LocalDate dueDate;

    private String remarks;

    public GradeFeeAssignRequest() {}

    public GradeFeeAssignRequest(Integer gradeLevel, Long feeStructureId, List<StudentSummaryDto> students,
                                 LocalDate dueDate, String remarks) {
        this.gradeLevel = gradeLevel;
        this.feeStructureId = feeStructureId;
        this.students = students;
        this.dueDate = dueDate;
        this.remarks = remarks;
    }

    public Integer getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; }

    public Long getFeeStructureId() { return feeStructureId; }
    public void setFeeStructureId(Long feeStructureId) { this.feeStructureId = feeStructureId; }

    public List<StudentSummaryDto> getStudents() { return students; }
    public void setStudents(List<StudentSummaryDto> students) { this.students = students; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Integer gradeLevel;
        private Long feeStructureId;
        private List<StudentSummaryDto> students;
        private LocalDate dueDate;
        private String remarks;

        public Builder gradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; return this; }
        public Builder feeStructureId(Long feeStructureId) { this.feeStructureId = feeStructureId; return this; }
        public Builder students(List<StudentSummaryDto> students) { this.students = students; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }

        public GradeFeeAssignRequest build() {
            return new GradeFeeAssignRequest(gradeLevel, feeStructureId, students, dueDate, remarks);
        }
    }
}
