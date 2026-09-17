package com.sliit.sims.teacher.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teacher_subject_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"teacher_id", "subject_id", "class_id", "academic_year"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherSubjectAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;
}
