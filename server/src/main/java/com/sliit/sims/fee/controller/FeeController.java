package com.sliit.sims.fee.controller;

import com.sliit.sims.fee.dto.*;
import com.sliit.sims.fee.model.FeeStructure;
import com.sliit.sims.fee.model.PaymentSlip;
import com.sliit.sims.fee.service.FeePaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FeeController {

    private final FeePaymentService feePaymentService;

    @PostMapping("/structures")
    @ResponseStatus(HttpStatus.CREATED)
    public FeeStructure createStructure(@Valid @RequestBody FeeStructureCreateRequest req) {
        return feePaymentService.createFeeStructure(req);
    }

    @PostMapping("/accounts/assign")
    @ResponseStatus(HttpStatus.CREATED)
    public FeeAccountResponse assignFee(@Valid @RequestBody FeeAccountAssignRequest req) {
        return feePaymentService.assignFeeToStudent(req);
    }

    @PostMapping("/slips/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentSlip uploadSlip(@Valid @RequestBody SlipUploadRequest req) {
        return feePaymentService.uploadPaymentSlip(req);
    }

    @PatchMapping("/slips/{id}/verify")
    public PaymentReceiptResponse verifySlip(@PathVariable Long id, @Valid @RequestBody SlipVerificationRequest req) {
        return feePaymentService.verifyPaymentSlip(id, req);
    }

    @GetMapping("/student/{studentId}")
    public List<FeeAccountResponse> getStudentFees(@PathVariable Long studentId) {
        return feePaymentService.getStudentFeeAccounts(studentId);
    }

    @GetMapping("/receipts/slip/{slipId}")
    public PaymentReceiptResponse getReceipt(@PathVariable Long slipId) {
        return feePaymentService.getReceiptBySlip(slipId);
    }
}
