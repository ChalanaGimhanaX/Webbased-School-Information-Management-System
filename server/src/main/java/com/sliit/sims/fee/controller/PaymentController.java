package com.sliit.sims.fee.controller;

import com.sliit.sims.fee.dto.*;
import com.sliit.sims.fee.model.SlipStatus;
import com.sliit.sims.fee.service.FeeManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final FeeManagementService feeService;

    public PaymentController(FeeManagementService feeService) {
        this.feeService = feeService;
    }

    @PostMapping("/record-direct")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentReceiptResponse recordDirectPayment(@Valid @RequestBody DirectPaymentRequest request) {
        return feeService.recordDirectPayment(request);
    }

    @PostMapping("/submit-slip")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentSlipResponse submitBankSlip(@Valid @RequestBody BankSlipSubmitRequest request) {
        return feeService.submitBankSlip(request);
    }

    @PutMapping("/{id}/verify")
    public PaymentSlipResponse verifyPaymentSlip(@PathVariable Long id, @Valid @RequestBody SlipVerificationRequest request) {
        return feeService.verifyPaymentSlip(id, request);
    }

    @GetMapping
    public List<PaymentSlipResponse> getAllPaymentSlips(
            @RequestParam(required = false) SlipStatus status,
            @RequestParam(required = false) Long studentId) {
        return feeService.getAllPaymentSlips(status, studentId);
    }

    @GetMapping("/{id}")
    public PaymentSlipResponse getPaymentSlipById(@PathVariable Long id) {
        return feeService.getPaymentSlipById(id);
    }

    @PostMapping("/{id}/cancel")
    public PaymentSlipResponse cancelPayment(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Payment cancelled by administrator") String reason,
            @RequestParam(defaultValue = "Admin") String cancelledBy) {
        return feeService.cancelPayment(id, reason, cancelledBy);
    }
}
