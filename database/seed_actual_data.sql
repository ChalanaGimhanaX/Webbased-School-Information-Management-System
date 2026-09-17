-- =====================================================================
-- SE2030 - Web-based School Information Management System (SIMS)
-- Production Clean & Realistic Database Seeder
-- Group: 2026 - Y2 - S1 - MLB - B3G2 - 01
-- =====================================================================

USE sim_system_db;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM payment_receipts;
DELETE FROM payment_slips;
DELETE FROM student_fee_accounts;
DELETE FROM fee_structures;
DELETE FROM timetable_entries;
DELETE FROM timetables;
DELETE FROM time_slots;
DELETE FROM exam_results;
DELETE FROM exam_papers;
DELETE FROM examinations;
DELETE FROM attendance_entries;
DELETE FROM attendance_records;
DELETE FROM teacher_subject_assignments;
DELETE FROM student_class_allocations;
DELETE FROM academic_classes;
DELETE FROM subjects;
DELETE FROM students;
DELETE FROM parents;
DELETE FROM teachers;
DELETE FROM users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. AUTHENTICATION & USERS (5 Core System Roles)
-- =====================================================================

INSERT INTO users (id, username, email, password_hash, role, active, created_at, updated_at) VALUES
(1, 'admin', 'admin@sliit.lk', '$2a$10$jQ5U7328CX/nBYiXT9TmOuabDNfNX7uXPFv3ZuDWR9Ic5V6oLnL1W', 'ADMIN', 1, NOW(), NOW()),
(2, 'head_academic', 'academic@sliit.lk', '$2a$10$I6gpPe3Cw.T4lcixgwBMge8KlkMTg1f3rVFZOTMaLk9b66EBbzQd6', 'HEAD_OF_ACADEMIC', 1, NOW(), NOW()),
(3, 'teacher1', 'teacher1@sliit.lk', '$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW', 'TEACHER', 1, NOW(), NOW()),
(4, 'student1', 'student1@sliit.lk', '$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq', 'STUDENT', 1, NOW(), NOW()),
(5, 'parent1', 'parent1@sliit.lk', '$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu', 'PARENT', 1, NOW(), NOW());

-- =====================================================================
-- 2. TEACHERS & STAFF (UC-02)
-- =====================================================================

INSERT INTO teachers (id, user_id, employee_number, first_name, last_name, qualification, phone, hire_date, status, created_at) VALUES
(1, 3, 'EMP-2026-001', 'Sunil', 'Fernando', 'BSc Education (Mathematics)', '0771234567', '2020-01-15', 'ACTIVE', NOW()),
(2, NULL, 'EMP-2026-002', 'Kamala', 'Rajapaksha', 'MSc Applied Mathematics', '0779876543', '2018-05-10', 'ACTIVE', NOW()),
(3, NULL, 'EMP-2026-003', 'Nihal', 'Jayasinghe', 'BSc Biological Science', '0714567890', '2021-03-01', 'ACTIVE', NOW()),
(4, NULL, 'EMP-2026-004', 'Anoma', 'Wickramasinghe', 'BA English Language & Literature', '0763456789', '2019-09-15', 'ACTIVE', NOW()),
(5, NULL, 'EMP-2026-005', 'Chaminda', 'Silva', 'BSc Information Technology', '0725678901', '2022-01-10', 'ACTIVE', NOW()),
(6, NULL, 'EMP-2026-006', 'Priyantha', 'Perera', 'BA Social Sciences & History', '0756789012', '2017-06-20', 'ACTIVE', NOW());

-- =====================================================================
-- 3. ACADEMIC CLASSES (UC-01)
-- =====================================================================

INSERT INTO academic_classes (id, grade_level, class_name, academic_year, capacity, class_teacher_id, created_at) VALUES
(1, 10, 'Grade 10-A', 2026, 35, 1, NOW()),
(2, 10, 'Grade 10-B', 2026, 35, 2, NOW()),
(3, 11, 'Grade 11-A', 2026, 35, 3, NOW()),
(4, 11, 'Grade 11-B', 2026, 35, 5, NOW());

