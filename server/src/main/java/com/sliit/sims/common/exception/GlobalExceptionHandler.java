package com.sliit.sims.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ScheduleConflictException.class)
    public ProblemDetail handleScheduleConflict(ScheduleConflictException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Scheduling Conflict Detected");
        problem.setType(URI.create("https://sims.wycherley.edu/errors/schedule-conflict"));
        problem.setProperty("conflictType", ex.getConflictType());
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(PaymentValidationException.class)
    public ProblemDetail handlePaymentValidation(PaymentValidationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Payment Validation Failed");
        problem.setType(URI.create("https://sims.wycherley.edu/errors/payment-validation"));
        problem.setProperty("errorCode", ex.getErrorCode());
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        problem.setType(URI.create("https://sims.wycherley.edu/errors/not-found"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
        problem.setTitle("Validation Error");
        problem.setType(URI.create("https://sims.wycherley.edu/errors/validation-error"));
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        problem.setProperty("fieldErrors", errors);
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleIllegalState(IllegalStateException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Operation Conflict");
        problem.setType(URI.create("https://sims.wycherley.edu/errors/operation-conflict"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Bad Request");
        problem.setType(URI.create("https://sims.wycherley.edu/errors/bad-request"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
