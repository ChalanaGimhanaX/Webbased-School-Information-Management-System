package com.sliit.sims.fee.controller;

import com.sliit.sims.fee.dto.FeeStructureCreateRequest;
import com.sliit.sims.fee.dto.FeeStructureResponse;
import com.sliit.sims.fee.dto.FeeStructureUpdateRequest;
import com.sliit.sims.fee.model.FeeType;
import com.sliit.sims.fee.service.FeeManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees/structures")
@CrossOrigin(origins = "*")
public class FeeStructureController {

    private final FeeManagementService feeService;

    public FeeStructureController(FeeManagementService feeService) {
        this.feeService = feeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FeeStructureResponse createFeeStructure(@Valid @RequestBody FeeStructureCreateRequest request) {
        return feeService.createFeeStructure(request);
    }

    @GetMapping
    public List<FeeStructureResponse> getAllFeeStructures(
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false) Integer gradeLevel,
            @RequestParam(required = false) FeeType feeType) {

        if (gradeLevel != null && academicYear != null) {
            return feeService.getFeeStructuresByGradeAndYear(gradeLevel, academicYear);
        } else if (academicYear != null) {
            return feeService.getFeeStructuresByAcademicYear(academicYear);
        } else if (feeType != null) {
            return feeService.getFeeStructuresByType(feeType);
        }
        return feeService.getAllFeeStructures();
    }

    @GetMapping("/{id}")
    public FeeStructureResponse getFeeStructureById(@PathVariable Long id) {
        return feeService.getFeeStructureById(id);
    }

    @PutMapping("/{id}")
    public FeeStructureResponse updateFeeStructure(@PathVariable Long id, @RequestBody FeeStructureUpdateRequest request) {
        return feeService.updateFeeStructure(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFeeStructure(@PathVariable Long id) {
        feeService.deleteFeeStructure(id);
    }
}
