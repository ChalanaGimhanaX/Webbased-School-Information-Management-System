// Assigned module owner: IT25103710
package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.FeeType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FeeStructureCreateRequest {

    @NotBlank(message = "Fee structure name is required")
    private String name;

    @NotNull(message = "Fee type is required")
    private FeeType feeType;

    private Integer gradeLevel;

    @NotNull(message = "Academic year is required")
    private Integer academicYear;

    private Integer term;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private LocalDate dueDate;

    private String description;

    public FeeStructureCreateRequest() {}

    public FeeStructureCreateRequest(String name, FeeType feeType, Integer gradeLevel, Integer academicYear,
                                     Integer term, BigDecimal amount, LocalDate dueDate, String description) {
        this.name = name;
        this.feeType = feeType;
        this.gradeLevel = gradeLevel;
        this.academicYear = academicYear;
        this.term = term;
        this.amount = amount;
        this.dueDate = dueDate;
        this.description = description;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public FeeType getFeeType() { return feeType; }
    public void setFeeType(FeeType feeType) { this.feeType = feeType; }

    public Integer getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; }

    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }

    public Integer getTerm() { return term; }
    public void setTerm(Integer term) { this.term = term; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private FeeType feeType;
        private Integer gradeLevel;
        private Integer academicYear;
        private Integer term;
        private BigDecimal amount;
        private LocalDate dueDate;
        private String description;

        public Builder name(String name) { this.name = name; return this; }
        public Builder feeType(FeeType feeType) { this.feeType = feeType; return this; }
        public Builder gradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; return this; }
        public Builder academicYear(Integer academicYear) { this.academicYear = academicYear; return this; }
        public Builder term(Integer term) { this.term = term; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder description(String description) { this.description = description; return this; }

        public FeeStructureCreateRequest build() {
            return new FeeStructureCreateRequest(name, feeType, gradeLevel, academicYear, term, amount, dueDate, description);
        }
    }
}
