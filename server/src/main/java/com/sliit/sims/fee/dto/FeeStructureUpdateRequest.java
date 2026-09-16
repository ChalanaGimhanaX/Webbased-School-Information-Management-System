package com.sliit.sims.fee.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FeeStructureUpdateRequest {

    private String name;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String description;
    private Boolean active;

    public FeeStructureUpdateRequest() {}

    public FeeStructureUpdateRequest(String name, BigDecimal amount, LocalDate dueDate, String description, Boolean active) {
        this.name = name;
        this.amount = amount;
        this.dueDate = dueDate;
        this.description = description;
        this.active = active;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private BigDecimal amount;
        private LocalDate dueDate;
        private String description;
        private Boolean active;

        public Builder name(String name) { this.name = name; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }

        public FeeStructureUpdateRequest build() {
            return new FeeStructureUpdateRequest(name, amount, dueDate, description, active);
        }
    }
}
