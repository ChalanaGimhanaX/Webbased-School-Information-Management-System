package com.sliit.sims.student;

import com.sliit.sims.common.auth.model.User;
import com.sliit.sims.common.auth.repository.UserRepository;
import com.sliit.sims.student.model.*;
import com.sliit.sims.student.repository.AcademicClassRepository;
import com.sliit.sims.student.repository.StudentClassAllocationRepository;
import com.sliit.sims.student.repository.StudentRepository;
import com.sliit.sims.teacher.model.Teacher;
import com.sliit.sims.teacher.model.TeacherStatus;
import com.sliit.sims.teacher.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

@Component
@Order(2)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "sims.seed.students", havingValue = "true", matchIfMissing = true)
public class StudentDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StudentDataSeeder.class);

    private final StudentRepository studentRepository;
    private final AcademicClassRepository classRepository;
    private final StudentClassAllocationRepository allocationRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (studentRepository.count() > 0) {
            log.info("Student and class data already present. Skipping initialization.");
            return;
        }

        try {
            seedSampleData();
        } catch (Exception e) {
            log.warn("Student data seeder encountered an issue: {}", e.getMessage());
        }
    }

    private void seedSampleData() {
        log.info("Seeding academic classes, teachers, and sample students...");

        // 1. Seed Sample Teachers
        Teacher teacher1 = null;
        if (teacherRepository.count() == 0) {
            Optional<User> teacherUser = userRepository.findByUsername("teacher1");
            teacher1 = teacherRepository.save(Teacher.builder()
                    .userId(teacherUser.map(User::getId).orElse(null))
                    .employeeNumber("EMP-T001")
                    .firstName("Kalinga")
                    .lastName("Perera")
                    .qualification("B.Sc. Mathematics")
                    .phone("0771234567")
                    .status(TeacherStatus.ACTIVE)
                    .hireDate(LocalDate.of(2020, 1, 15))
                    .build());

            teacherRepository.save(Teacher.builder()
                    .employeeNumber("EMP-T002")
                    .firstName("Damayanthi")
                    .lastName("Jayawardena")
                    .qualification("M.Sc. Chemistry")
                    .phone("0772345678")
                    .status(TeacherStatus.ACTIVE)
                    .hireDate(LocalDate.of(2018, 5, 20))
                    .build());

            teacherRepository.save(Teacher.builder()
                    .employeeNumber("EMP-T003")
                    .firstName("Ashan")
                    .lastName("Fernando")
                    .qualification("B.Sc. Computer Science")
                    .phone("0773456789")
                    .status(TeacherStatus.ACTIVE)
                    .hireDate(LocalDate.of(2022, 9, 1))
                    .build());
        }

        // 2. Seed Academic Classes
        AcademicClass class10A = classRepository.save(AcademicClass.builder()
                .className("10-A")
                .gradeLevel(10)
                .academicYear(2026)
                .capacity(35)
                .classTeacherId(teacher1 != null ? teacher1.getId() : null)
                .build());

        AcademicClass class10B = classRepository.save(AcademicClass.builder()
                .className("10-B")
                .gradeLevel(10)
                .academicYear(2026)
                .capacity(35)
                .build());

        AcademicClass class11A = classRepository.save(AcademicClass.builder()
                .className("11-A")
                .gradeLevel(11)
                .academicYear(2026)
                .capacity(35)
                .build());

        AcademicClass class12Sci = classRepository.save(AcademicClass.builder()
                .className("12-SCI")
                .gradeLevel(12)
                .academicYear(2026)
                .capacity(30)
                .build());

        // 3. Seed Students
        Optional<User> studentUser = userRepository.findByUsername("student1");

        // Primary demo student linked to user 'student1'
        Student s1 = studentRepository.save(Student.builder()
                .userId(studentUser.map(User::getId).orElse(null))
                .admissionNumber("WYC-2026-00100")
                .firstName("Amaya")
                .lastName("Senanayake")
                .dob(LocalDate.of(2010, 2, 14))
                .gender(Gender.FEMALE)
                .build());
        allocateStudent(s1, class10A);

        Student s2 = studentRepository.save(Student.builder()
                .admissionNumber("WYC-2026-00101")
                .firstName("Kasun")
                .lastName("Perera")
                .dob(LocalDate.of(2010, 5, 15))
                .gender(Gender.MALE)
                .build());
        allocateStudent(s2, class10A);

        Student s3 = studentRepository.save(Student.builder()
                .admissionNumber("WYC-2026-00102")
                .firstName("Nimasha")
                .lastName("Silva")
                .dob(LocalDate.of(2010, 8, 22))
                .gender(Gender.FEMALE)
                .build());
        allocateStudent(s3, class10A);

        Student s4 = studentRepository.save(Student.builder()
                .admissionNumber("WYC-2026-00103")
                .firstName("Ravindu")
                .lastName("Fernando")
                .dob(LocalDate.of(2009, 3, 10))
                .gender(Gender.MALE)
                .build());
        allocateStudent(s4, class11A);

        Student s5 = studentRepository.save(Student.builder()
                .admissionNumber("WYC-2026-00104")
                .firstName("Shenali")
                .lastName("Wickrematunga")
                .dob(LocalDate.of(2010, 11, 4))
                .gender(Gender.FEMALE)
                .build());
        allocateStudent(s5, class10B);

        Student s6 = studentRepository.save(Student.builder()
                .admissionNumber("WYC-2026-00105")
                .firstName("Malith")
                .lastName("Ranasinghe")
                .dob(LocalDate.of(2009, 7, 19))
                .gender(Gender.MALE)
                .build());
        allocateStudent(s6, class11A);

        log.info("Successfully seeded sample classes and students.");
    }

    private void allocateStudent(Student student, AcademicClass academicClass) {
        allocationRepository.save(StudentClassAllocation.builder()
                .student(student)
                .academicClass(academicClass)
                .academicYear(academicClass.getAcademicYear())
                .allocatedDate(LocalDate.now().minusMonths(2))
                .status(AllocationStatus.ACTIVE)
                .build());
    }
}
