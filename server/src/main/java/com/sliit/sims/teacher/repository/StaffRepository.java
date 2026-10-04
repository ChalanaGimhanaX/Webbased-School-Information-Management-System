// Assigned module owner: IT25102861
package com.sliit.sims.teacher.repository;

import com.sliit.sims.teacher.model.Staff;
import com.sliit.sims.teacher.model.StaffStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    boolean existsByEmployeeNumber(String employeeNumber);

    Optional<Staff> findByEmployeeNumber(String employeeNumber);

    List<Staff> findByStatus(StaffStatus status);

    List<Staff> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmployeeNumberContainingIgnoreCaseOrDepartmentContainingIgnoreCaseOrJobPositionContainingIgnoreCase(
            String firstName,
            String lastName,
            String employeeNumber,
            String department,
            String jobPosition
    );
}