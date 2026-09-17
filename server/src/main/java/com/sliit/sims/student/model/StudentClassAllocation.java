package com.sliit.sims.student.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "student_class_allocations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "academic_year"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentClassAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = false)
    private AcademicClass academicClass;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(name = "allocated_date", nullable = false)
    private LocalDate allocatedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private AllocationStatus status = AllocationStatus.ACTIVE;
}