-- =====================================================================
-- 4. CURRICULUM SUBJECTS (UC-02)
-- =====================================================================

INSERT INTO subjects (id, subject_code, subject_name, grade_level, created_at) VALUES
(1, 'MATH10', 'Mathematics', 10, NOW()),
(2, 'SCI10', 'Science', 10, NOW()),
(3, 'ENG10', 'English Language', 10, NOW()),
(4, 'SIN10', 'Sinhala Language', 10, NOW()),
(5, 'HIST10', 'History', 10, NOW()),
(6, 'ICT10', 'Information & Communication Technology', 10, NOW()),
(7, 'MATH11', 'Mathematics', 11, NOW()),
(8, 'SCI11', 'Science', 11, NOW());

-- Teacher Subject Assignments
INSERT INTO teacher_subject_assignments (id, teacher_id, subject_id, class_id, academic_year) VALUES
(1, 1, 1, 1, 2026), -- Sunil -> MATH10 (10-A)
(2, 2, 1, 2, 2026), -- Kamala -> MATH10 (10-B)
(3, 3, 2, 1, 2026), -- Nihal -> SCI10 (10-A)
(4, 3, 2, 2, 2026), -- Nihal -> SCI10 (10-B)
(5, 4, 3, 1, 2026), -- Anoma -> ENG10 (10-A)
(6, 4, 3, 2, 2026), -- Anoma -> ENG10 (10-B)
(7, 5, 6, 1, 2026), -- Chaminda -> ICT10 (10-A)
(8, 6, 5, 1, 2026); -- Priyantha -> HIST10 (10-A)

-- =====================================================================
-- 5. PARENTS & STUDENTS (UC-01)
-- =====================================================================

INSERT INTO parents (id, user_id, father_name, mother_name, phone, nic, address, created_at) VALUES
(1, 5, 'Bandula Perera', 'Sunethra Perera', '0771122334', '197512345678', '124 Temple Road, Kurunegala', NOW()),
(2, NULL, 'Sarath Silva', 'Menaka Silva', '0775566778', '197898765432', '45 Kandy Road, Kurunegala', NOW());

INSERT INTO students (id, user_id, admission_number, first_name, last_name, dob, gender, parent_id, created_at) VALUES
(1, 4, 'WYC-2026-00101', 'Kasun', 'Perera', '2010-05-15', 'MALE', 1, NOW()),
(2, NULL, 'WYC-2026-00102', 'Nimasha', 'Silva', '2010-08-22', 'FEMALE', 2, NOW()),
(3, NULL, 'WYC-2026-00103', 'Kavindu', 'Bandara', '2010-03-10', 'MALE', 1, NOW()),
(4, NULL, 'WYC-2026-00104', 'Dilshan', 'Fernando', '2010-11-04', 'MALE', NULL, NOW()),
(5, NULL, 'WYC-2026-00105', 'Tharushi', 'Jayawardena', '2010-07-19', 'FEMALE', NULL, NOW()),
(6, NULL, 'WYC-2026-00201', 'Rashmi', 'Dissanayake', '2009-02-14', 'FEMALE', NULL, NOW()),
(7, NULL, 'WYC-2026-00202', 'Malith', 'Weerasekara', '2009-09-30', 'MALE', NULL, NOW()),
(8, NULL, 'WYC-2026-00203', 'Chathura', 'Gimhana', '2009-12-05', 'MALE', NULL, NOW());

-- Student Class Allocations
INSERT INTO student_class_allocations (id, student_id, class_id, academic_year, allocated_date, status) VALUES
(1, 1, 1, 2026, '2026-01-05', 'ACTIVE'), -- Kasun -> 10-A
(2, 2, 1, 2026, '2026-01-05', 'ACTIVE'), -- Nimasha -> 10-A
(3, 3, 1, 2026, '2026-01-05', 'ACTIVE'), -- Kavindu -> 10-A
(4, 4, 2, 2026, '2026-01-05', 'ACTIVE'), -- Dilshan -> 10-B
(5, 5, 2, 2026, '2026-01-05', 'ACTIVE'), -- Tharushi -> 10-B
(6, 6, 3, 2026, '2026-01-05', 'ACTIVE'), -- Rashmi -> 11-A
(7, 7, 3, 2026, '2026-01-05', 'ACTIVE'), -- Malith -> 11-A
(8, 8, 4, 2026, '2026-01-05', 'ACTIVE'); -- Chathura -> 11-B

