// Assigned module owner: IT25100975
package com.sliit.sims.student.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "academic_classes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"grade_level", "class_name", "academic_year"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @Column(name = "class_name", nullable = false, length = 50)
    private String className;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(name = "capacity", nullable = false)
    @Builder.Default
    private Integer capacity = 40;

    @Column(name = "class_teacher_id")
    private Long classTeacherId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
