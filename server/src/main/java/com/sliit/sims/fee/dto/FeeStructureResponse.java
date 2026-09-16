package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.FeeStructure;
import com.sliit.sims.fee.model.FeeType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FeeStructureResponse {

    private Long id;
    private String name;
    private FeeType feeType;
    private Integer gradeLevel;
    private Integer academicYear;
    private Integer term;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FeeStructureResponse() {}

    public FeeStructureResponse(Long id, String name, FeeType feeType, Integer gradeLevel, Integer academicYear,
                                Integer term, BigDecimal amount, LocalDate dueDate, String description,
                                Boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.feeType = feeType;
        this.gradeLevel = gradeLevel;
        this.academicYear = academicYear;
        this.term = term;
        this.amount = amount;
        this.dueDate = dueDate;
        this.description = description;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static FeeStructureResponse fromEntity(FeeStructure entity) {
        if (entity == null) return null;
        return FeeStructureResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .feeType(entity.getFeeType())
                .gradeLevel(entity.getGradeLevel())
                .academicYear(entity.getAcademicYear())
                .term(entity.getTerm())
                .amount(entity.getAmount())
                .dueDate(entity.getDueDate())
                .description(entity.getDescription())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private FeeType feeType;
        private Integer gradeLevel;
        private Integer academicYear;
        private Integer term;
        private BigDecimal amount;
        private LocalDate dueDate;
        private String description;
        private Boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder feeType(FeeType feeType) { this.feeType = feeType; return this; }
        public Builder gradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; return this; }
        public Builder academicYear(Integer academicYear) { this.academicYear = academicYear; return this; }
        public Builder term(Integer term) { this.term = term; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public FeeStructureResponse build() {
            return new FeeStructureResponse(id, name, feeType, gradeLevel, academicYear, term, amount, dueDate, description, active, createdAt, updatedAt);
        }
    }
}