-- =====================================================================
-- 6. TIME SLOTS & TIMETABLES (UC-05)
-- =====================================================================

INSERT INTO time_slots (id, day_of_week, period_number, start_time, end_time) VALUES
-- Monday
(1, 'MONDAY', 1, '08:00:00', '08:45:00'),
(2, 'MONDAY', 2, '08:45:00', '09:30:00'),
(3, 'MONDAY', 3, '09:30:00', '10:15:00'),
(4, 'MONDAY', 4, '10:30:00', '11:15:00'),
(5, 'MONDAY', 5, '11:15:00', '12:00:00'),
(6, 'MONDAY', 6, '12:00:00', '12:45:00'),
(7, 'MONDAY', 7, '13:15:00', '14:00:00'),
(8, 'MONDAY', 8, '14:00:00', '14:45:00'),
-- Tuesday
(9, 'TUESDAY', 1, '08:00:00', '08:45:00'),
(10, 'TUESDAY', 2, '08:45:00', '09:30:00'),
(11, 'TUESDAY', 3, '09:30:00', '10:15:00'),
(12, 'TUESDAY', 4, '10:30:00', '11:15:00'),
(13, 'TUESDAY', 5, '11:15:00', '12:00:00'),
(14, 'TUESDAY', 6, '12:00:00', '12:45:00'),
(15, 'TUESDAY', 7, '13:15:00', '14:00:00'),
(16, 'TUESDAY', 8, '14:00:00', '14:45:00'),
-- Wednesday
(17, 'WEDNESDAY', 1, '08:00:00', '08:45:00'),
(18, 'WEDNESDAY', 2, '08:45:00', '09:30:00'),
(19, 'WEDNESDAY', 3, '09:30:00', '10:15:00'),
(20, 'WEDNESDAY', 4, '10:30:00', '11:15:00'),
(21, 'WEDNESDAY', 5, '11:15:00', '12:00:00'),
(22, 'WEDNESDAY', 6, '12:00:00', '12:45:00'),
(23, 'WEDNESDAY', 7, '13:15:00', '14:00:00'),
(24, 'WEDNESDAY', 8, '14:00:00', '14:45:00'),
-- Thursday
(25, 'THURSDAY', 1, '08:00:00', '08:45:00'),
(26, 'THURSDAY', 2, '08:45:00', '09:30:00'),
(27, 'THURSDAY', 3, '09:30:00', '10:15:00'),
(28, 'THURSDAY', 4, '10:30:00', '11:15:00'),
(29, 'THURSDAY', 5, '11:15:00', '12:00:00'),
(30, 'THURSDAY', 6, '12:00:00', '12:45:00'),
(31, 'THURSDAY', 7, '13:15:00', '14:00:00'),
(32, 'THURSDAY', 8, '14:00:00', '14:45:00'),
-- Friday
(33, 'FRIDAY', 1, '08:00:00', '08:45:00'),
(34, 'FRIDAY', 2, '08:45:00', '09:30:00'),
(35, 'FRIDAY', 3, '09:30:00', '10:15:00'),
(36, 'FRIDAY', 4, '10:30:00', '11:15:00'),
(37, 'FRIDAY', 5, '11:15:00', '12:00:00'),
(38, 'FRIDAY', 6, '12:00:00', '12:45:00'),
(39, 'FRIDAY', 7, '13:15:00', '14:00:00'),
(40, 'FRIDAY', 8, '14:00:00', '14:45:00');

