// Assigned module owner: IT25102861
package com.sliit.sims.teacher.controller;

import jakarta.validation.Valid;
import com.sliit.sims.teacher.model.Staff;
import com.sliit.sims.teacher.model.StaffStatus;
import com.sliit.sims.teacher.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    // Create Staff
    @PostMapping
public ResponseEntity<Staff> createStaff(
        @Valid @RequestBody Staff staff) {

        return ResponseEntity.ok(
                staffService.createStaff(staff)
        );
    }

    // Get all Staff
    @GetMapping
    public ResponseEntity<List<Staff>> getAllStaff(
            @RequestParam(required = false) StaffStatus status) {

        return ResponseEntity.ok(
                staffService.getAllStaff(status)
        );
    }

    // Get Staff by ID
    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                staffService.getStaffById(id)
        );
    }

    // Search Staff by employee number
    @GetMapping("/search/employee/{employeeNumber}")
    public ResponseEntity<Staff> searchByEmployeeNumber(
            @PathVariable String employeeNumber) {

        return ResponseEntity.ok(
                staffService.searchByEmployeeNumber(employeeNumber)
        );
    }

    // Search Staff by keyword
    @GetMapping("/search")
    public ResponseEntity<List<Staff>> searchStaff(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                staffService.searchStaff(keyword)
        );
    }

    // Update Staff
    @PutMapping("/{id}")
public ResponseEntity<Staff> updateStaff(
        @PathVariable Long id,
        @Valid @RequestBody Staff staff) {

        return ResponseEntity.ok(
                staffService.updateStaff(id, staff)
        );
    }

    // Delete/Deactivate Staff
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(
            @PathVariable Long id) {

        staffService.deleteStaff(id);

        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}/status")
public ResponseEntity<Staff> updateStaffStatus(
        @PathVariable Long id,
        @RequestParam StaffStatus status) {

    return ResponseEntity.ok(
            staffService.updateStaffStatus(id, status)
    );
}
}