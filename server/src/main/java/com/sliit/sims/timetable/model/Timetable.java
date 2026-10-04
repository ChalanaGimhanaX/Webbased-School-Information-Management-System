// Assigned module owner: IT25101913
package com.sliit.sims.timetable.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "timetables", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"class_id", "academic_year", "term"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(name = "term", nullable = false)
    private Integer term;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TimetableStatus status = TimetableStatus.DRAFT;

    @OneToMany(mappedBy = "timetable", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TimetableEntry> entries = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

