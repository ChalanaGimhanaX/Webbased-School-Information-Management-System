-- =====================================================================
-- SLIIT SE2030 - Software Engineering (Year 2, Semester 1 - 2026)
-- Project: Web-based School Information Management System (SIMS)
-- Group: 2026 - Y2 - S1 - MLB - B3G2 - 01
-- Description: Complete Relational Database Schema with Explicit Foreign Keys
-- Target Engine: MySQL 8.0+ / MariaDB / PostgreSQL / H2
-- =====================================================================

CREATE DATABASE IF NOT EXISTS sim_system_db;
USE sim_system_db;

-- Disable foreign key checks for clean tear-down and build
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS payment_receipts;
DROP TABLE IF EXISTS payment_slips;
DROP TABLE IF EXISTS student_fee_accounts;
DROP TABLE IF EXISTS fee_structures;
DROP TABLE IF EXISTS timetable_entries;
DROP TABLE IF EXISTS timetables;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS exam_papers;
DROP TABLE IF EXISTS examinations;
DROP TABLE IF EXISTS attendance_entries;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS teacher_subject_assignments;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS student_class_allocations;
DROP TABLE IF EXISTS academic_classes;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. CORE & SECURITY SUBSYSTEM (Shared)
-- =====================================================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT') NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE parents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    father_name VARCHAR(150),
    mother_name VARCHAR(150),
    phone VARCHAR(20) NOT NULL,
    nic VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 2. UC-02: TEACHER & STAFF SUBSYSTEM (Bandara R.M.K.G.R.L - IT25102861)
-- =====================================================================

CREATE TABLE teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    qualification VARCHAR(150),
    phone VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE') DEFAULT 'ACTIVE',
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(30) NOT NULL UNIQUE,
    subject_name VARCHAR(150) NOT NULL,
    grade_level INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 3. UC-01: STUDENT & CLASS SUBSYSTEM (Dissanayake D.M.R.S - IT25100975)
-- =====================================================================

CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    admission_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    parent_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_students_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE academic_classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grade_level INT NOT NULL,
    class_name VARCHAR(50) NOT NULL, -- e.g. '10-A'
    academic_year INT NOT NULL,      -- e.g. 2026
    capacity INT DEFAULT 40,
    class_teacher_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_class_year (grade_level, class_name, academic_year),
    CONSTRAINT fk_classes_teacher FOREIGN KEY (class_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE student_class_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    academic_year INT NOT NULL,
    allocated_date DATE NOT NULL,
    status ENUM('ACTIVE', 'TRANSFERRED') DEFAULT 'ACTIVE',
    UNIQUE KEY uk_student_year (student_id, academic_year),
    CONSTRAINT fk_alloc_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_alloc_class FOREIGN KEY (class_id) REFERENCES academic_classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE teacher_subject_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    academic_year INT NOT NULL,
    UNIQUE KEY uk_assignment (teacher_id, subject_id, class_id, academic_year),
    CONSTRAINT fk_tsa_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_tsa_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_tsa_class FOREIGN KEY (class_id) REFERENCES academic_classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 4. UC-03: STUDENT ATTENDANCE SUBSYSTEM (Dissanayake D.M.S.A - IT25101863)
-- =====================================================================

CREATE TABLE attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    academic_year INT NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_class_date (class_id, attendance_date),
    CONSTRAINT fk_att_record_class FOREIGN KEY (class_id) REFERENCES academic_classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_record_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE attendance_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attendance_record_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    remarks VARCHAR(255),
    UNIQUE KEY uk_record_student (attendance_record_id, student_id),
    CONSTRAINT fk_att_entry_record FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_entry_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 5. UC-04: EXAMINATION & RESULTS SUBSYSTEM (Pemadasa J.M.C.D - IT25103724)
-- =====================================================================

CREATE TABLE examinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(150) NOT NULL,
    term INT NOT NULL,              -- 1, 2, or 3
    academic_year INT NOT NULL,
    status ENUM('DRAFT', 'PUBLISHED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_exam_term_year (exam_name, term, academic_year)
) ENGINE=InnoDB;

CREATE TABLE exam_papers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    grade_level INT NOT NULL,
    max_marks DECIMAL(5,2) DEFAULT 100.00,
    UNIQUE KEY uk_exam_subject (exam_id, subject_id, grade_level),
    CONSTRAINT fk_paper_exam FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE,
    CONSTRAINT fk_paper_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE exam_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_paper_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    grade VARCHAR(5) NOT NULL,      -- 'A+', 'A', 'B', 'C', 'S', 'F'
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_paper_student (exam_paper_id, student_id),
    CONSTRAINT fk_result_paper FOREIGN KEY (exam_paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 6. UC-05: TIMETABLE & SCHEDULING SUBSYSTEM (Gimhana D.B.C - IT25101913)
-- =====================================================================

CREATE TABLE time_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY') NOT NULL,
    period_number INT NOT NULL,     -- 1 to 8
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE KEY uk_day_period (day_of_week, period_number)
) ENGINE=InnoDB;

CREATE TABLE timetables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT NOT NULL,
    academic_year INT NOT NULL,
    term INT NOT NULL,
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_class_term_year (class_id, academic_year, term),
    CONSTRAINT fk_timetable_class FOREIGN KEY (class_id) REFERENCES academic_classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE timetable_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timetable_id BIGINT NOT NULL,
    time_slot_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    -- Conflict rule 1: Class cannot have 2 subjects in same slot
    UNIQUE KEY uk_class_slot (timetable_id, time_slot_id),
    CONSTRAINT fk_tentry_timetable FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE,
    CONSTRAINT fk_tentry_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    CONSTRAINT fk_tentry_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tentry_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================================
-- 7. UC-06: FEE & PAYMENT SUBSYSTEM (Weerasekara K.T.J - IT25103710)
-- =====================================================================

CREATE TABLE fee_structures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fee_type ENUM('TUITION', 'FACILITY', 'EXAMINATION', 'LIBRARY') NOT NULL,
    grade_level INT,
    amount DECIMAL(10,2) NOT NULL,
    academic_year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_fee_grade_year (fee_type, grade_level, academic_year)
) ENGINE=InnoDB;

CREATE TABLE student_fee_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_structure_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    balance_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'PARTIAL', 'PAID') DEFAULT 'PENDING',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_student_fee (student_id, fee_structure_id),
    CONSTRAINT fk_sfa_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_sfa_fee FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE payment_slips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fee_account_id BIGINT NOT NULL,
    parent_id BIGINT,
    slip_image_url VARCHAR(500),
    amount_paid DECIMAL(10,2) NOT NULL,
    verification_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    reviewed_by VARCHAR(100),
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_slip_account FOREIGN KEY (fee_account_id) REFERENCES student_fee_accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_slip_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE payment_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_slip_id BIGINT NOT NULL UNIQUE,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    receipt_type ENUM('FULL', 'PARTIAL') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_receipt_slip FOREIGN KEY (payment_slip_id) REFERENCES payment_slips(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- PERFORMANCE INDEXES (Optimizing Foreign Key Traversal & Lookups)
-- =====================================================================

CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_alloc_student ON student_class_allocations(student_id);
CREATE INDEX idx_alloc_class ON student_class_allocations(class_id);
CREATE INDEX idx_tsa_teacher ON teacher_subject_assignments(teacher_id);
CREATE INDEX idx_att_entry_student ON attendance_entries(student_id);
CREATE INDEX idx_results_student ON exam_results(student_id);
CREATE INDEX idx_timetable_entries_teacher ON timetable_entries(teacher_id, time_slot_id);
CREATE INDEX idx_timetable_entries_room ON timetable_entries(room_number, time_slot_id);
CREATE INDEX idx_sfa_student ON student_fee_accounts(student_id);
CREATE INDEX idx_slips_account ON payment_slips(fee_account_id);
