// Assigned module owner: IT25103710
package com.sliit.sims.common.exception;

import lombok.Getter;

@Getter
public class PaymentValidationException extends RuntimeException {
    private final String errorCode;

    public PaymentValidationException(String message) {
        super(message);
        this.errorCode = "PAYMENT_VALIDATION_ERROR";
    }

    public PaymentValidationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
