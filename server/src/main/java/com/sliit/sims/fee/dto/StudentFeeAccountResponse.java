package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.PaymentStatus;
import com.sliit.sims.fee.model.StudentFeeAccount;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class StudentFeeAccountResponse {

    private Long id;
    private Long studentId;
    private String studentAdmissionNumber;
    private String studentName;
    private Integer gradeLevel;
    private FeeStructureResponse feeStructure;
    private Integer academicYear;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus status;
    private LocalDate dueDate;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StudentFeeAccountResponse() {}

    public StudentFeeAccountResponse(Long id, Long studentId, String studentAdmissionNumber, String studentName,
                                     Integer gradeLevel, FeeStructureResponse feeStructure, Integer academicYear,
                                     BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal balanceAmount,
                                     PaymentStatus status, LocalDate dueDate, String remarks,
                                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.studentId = studentId;
        this.studentAdmissionNumber = studentAdmissionNumber;
        this.studentName = studentName;
        this.gradeLevel = gradeLevel;
        this.feeStructure = feeStructure;
        this.academicYear = academicYear;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.balanceAmount = balanceAmount;
        this.status = status;
        this.dueDate = dueDate;
        this.remarks = remarks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static StudentFeeAccountResponse fromEntity(StudentFeeAccount entity) {
        if (entity == null) return null;
        return StudentFeeAccountResponse.builder()
                .id(entity.getId())
                .studentId(entity.getStudentId())
                .studentAdmissionNumber(entity.getStudentAdmissionNumber())
                .studentName(entity.getStudentName())
                .gradeLevel(entity.getGradeLevel())
                .feeStructure(FeeStructureResponse.fromEntity(entity.getFeeStructure()))
                .academicYear(entity.getAcademicYear())
                .totalAmount(entity.getTotalAmount())
                .paidAmount(entity.getPaidAmount())
                .balanceAmount(entity.getBalanceAmount())
                .status(entity.getStatus())
                .dueDate(entity.getDueDate())
                .remarks(entity.getRemarks())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentAdmissionNumber() { return studentAdmissionNumber; }
    public void setStudentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Integer getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; }

    public FeeStructureResponse getFeeStructure() { return feeStructure; }
    public void setFeeStructure(FeeStructureResponse feeStructure) { this.feeStructure = feeStructure; }

    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getBalanceAmount() { return balanceAmount; }
    public void setBalanceAmount(BigDecimal balanceAmount) { this.balanceAmount = balanceAmount; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long studentId;
        private String studentAdmissionNumber;
        private String studentName;
        private Integer gradeLevel;
        private FeeStructureResponse feeStructure;
        private Integer academicYear;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal balanceAmount;
        private PaymentStatus status;
        private LocalDate dueDate;
        private String remarks;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder studentId(Long studentId) { this.studentId = studentId; return this; }
        public Builder studentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; return this; }
        public Builder studentName(String studentName) { this.studentName = studentName; return this; }
        public Builder gradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; return this; }
        public Builder feeStructure(FeeStructureResponse feeStructure) { this.feeStructure = feeStructure; return this; }
        public Builder academicYear(Integer academicYear) { this.academicYear = academicYear; return this; }
        public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder paidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; return this; }
        public Builder balanceAmount(BigDecimal balanceAmount) { this.balanceAmount = balanceAmount; return this; }
        public Builder status(PaymentStatus status) { this.status = status; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public StudentFeeAccountResponse build() {
            return new StudentFeeAccountResponse(id, studentId, studentAdmissionNumber, studentName, gradeLevel,
                    feeStructure, academicYear, totalAmount, paidAmount, balanceAmount, status, dueDate, remarks, createdAt, updatedAt);
        }
    }
}