-- Master Timetable for Grade 10-A (Class 1)
INSERT INTO timetables (id, class_id, academic_year, term, status, created_at, updated_at) VALUES
(1, 1, 2026, 1, 'PUBLISHED', NOW(), NOW());

-- Timetable Entries for Grade 10-A (Conflict-free weekly schedule)
INSERT INTO timetable_entries (id, timetable_id, time_slot_id, subject_id, teacher_id, room_number) VALUES
-- Monday
(1, 1, 1, 1, 1, 'ROOM-10A'),  -- Mon P1: Maths (Sunil)
(2, 1, 2, 1, 1, 'ROOM-10A'),  -- Mon P2: Maths (Sunil)
(3, 1, 3, 2, 3, 'LAB-01'),    -- Mon P3: Science (Nihal)
(4, 1, 4, 3, 4, 'ROOM-10A'),  -- Mon P4: English (Anoma)
(5, 1, 5, 5, 6, 'ROOM-10A'),  -- Mon P5: History (Priyantha)
(6, 1, 6, 6, 5, 'IT-LAB'),    -- Mon P6: ICT (Chaminda)
-- Tuesday
(7, 1, 9, 2, 3, 'LAB-01'),    -- Tue P1: Science (Nihal)
(8, 1, 10, 2, 3, 'LAB-01'),   -- Tue P2: Science (Nihal)
(9, 1, 11, 1, 1, 'ROOM-10A'),  -- Tue P3: Maths (Sunil)
(10, 1, 12, 3, 4, 'ROOM-10A'), -- Tue P4: English (Anoma)
-- Wednesday
(11, 1, 17, 6, 5, 'IT-LAB'),   -- Wed P1: ICT (Chaminda)
(12, 1, 18, 6, 5, 'IT-LAB'),   -- Wed P2: ICT (Chaminda)
(13, 1, 19, 1, 1, 'ROOM-10A'), -- Wed P3: Maths (Sunil)
(14, 1, 20, 5, 6, 'ROOM-10A'); -- Wed P4: History (Priyantha)

-- =====================================================================
-- 7. ATTENDANCE MANAGEMENT (UC-03)
-- =====================================================================

-- Attendance for Grade 10-A on 2026-09-15 (Finalized/Locked)
INSERT INTO attendance_records (id, class_id, teacher_id, attendance_date, academic_year, is_locked, submitted_at) VALUES
(1, 1, 1, '2026-09-15', 2026, 1, NOW()),
(2, 1, 1, '2026-09-16', 2026, 1, NOW()),
(3, 1, 1, '2026-09-17', 2026, 0, NOW());

INSERT INTO attendance_entries (id, attendance_record_id, student_id, status, remarks) VALUES
-- Day 1
(1, 1, 1, 'PRESENT', 'On time'),
(2, 1, 2, 'PRESENT', 'On time'),
(3, 1, 3, 'LATE', 'Arrived 15 mins late'),
-- Day 2
(4, 2, 1, 'PRESENT', 'On time'),
(5, 2, 2, 'ABSENT', 'Medical leave'),
(6, 2, 3, 'PRESENT', 'On time'),
-- Day 3 (Today)
(7, 3, 1, 'PRESENT', 'On time'),
(8, 3, 2, 'PRESENT', 'On time'),
(9, 3, 3, 'PRESENT', 'On time');

-- =====================================================================
-- 8. EXAMINATIONS & ACADEMIC PERFORMANCE (UC-04)
-- =====================================================================

INSERT INTO examinations (id, exam_name, term, academic_year, status, created_at) VALUES
(1, 'Term 1 Mid-Year Examination 2026', 1, 2026, 'PUBLISHED', NOW());

INSERT INTO exam_papers (id, exam_id, subject_id, grade_level, max_marks) VALUES
(1, 1, 1, 10, 100.00), -- Maths 10
(2, 1, 2, 10, 100.00), -- Science 10
(3, 1, 3, 10, 100.00); -- English 10

