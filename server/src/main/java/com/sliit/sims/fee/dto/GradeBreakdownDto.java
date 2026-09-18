// Assigned module owner: IT25103710
package com.sliit.sims.fee.dto;

import java.math.BigDecimal;

public class GradeBreakdownDto {

    private Integer gradeLevel;
    private Long totalAccounts;
    private BigDecimal totalInvoiced;
    private BigDecimal totalCollected;
    private BigDecimal totalOutstanding;
    private Double collectionPercentage;

    public GradeBreakdownDto() {}

    public GradeBreakdownDto(Integer gradeLevel, Long totalAccounts, BigDecimal totalInvoiced,
                             BigDecimal totalCollected, BigDecimal totalOutstanding, Double collectionPercentage) {
        this.gradeLevel = gradeLevel;
        this.totalAccounts = totalAccounts;
        this.totalInvoiced = totalInvoiced;
        this.totalCollected = totalCollected;
        this.totalOutstanding = totalOutstanding;
        this.collectionPercentage = collectionPercentage;
    }

    public Integer getGradeLevel() { return gradeLevel; }
    public void setGradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; }

    public Long getTotalAccounts() { return totalAccounts; }
    public void setTotalAccounts(Long totalAccounts) { this.totalAccounts = totalAccounts; }

    public BigDecimal getTotalInvoiced() { return totalInvoiced; }
    public void setTotalInvoiced(BigDecimal totalInvoiced) { this.totalInvoiced = totalInvoiced; }

    public BigDecimal getTotalCollected() { return totalCollected; }
    public void setTotalCollected(BigDecimal totalCollected) { this.totalCollected = totalCollected; }

    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }

    public Double getCollectionPercentage() { return collectionPercentage; }
    public void setCollectionPercentage(Double collectionPercentage) { this.collectionPercentage = collectionPercentage; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Integer gradeLevel;
        private Long totalAccounts;
        private BigDecimal totalInvoiced;
        private BigDecimal totalCollected;
        private BigDecimal totalOutstanding;
        private Double collectionPercentage;

        public Builder gradeLevel(Integer gradeLevel) { this.gradeLevel = gradeLevel; return this; }
        public Builder totalAccounts(Long totalAccounts) { this.totalAccounts = totalAccounts; return this; }
        public Builder totalInvoiced(BigDecimal totalInvoiced) { this.totalInvoiced = totalInvoiced; return this; }
        public Builder totalCollected(BigDecimal totalCollected) { this.totalCollected = totalCollected; return this; }
        public Builder totalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; return this; }
        public Builder collectionPercentage(Double collectionPercentage) { this.collectionPercentage = collectionPercentage; return this; }

        public GradeBreakdownDto build() {
            return new GradeBreakdownDto(gradeLevel, totalAccounts, totalInvoiced, totalCollected, totalOutstanding, collectionPercentage);
        }
    }
}
