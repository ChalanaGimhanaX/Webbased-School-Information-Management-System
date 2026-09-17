package com.sliit.sims.fee.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_structures")
public class FeeStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "fee_type", nullable = false, length = 50)
    private FeeType feeType;

    @Column(name = "grade_level")
    private Integer gradeLevel;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(name = "term")
    private Integer term;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FeeStructure() {
        this.active = true;
    }

    public FeeStructure(Long id, String name, FeeType feeType, Integer gradeLevel, Integer academicYear,
                        Integer term, BigDecimal amount, LocalDate dueDate, String description, Boolean active) {
        this.id = id;
        this.name = name;
        this.feeType = feeType;
        this.gradeLevel = gradeLevel;
        this.academicYear = academicYear;
        this.term = term;
        this.amount = amount;
        this.dueDate = dueDate;
        this.description = description;
        this.active = active != null ? active : true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.active == null) {
            this.active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public static Builder builder() {
        return new Builder();
    }

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
        private Boolean active = true;

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

        public FeeStructure build() {
            return new FeeStructure(id, name, feeType, gradeLevel, academicYear, term, amount, dueDate, description, active);
        }
    }
}
