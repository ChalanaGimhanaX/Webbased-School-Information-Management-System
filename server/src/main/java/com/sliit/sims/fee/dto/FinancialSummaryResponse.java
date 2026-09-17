package com.sliit.sims.fee.dto;

import java.math.BigDecimal;
import java.util.List;

public class FinancialSummaryResponse {

    private BigDecimal totalInvoiced;
    private BigDecimal totalCollected;
    private BigDecimal totalOutstanding;
    private Double collectionRatePercentage;

    private Long totalFeeAccounts;
    private Long paidAccountsCount;
    private Long partialAccountsCount;
    private Long pendingAccountsCount;
    private Long overdueAccountsCount;

    private List<FeeTypeBreakdownDto> feeTypeBreakdowns;
    private List<GradeBreakdownDto> gradeBreakdowns;

    public FinancialSummaryResponse() {}

    public FinancialSummaryResponse(BigDecimal totalInvoiced, BigDecimal totalCollected, BigDecimal totalOutstanding,
                                    Double collectionRatePercentage, Long totalFeeAccounts, Long paidAccountsCount,
                                    Long partialAccountsCount, Long pendingAccountsCount, Long overdueAccountsCount,
                                    List<FeeTypeBreakdownDto> feeTypeBreakdowns, List<GradeBreakdownDto> gradeBreakdowns) {
        this.totalInvoiced = totalInvoiced;
        this.totalCollected = totalCollected;
        this.totalOutstanding = totalOutstanding;
        this.collectionRatePercentage = collectionRatePercentage;
        this.totalFeeAccounts = totalFeeAccounts;
        this.paidAccountsCount = paidAccountsCount;
        this.partialAccountsCount = partialAccountsCount;
        this.pendingAccountsCount = pendingAccountsCount;
        this.overdueAccountsCount = overdueAccountsCount;
        this.feeTypeBreakdowns = feeTypeBreakdowns;
        this.gradeBreakdowns = gradeBreakdowns;
    }

    public BigDecimal getTotalInvoiced() { return totalInvoiced; }
    public void setTotalInvoiced(BigDecimal totalInvoiced) { this.totalInvoiced = totalInvoiced; }

    public BigDecimal getTotalCollected() { return totalCollected; }
    public void setTotalCollected(BigDecimal totalCollected) { this.totalCollected = totalCollected; }

    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }

    public Double getCollectionRatePercentage() { return collectionRatePercentage; }
    public void setCollectionRatePercentage(Double collectionRatePercentage) { this.collectionRatePercentage = collectionRatePercentage; }

    public Long getTotalFeeAccounts() { return totalFeeAccounts; }
    public void setTotalFeeAccounts(Long totalFeeAccounts) { this.totalFeeAccounts = totalFeeAccounts; }

    public Long getPaidAccountsCount() { return paidAccountsCount; }
    public void setPaidAccountsCount(Long paidAccountsCount) { this.paidAccountsCount = paidAccountsCount; }

    public Long getPartialAccountsCount() { return partialAccountsCount; }
    public void setPartialAccountsCount(Long partialAccountsCount) { this.partialAccountsCount = partialAccountsCount; }

    public Long getPendingAccountsCount() { return pendingAccountsCount; }
    public void setPendingAccountsCount(Long pendingAccountsCount) { this.pendingAccountsCount = pendingAccountsCount; }

    public Long getOverdueAccountsCount() { return overdueAccountsCount; }
    public void setOverdueAccountsCount(Long overdueAccountsCount) { this.overdueAccountsCount = overdueAccountsCount; }

    public List<FeeTypeBreakdownDto> getFeeTypeBreakdowns() { return feeTypeBreakdowns; }
    public void setFeeTypeBreakdowns(List<FeeTypeBreakdownDto> feeTypeBreakdowns) { this.feeTypeBreakdowns = feeTypeBreakdowns; }

    public List<GradeBreakdownDto> getGradeBreakdowns() { return gradeBreakdowns; }
    public void setGradeBreakdowns(List<GradeBreakdownDto> gradeBreakdowns) { this.gradeBreakdowns = gradeBreakdowns; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private BigDecimal totalInvoiced;
        private BigDecimal totalCollected;
        private BigDecimal totalOutstanding;
        private Double collectionRatePercentage;
        private Long totalFeeAccounts;
        private Long paidAccountsCount;
        private Long partialAccountsCount;
        private Long pendingAccountsCount;
        private Long overdueAccountsCount;
        private List<FeeTypeBreakdownDto> feeTypeBreakdowns;
        private List<GradeBreakdownDto> gradeBreakdowns;

        public Builder totalInvoiced(BigDecimal totalInvoiced) { this.totalInvoiced = totalInvoiced; return this; }
        public Builder totalCollected(BigDecimal totalCollected) { this.totalCollected = totalCollected; return this; }
        public Builder totalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; return this; }
        public Builder collectionRatePercentage(Double collectionRatePercentage) { this.collectionRatePercentage = collectionRatePercentage; return this; }
        public Builder totalFeeAccounts(Long totalFeeAccounts) { this.totalFeeAccounts = totalFeeAccounts; return this; }
        public Builder paidAccountsCount(Long paidAccountsCount) { this.paidAccountsCount = paidAccountsCount; return this; }
        public Builder partialAccountsCount(Long partialAccountsCount) { this.partialAccountsCount = partialAccountsCount; return this; }
        public Builder pendingAccountsCount(Long pendingAccountsCount) { this.pendingAccountsCount = pendingAccountsCount; return this; }
        public Builder overdueAccountsCount(Long overdueAccountsCount) { this.overdueAccountsCount = overdueAccountsCount; return this; }
        public Builder feeTypeBreakdowns(List<FeeTypeBreakdownDto> feeTypeBreakdowns) { this.feeTypeBreakdowns = feeTypeBreakdowns; return this; }
        public Builder gradeBreakdowns(List<GradeBreakdownDto> gradeBreakdowns) { this.gradeBreakdowns = gradeBreakdowns; return this; }

        public FinancialSummaryResponse build() {
            return new FinancialSummaryResponse(totalInvoiced, totalCollected, totalOutstanding,
                    collectionRatePercentage, totalFeeAccounts, paidAccountsCount, partialAccountsCount,
                    pendingAccountsCount, overdueAccountsCount, feeTypeBreakdowns, gradeBreakdowns);
        }
    }
}
