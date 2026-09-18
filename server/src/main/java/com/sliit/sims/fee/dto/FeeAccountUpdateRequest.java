// Assigned module owner: IT25103710
package com.sliit.sims.fee.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FeeAccountUpdateRequest {

    private BigDecimal totalAmount;
    private LocalDate dueDate;
    private String remarks;

    public FeeAccountUpdateRequest() {}

    public FeeAccountUpdateRequest(BigDecimal totalAmount, LocalDate dueDate, String remarks) {
        this.totalAmount = totalAmount;
        this.dueDate = dueDate;
        this.remarks = remarks;
    }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private BigDecimal totalAmount;
        private LocalDate dueDate;
        private String remarks;

        public Builder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }

        public FeeAccountUpdateRequest build() {
            return new FeeAccountUpdateRequest(totalAmount, dueDate, remarks);
        }
    }
}
