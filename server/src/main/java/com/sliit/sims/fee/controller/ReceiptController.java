package com.sliit.sims.fee.controller;

import com.sliit.sims.fee.dto.PaymentReceiptResponse;
import com.sliit.sims.fee.service.FeeManagementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees/receipts")
@CrossOrigin(origins = "*")
public class ReceiptController {

    private final FeeManagementService feeService;

    public ReceiptController(FeeManagementService feeService) {
        this.feeService = feeService;
    }

    @GetMapping("/{receiptNumber}")
    public PaymentReceiptResponse getReceiptByNumber(@PathVariable String receiptNumber) {
        return feeService.getReceiptByNumber(receiptNumber);
    }

    @GetMapping("/by-payment/{paymentSlipId}")
    public PaymentReceiptResponse getReceiptByPaymentSlipId(@PathVariable Long paymentSlipId) {
        return feeService.getReceiptByPaymentSlipId(paymentSlipId);
    }

    @GetMapping("/student/{studentId}")
    public List<PaymentReceiptResponse> getReceiptsByStudentId(@PathVariable Long studentId) {
        return feeService.getReceiptsByStudentId(studentId);
    }
}