INSERT INTO exam_results (id, exam_paper_id, student_id, marks_obtained, grade, is_published, created_at) VALUES
-- Kasun Perera (Top performer)
(1, 1, 1, 94.00, 'A+', 1, NOW()),
(2, 2, 1, 88.00, 'A', 1, NOW()),
(3, 3, 1, 82.00, 'A', 1, NOW()),
-- Nimasha Silva
(4, 1, 2, 85.00, 'A', 1, NOW()),
(5, 2, 2, 92.00, 'A+', 1, NOW()),
(6, 3, 2, 78.00, 'B', 1, NOW()),
-- Kavindu Bandara
(7, 1, 3, 68.00, 'C', 1, NOW()),
(8, 2, 3, 72.00, 'B', 1, NOW()),
(9, 3, 3, 64.00, 'C', 1, NOW());

-- =====================================================================
-- 9. FEE & PAYMENT MANAGEMENT (UC-06)
-- =====================================================================

INSERT INTO fee_structures (id, name, fee_type, grade_level, academic_year, term, amount, due_date, description, is_active, created_at, updated_at) VALUES
(1, 'Grade 10 Term 1 Tuition Fee', 'TUITION', 10, 2026, 1, 25000.00, '2026-10-31', 'First term secondary tuition fees', 1, NOW(), NOW()),
(2, 'Grade 10 Annual Facility & Sports Fee', 'FACILITY', 10, 2026, 1, 8000.00, '2026-09-30', 'Sports complex and science lab maintenance', 1, NOW(), NOW()),
(3, 'Grade 11 Term 1 Tuition Fee', 'TUITION', 11, 2026, 1, 28000.00, '2026-10-31', 'First term O/L tuition fees', 1, NOW(), NOW()),
(4, 'Annual Digital Lab & Library Fee', 'LIBRARY', NULL, 2026, 1, 5000.00, '2026-11-15', 'School-wide digital library access', 1, NOW(), NOW());

-- Student Fee Accounts
INSERT INTO student_fee_accounts (id, student_id, student_admission_number, student_name, grade_level, fee_structure_id, total_amount, paid_amount, balance_amount, status, due_date, academic_year, remarks, created_at, updated_at) VALUES
-- Kasun Perera (Tuition: FULLY PAID)
(1, 1, 'WYC-2026-00101', 'Kasun Perera', 10, 1, 25000.00, 25000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Direct counter payment', NOW(), NOW()),
-- Kasun Perera (Facility: PENDING)
(2, 1, 'WYC-2026-00101', 'Kasun Perera', 10, 2, 8000.00, 0.00, 8000.00, 'PENDING', '2026-09-30', 2026, 'Regular enrollment charge', NOW(), NOW()),
-- Nimasha Silva (Tuition: PARTIALLY PAID)
(3, 2, 'WYC-2026-00102', 'Nimasha Silva', 10, 1, 25000.00, 15000.00, 10000.00, 'PARTIAL', '2026-10-31', 2026, 'Instalment payment', NOW(), NOW());

-- Payment Slips (Approved Payment for Kasun)
INSERT INTO payment_slips (id, fee_account_id, student_id, parent_id, amount_paid, payment_date, payment_method, transaction_reference, slip_image_url, verification_status, reviewed_by, review_remarks, reviewed_at, created_at, updated_at) VALUES
(1, 1, 1, 1, 25000.00, NOW(), 'CASH', 'REC-2026-00101-01', NULL, 'APPROVED', 'Admin Counter', 'Cash received in full at office counter', NOW(), NOW(), NOW());

-- Payment Receipts
INSERT INTO payment_receipts (id, payment_slip_id, receipt_number, student_id, student_name, student_admission_number, fee_structure_name, fee_type, amount_paid, remaining_balance, receipt_type, issued_by, notes, created_at) VALUES
(1, 1, 'RCPT-2026-00001', 1, 'Kasun Perera', 'WYC-2026-00101', 'Grade 10 Term 1 Tuition Fee', 'TUITION', 25000.00, 0.00, 'FULL', 'Admin Counter', 'Official receipt for first term tuition fee', NOW());

-- =====================================================================
-- END OF ACTUAL DATA SEEDING
-- =====================================================================
