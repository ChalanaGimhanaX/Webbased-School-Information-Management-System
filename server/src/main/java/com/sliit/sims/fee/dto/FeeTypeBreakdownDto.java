// Assigned module owner: IT25103710
package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.FeeType;

import java.math.BigDecimal;

public class FeeTypeBreakdownDto {

    private FeeType feeType;
    private BigDecimal totalInvoiced;
    private BigDecimal totalCollected;
    private BigDecimal totalOutstanding;
    private Double collectionPercentage;

    public FeeTypeBreakdownDto() {}

    public FeeTypeBreakdownDto(FeeType feeType, BigDecimal totalInvoiced, BigDecimal totalCollected,
                               BigDecimal totalOutstanding, Double collectionPercentage) {
        this.feeType = feeType;
        this.totalInvoiced = totalInvoiced;
        this.totalCollected = totalCollected;
        this.totalOutstanding = totalOutstanding;
        this.collectionPercentage = collectionPercentage;
    }

    public FeeType getFeeType() { return feeType; }
    public void setFeeType(FeeType feeType) { this.feeType = feeType; }

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
        private FeeType feeType;
        private BigDecimal totalInvoiced;
        private BigDecimal totalCollected;
        private BigDecimal totalOutstanding;
        private Double collectionPercentage;

        public Builder feeType(FeeType feeType) { this.feeType = feeType; return this; }
        public Builder totalInvoiced(BigDecimal totalInvoiced) { this.totalInvoiced = totalInvoiced; return this; }
        public Builder totalCollected(BigDecimal totalCollected) { this.totalCollected = totalCollected; return this; }
        public Builder totalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; return this; }
        public Builder collectionPercentage(Double collectionPercentage) { this.collectionPercentage = collectionPercentage; return this; }

        public FeeTypeBreakdownDto build() {
            return new FeeTypeBreakdownDto(feeType, totalInvoiced, totalCollected, totalOutstanding, collectionPercentage);
        }
    }
}
