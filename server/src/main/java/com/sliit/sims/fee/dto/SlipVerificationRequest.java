package com.sliit.sims.fee.dto;

import com.sliit.sims.fee.model.SlipStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SlipVerificationRequest {

    @NotNull(message = "Verification status is required (APPROVED or REJECTED)")
    private SlipStatus status;

    @NotBlank(message = "Reviewed by administrator name is required")
    private String reviewedBy;

    private String reviewRemarks;

    public SlipVerificationRequest() {}

    public SlipVerificationRequest(SlipStatus status, String reviewedBy, String reviewRemarks) {
        this.status = status;
        this.reviewedBy = reviewedBy;
        this.reviewRemarks = reviewRemarks;
    }

    public SlipStatus getStatus() { return status; }
    public void setStatus(SlipStatus status) { this.status = status; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewRemarks() { return reviewRemarks; }
    public void setReviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private SlipStatus status;
        private String reviewedBy;
        private String reviewRemarks;

        public Builder status(SlipStatus status) { this.status = status; return this; }
        public Builder reviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; return this; }
        public Builder reviewRemarks(String reviewRemarks) { this.reviewRemarks = reviewRemarks; return this; }

        public SlipVerificationRequest build() {
            return new SlipVerificationRequest(status, reviewedBy, reviewRemarks);
        }
    }
}
