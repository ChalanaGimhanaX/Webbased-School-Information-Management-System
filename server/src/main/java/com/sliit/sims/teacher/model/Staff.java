// Assigned module owner: IT25102861
package com.sliit.sims.teacher.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   @Column(name = "employee_number", nullable = false, unique = true, length = 50)
private String employeeNumber;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100,
            message = "First name must be between 2 and 100 characters")
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100,
            message = "Last name must be between 2 and 100 characters")
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @NotBlank(message = "Job position is required")
    @Column(name = "job_position", nullable = false, length = 100)
    private String jobPosition;

    @NotBlank(message = "Department is required")
    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Size(max = 150,
            message = "Qualification cannot exceed 150 characters")
    @Column(name = "qualification", length = 150)
    private String qualification;

    @NotBlank(message = "Phone number is required")
@Pattern(
        regexp = "^[0-9]{10}$",
        message = "Phone number must contain exactly 10 digits"
)
@Column(name = "phone", length = 20)
private String phone;

@Email(message = "Enter a valid email address")
@Column(name = "email", length = 150)
private String email;

    @Column(name = "employment_type", length = 50)
    private String employmentType;

    @Column(name = "salary")
    private Double salary;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Enumerated(EnumType.STRING)
@Column(name = "status", nullable = false, length = 20)
@Builder.Default
private StaffStatus status = StaffStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}