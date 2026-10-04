// Assigned module owner: IT25102861
package com.sliit.sims.teacher.service;

import com.sliit.sims.common.exception.ResourceNotFoundException;
import com.sliit.sims.teacher.model.Staff;
import com.sliit.sims.teacher.model.StaffStatus;
import com.sliit.sims.teacher.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffService {

    private final StaffRepository staffRepository;

    @Transactional
    public Staff createStaff(Staff staff) {

        if (staffRepository.existsByEmployeeNumber(
                staff.getEmployeeNumber().trim())) {

            throw new IllegalArgumentException(
                    "Staff with employee number "
                            + staff.getEmployeeNumber()
                            + " already exists"
            );
        }

        staff.setEmployeeNumber(
                staff.getEmployeeNumber().trim().toUpperCase()
        );

        staff.setStatus(StaffStatus.ACTIVE);

        return staffRepository.save(staff);
    }

    public List<Staff> getAllStaff(StaffStatus status) {

        if (status != null) {
            return staffRepository.findByStatus(status);
        }

        return staffRepository.findAll();
    }

    public Staff getStaffById(Long id) {

        return staffRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Staff not found: " + id
                        ));
    }

    public Staff searchByEmployeeNumber(String employeeNumber) {

        return staffRepository.findByEmployeeNumber(
                        employeeNumber.trim().toUpperCase()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Staff not found with employee number: "
                                        + employeeNumber
                        ));
    }

    @Transactional
    public Staff updateStaff(Long id, Staff staffDetails) {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Staff not found: " + id
                        ));

        staff.setFirstName(staffDetails.getFirstName().trim());
        staff.setLastName(staffDetails.getLastName().trim());
        staff.setJobPosition(staffDetails.getJobPosition());
        staff.setDepartment(staffDetails.getDepartment());
        staff.setQualification(staffDetails.getQualification());
        staff.setPhone(staffDetails.getPhone());
        staff.setEmploymentType(staffDetails.getEmploymentType());
        staff.setSalary(staffDetails.getSalary());
        staff.setAddress(staffDetails.getAddress());
        staff.setHireDate(staffDetails.getHireDate());
        staff.setEmail(staffDetails.getEmail());

        return staffRepository.save(staff);
    }

    @Transactional
    public void deleteStaff(Long id) {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Staff not found: " + id
                        ));

        staff.setStatus(StaffStatus.INACTIVE);

        staffRepository.save(staff);
    }

    public List<Staff> searchStaff(String keyword) {

    String searchKeyword = keyword.trim();

    return staffRepository
            .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeNumberContainingIgnoreCaseOrDepartmentContainingIgnoreCaseOrJobPositionContainingIgnoreCase(
                    searchKeyword,
                    searchKeyword,
                    searchKeyword,
                    searchKeyword,
                    searchKeyword
            );
}   // <-- closes searchStaff()

@Transactional
public Staff updateStaffStatus(Long id, StaffStatus status) {

    Staff staff = staffRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Staff not found: " + id));

    staff.setStatus(status);

    return staffRepository.save(staff);
}
}   // <-- closes StaffService class