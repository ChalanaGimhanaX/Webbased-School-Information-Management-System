package com.sliit.sims.fee.controller;

import com.sliit.sims.fee.dto.FinancialSummaryResponse;
import com.sliit.sims.fee.dto.GradeBreakdownDto;
import com.sliit.sims.fee.dto.StudentFeeAccountResponse;
import com.sliit.sims.fee.service.FeeManagementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees/reports")
@CrossOrigin(origins = "*")
public class FeeReportController {

    private final FeeManagementService feeService;

    public FeeReportController(FeeManagementService feeService) {
        this.feeService = feeService;
    }

    @GetMapping("/summary")
    public FinancialSummaryResponse getFinancialSummary() {
        return feeService.getFinancialSummary();
    }

    @GetMapping("/overdue")
    public List<StudentFeeAccountResponse> getOverdueAccounts() {
        return feeService.getOverdueAccounts();
    }

    @GetMapping("/by-grade/{gradeLevel}")
    public GradeBreakdownDto getGradeReport(@PathVariable Integer gradeLevel) {
        return feeService.getGradeReport(gradeLevel);
    }
}
