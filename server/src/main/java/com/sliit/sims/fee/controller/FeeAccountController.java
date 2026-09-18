// Assigned module owner: IT25103710
package com.sliit.sims.fee.controller;

import com.sliit.sims.fee.dto.FeeAccountUpdateRequest;
import com.sliit.sims.fee.dto.GradeFeeAssignRequest;
import com.sliit.sims.fee.dto.StudentFeeAccountAssignRequest;
import com.sliit.sims.fee.dto.StudentFeeAccountResponse;
import com.sliit.sims.fee.model.PaymentStatus;
import com.sliit.sims.fee.service.FeeManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees/accounts")
@CrossOrigin(origins = "*")
public class FeeAccountController {

    private final FeeManagementService feeService;

    public FeeAccountController(FeeManagementService feeService) {
        this.feeService = feeService;
    }

    @PostMapping("/assign-student")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentFeeAccountResponse assignFeeToStudent(@Valid @RequestBody StudentFeeAccountAssignRequest request) {
        return feeService.assignFeeToStudent(request);
    }

    @PostMapping("/assign-grade")
    @ResponseStatus(HttpStatus.CREATED)
    public List<StudentFeeAccountResponse> assignFeeToGrade(@Valid @RequestBody GradeFeeAssignRequest request) {
        return feeService.assignFeeToGrade(request);
    }

    @GetMapping
    public List<StudentFeeAccountResponse> getAllFeeAccounts(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) Integer gradeLevel,
            @RequestParam(required = false) Integer academicYear) {
        return feeService.getAllFeeAccounts(studentId, status, gradeLevel, academicYear);
    }

    @GetMapping("/{id}")
    public StudentFeeAccountResponse getFeeAccountById(@PathVariable Long id) {
        return feeService.getFeeAccountById(id);
    }

    @GetMapping("/student/{studentId}")
    public List<StudentFeeAccountResponse> getStudentFeeAccounts(@PathVariable Long studentId) {
        return feeService.getStudentFeeAccounts(studentId);
    }

    @GetMapping("/student/{studentId}/outstanding")
    public List<StudentFeeAccountResponse> getStudentOutstandingAccounts(@PathVariable Long studentId) {
        return feeService.getStudentOutstandingAccounts(studentId);
    }

    @PutMapping("/{id}")
    public StudentFeeAccountResponse updateFeeAccount(@PathVariable Long id, @RequestBody FeeAccountUpdateRequest request) {
        return feeService.updateFeeAccount(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelFeeAccount(@PathVariable Long id) {
        feeService.cancelFeeAccount(id);
    }
}
