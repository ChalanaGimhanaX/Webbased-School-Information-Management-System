"""
Generator script to produce complete, authentic, 100% collision-free Sri Lankan seed data
for Wycherley International School, Gampaha (SIMS).
Generates:
- 58 Users (Admin, Head of Academic, Bursar, 15 Teachers, 10 Parents, 30 Students)
- 10 Parents with authentic Sri Lankan NICs, phone numbers, and addresses
- 15 Teachers with employee numbers, qualifications, and user links
- 7 Staff & Academic Supervisors
- 36 Subjects across Grades 9, 10, 11
- 6 Academic Classes (10-A, 10-B, 11-A, 11-B, 9-A, 9-B)
- 30 Students with WIS admission IDs, DOBs, parent links, and user links
- 30 Active Class Allocations
- 64 Teacher Subject Assignments
- 40 Time Slots (5 days x 8 periods)
- 6 Published Timetables with 240 Collision-Free Timetable Entries (all 6 classes x 40 slots)
- 156 Attendance Records across 26 school dates (including TODAY 2026-10-06) with 780 Attendance Entries
- 3 Examinations (Term 1, Term 2, Term 3 Draft)
- 54 Exam Papers across Grades 9, 10, 11
- 546 Graded Exam Results with realistic marks and GPA distribution
- 10 Fee Structures
- 26 Student Fee Accounts across PAID, PARTIAL, PENDING, and OVERDUE statuses
- 15 Payment Slips across APPROVED, PENDING, and REJECTED statuses
- 13 Payment Receipts with full/partial breakdowns
"""
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_FILE = ROOT / "database/seed_actual_data.sql"

def generate():
    # -------------------------------------------------------------
    # 1. USERS
    # Passwords:
    # admin -> admin123 ($2a$10$jQ5U7328CX/nBYiXT9TmOuabDNfNX7uXPFv3ZuDWR9Ic5V6oLnL1W)
    # head_academic -> academic123 ($2a$10$I6gpPe3Cw.T4lcixgwBMge8KlkMTg1f3rVFZOTMaLk9b66EBbzQd6)
    # bursar -> bursar123 ($2a$10$jQ5U7328CX/nBYiXT9TmOuabDNfNX7uXPFv3ZuDWR9Ic5V6oLnL1W)
    # teacher1..15 -> teacher123 ($2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW)
    # parent1..10 -> parent123 ($2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu)
    # student1..30 -> student123 ($2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq)
    # -------------------------------------------------------------
    USERS = []
    # 1. Admin
    USERS.append((1, 'admin', 'admin@wycherley.lk', '$2a$10$jQ5U7328CX/nBYiXT9TmOuabDNfNX7uXPFv3ZuDWR9Ic5V6oLnL1W', 'ADMIN', 1))
    # 2. Head of Academic
    USERS.append((2, 'head_academic', 'academic@wycherley.lk', '$2a$10$I6gpPe3Cw.T4lcixgwBMge8KlkMTg1f3rVFZOTMaLk9b66EBbzQd6', 'HEAD_OF_ACADEMIC', 1))
    # 3. Bursar / Finance
    USERS.append((3, 'bursar', 'bursar@wycherley.lk', '$2a$10$jQ5U7328CX/nBYiXT9TmOuabDNfNX7uXPFv3ZuDWR9Ic5V6oLnL1W', 'ADMIN', 1))

    # 4..18: Teachers 1..15
    for t_id in range(1, 16):
        u_id = 3 + t_id
        USERS.append((u_id, f'teacher{t_id}', f'teacher{t_id}@wycherley.lk', '$2a$10$gILGTGYh2QZ8/SrLsHBj3uCQwbl0UkUSAV4u9XrE0z7b5GWtnZFCW', 'TEACHER', 1))

    # 19..28: Parents 1..10
    for p_id in range(1, 11):
        u_id = 18 + p_id
        USERS.append((u_id, f'parent{p_id}', f'parent{p_id}@wycherley.lk', '$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu', 'PARENT', 1))

    # 29..58: Students 1..30
    for s_id in range(1, 31):
        u_id = 28 + s_id
        USERS.append((u_id, f'student{s_id}', f'student{s_id}@wycherley.lk', '$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq', 'STUDENT', 1))

    # -------------------------------------------------------------
    # 2. PARENTS
    # (id, user_id, father_name, mother_name, phone, nic, address)
    # -------------------------------------------------------------
    PARENTS = [
        (1, 19, 'Bandula Perera', 'Sunethra Perera', '0771122334', '197512345678', '124 Temple Road, Yakkala, Gampaha'),
        (2, 20, 'Sarath Silva', 'Menaka Silva', '0775566778', '197898765432', '45 Kandy Road, Miriswatta, Gampaha'),
        (3, 21, 'Gamini Dissanayake', 'Priyani Dissanayake', '0712345678', '197623456781', '78 Bauddhaloka Mawatha, Gampaha'),
        (4, 22, 'Rohan Jayawardena', 'Nilmini Jayawardena', '0763456789', '197934567892', '15 Negombo Road, Ja-Ela'),
        (5, 23, 'Mohan Fernando', 'Champa Fernando', '0784567890', '198145678903', '210 Main Street, Negombo'),
        (6, 24, 'Asoka Wickramasinghe', 'Sandya Wickramasinghe', '0705678901', '197456789014', '88 Court Road, Gampaha'),
        (7, 25, 'Douglas Weerasekara', 'Kusuma Weerasekara', '0726789012', '197767890125', '34 Station Road, Ganemulla'),
        (8, 26, 'Anura Senanayake', 'Deepthi Senanayake', '0757890123', '198078901236', '56 Colombo Road, Kadawatha'),
        (9, 27, 'Sunil Gunaratne', 'Ramani Gunaratne', '0778901234', '197889012347', '92 Flower Road, Kelaniya'),
        (10, 28, 'Nimal Rajapaksha', 'Chandra Rajapaksha', '0719012345', '197390123458', '14 Oruthota Road, Gampaha'),
    ]

    # -------------------------------------------------------------
    # 3. TEACHERS
    # (id, user_id, employee_number, first_name, last_name, qualification, phone, status, hire_date)
    # -------------------------------------------------------------
    TEACHERS = [
        (1, 4, 'EMP-WIS-001', 'Sunil', 'Fernando', 'BSc Education (Mathematics)', '0771234567', 'ACTIVE', '2020-01-15'),
        (2, 5, 'EMP-WIS-002', 'Kamala', 'Rajapaksha', 'MSc Applied Mathematics (Peradeniya)', '0779876543', 'ACTIVE', '2018-05-10'),
        (3, 6, 'EMP-WIS-003', 'Nihal', 'Jayasinghe', 'BSc Biological Science (Colombo)', '0714567890', 'ACTIVE', '2021-03-01'),
        (4, 7, 'EMP-WIS-004', 'Anoma', 'Wickramasinghe', 'BA English Language & Literature (Kelaniya)', '0763456789', 'ACTIVE', '2019-09-15'),
        (5, 8, 'EMP-WIS-005', 'Chaminda', 'Silva', 'BSc Information Technology (SLIIT)', '0725678901', 'ACTIVE', '2022-01-10'),
        (6, 9, 'EMP-WIS-006', 'Priyantha', 'Perera', 'BA Social Sciences & History (Peradeniya)', '0756789012', 'ACTIVE', '2017-06-20'),
        (7, 10, 'EMP-WIS-007', 'Nalini', 'Gunawardena', 'BSc Physical Sciences (Sri Jayewardenepura)', '0772345678', 'ACTIVE', '2019-02-01'),
        (8, 11, 'EMP-WIS-008', 'Chandrasiri', 'Bandara', 'BCom Commerce & Accounting (Kelaniya)', '0713456789', 'ACTIVE', '2020-08-15'),
        (9, 12, 'EMP-WIS-009', 'Wimalarathana', 'Thero', 'BA Buddhist Philosophy & Pali (Honours)', '0764567890', 'ACTIVE', '2018-01-10'),
        (10, 13, 'EMP-WIS-010', 'Deepika', 'Samaraweera', 'BA Sinhala Studies (Honours, Colombo)', '0785678901', 'ACTIVE', '2021-06-01'),
        (11, 14, 'EMP-WIS-011', 'Jagath', 'Jayakody', 'BSc Physical Education & Sports Management', '0706789012', 'ACTIVE', '2022-03-15'),
        (12, 15, 'EMP-WIS-012', 'Menaka', 'Karunaratne', 'BSc Chemistry (Special, Colombo)', '0727890123', 'ON_LEAVE', '2019-11-01'),
        (13, 16, 'EMP-WIS-013', 'Lalith', 'Abeysekara', 'MSc Computer Systems & Networking', '0758901234', 'ACTIVE', '2023-01-15'),
        (14, 17, 'EMP-WIS-014', 'Kanthi', 'Jayasuriya', 'BA English Language Teaching (Open Univ)', '0779012345', 'ACTIVE', '2018-09-01'),
        (15, 18, 'EMP-WIS-015', 'Rohana', 'Dissanayake', 'BSc Mathematics & Statistics', '0710123456', 'ON_LEAVE', '2017-04-10'),
    ]

    # -------------------------------------------------------------
    # 4. STAFF
    # (id, employee_number, first_name, last_name, job_position, department, qualification, phone, email, employment_type, salary, address, hire_date, status)
    # -------------------------------------------------------------
    STAFF = [
        (1, 'EMP-STF-001', 'Rohan', 'Wickramasinghe', 'Head of Academic / Sectional Supervisor', 'Academic Affairs', 'PhD in Educational Leadership, MSc Ed', '0771112233', 'rohan.w@wycherley.lk', 'Full Time', 285000.0, '12 Park Avenue, Gampaha', '2015-01-10', 'ACTIVE'),
        (2, 'EMP-STF-002', 'Swarna', 'Jayatilleke', 'Sectional Supervisor (Middle School)', 'Academic Affairs', 'MA in School Administration', '0712223344', 'swarna.j@wycherley.lk', 'Full Time', 220000.0, '45 Kandy Road, Yakkala, Gampaha', '2016-04-15', 'ACTIVE'),
        (3, 'EMP-STF-003', 'Mahinda', 'Senaratne', 'Bursar & Senior Finance Officer', 'Finance & Bursar', 'FCA, BCom Accounting', '0763334455', 'bursar@wycherley.lk', 'Full Time', 260000.0, '88 Court Road, Gampaha', '2017-08-01', 'ACTIVE'),
        (4, 'EMP-STF-004', 'Gayan', 'Hettiarachchi', 'Senior IT Systems Administrator', 'Information Technology', 'BSc Computer Systems & Networks', '0784445566', 'itadmin@wycherley.lk', 'Full Time', 195000.0, '32 Negombo Road, Ja-Ela', '2021-02-01', 'ACTIVE'),
        (5, 'EMP-STF-005', 'Malathi', 'Perera', 'School Registrar & Admissions Head', 'Admissions', 'BA Public Administration', '0705556677', 'registrar@wycherley.lk', 'Full Time', 180000.0, '14 Oruthota Road, Gampaha', '2018-05-15', 'ACTIVE'),
        (6, 'EMP-STF-006', 'Shirani', 'Alwis', 'Chief Librarian', 'Library & Learning Center', 'MLS Library Science', '0726667788', 'library@wycherley.lk', 'Full Time', 145000.0, '67 Temple Road, Kelaniya', '2019-09-01', 'ACTIVE'),
        (7, 'EMP-STF-007', 'Susantha', 'Kumara', 'Senior Laboratory Technologist', 'Science Laboratories', 'National Diploma in Technology (NDT)', '0757778899', 'lab@wycherley.lk', 'Full Time', 130000.0, '19 Station Road, Ganemulla', '2020-03-10', 'ACTIVE'),
    ]

    # -------------------------------------------------------------
    # 5. ACADEMIC CLASSES
    # (id, grade_level, class_name, academic_year, capacity, class_teacher_id)
    # -------------------------------------------------------------
    CLASSES = [
        (1, 10, 'Grade 10-A', 2026, 35, 1),
        (2, 10, 'Grade 10-B', 2026, 35, 2),
        (3, 11, 'Grade 11-A', 2026, 35, 3),
        (4, 11, 'Grade 11-B', 2026, 35, 5),
        (5, 9,  'Grade 9-A',  2026, 35, 4),
        (6, 9,  'Grade 9-B',  2026, 35, 10),
    ]

    # -------------------------------------------------------------
    # 6. SUBJECTS
    # (id, subject_code, subject_name, grade_level)
    # -------------------------------------------------------------
    SUBJECTS = [
        # Grade 10
        (1, 'MATH10', 'Mathematics', 10),
        (2, 'SCI10', 'Science', 10),
        (3, 'ENG10', 'English Language', 10),
        (4, 'SIN10', 'Sinhala Language', 10),
        (5, 'HIST10', 'History', 10),
        (6, 'ICT10', 'Information & Communication Technology', 10),
        (110, 'COM10', 'Business & Accounting Studies', 10),
        (111, 'BUD10', 'Buddhism', 10),
        (112, 'LIT10', 'English Literature', 10),
        (113, 'GEO10', 'Geography', 10),
        (114, 'HPE10', 'Health & Physical Education', 10),
        (115, 'CHEM10', 'Chemistry', 10),
        (116, 'PHYS10', 'Physics', 10),

        # Grade 11
        (7, 'MATH11', 'Mathematics', 11),
        (8, 'SCI11', 'Science', 11),
        (117, 'ENG11', 'English Language', 11),
        (118, 'SIN11', 'Sinhala Language', 11),
        (119, 'HIST11', 'History', 11),
        (120, 'ICT11', 'Information & Communication Technology', 11),
        (121, 'COM11', 'Business & Accounting Studies', 11),
        (122, 'BUD11', 'Buddhism', 11),
        (123, 'LIT11', 'English Literature', 11),
        (124, 'GEO11', 'Geography', 11),
        (125, 'HPE11', 'Health & Physical Education', 11),
        (126, 'CHEM11', 'Chemistry', 11),
        (127, 'PHYS11', 'Physics', 11),

        # Grade 9
        (101, 'MATH09', 'Mathematics', 9),
        (102, 'SCI09', 'Science', 9),
        (103, 'ENG09', 'English Language', 9),
        (104, 'SIN09', 'Sinhala Language', 9),
        (105, 'HIST09', 'History', 9),
        (106, 'ICT09', 'Information & Communication Technology', 9),
        (107, 'GEO09', 'Geography', 9),
        (108, 'BUD09', 'Buddhism', 9),
        (109, 'HPE09', 'Health & Physical Education', 9),
        (128, 'LIT09', 'English Literature', 9),
    ]

    # -------------------------------------------------------------
    # 7. TEACHER SUBJECT ASSIGNMENTS
    # (id, teacher_id, subject_id, class_id, academic_year)
    # -------------------------------------------------------------
    TSA = [
        # Grade 10-A (Class 1)
        (1, 1, 1, 1, 2026),     # Sunil -> MATH10
        (2, 3, 2, 1, 2026),     # Nihal -> SCI10
        (3, 4, 3, 1, 2026),     # Anoma -> ENG10
        (4, 10, 4, 1, 2026),    # Deepika -> SIN10
        (5, 6, 5, 1, 2026),     # Priyantha -> HIST10
        (6, 5, 6, 1, 2026),     # Chaminda -> ICT10
        (7, 8, 110, 1, 2026),   # Chandrasiri -> COM10
        (8, 9, 111, 1, 2026),   # Wimalarathana -> BUD10
        (9, 14, 112, 1, 2026),  # Kanthi -> LIT10
        (10, 6, 113, 1, 2026),  # Priyantha -> GEO10
        (11, 11, 114, 1, 2026), # Jagath -> HPE10
        (12, 3, 115, 1, 2026),  # Nihal -> CHEM10
        (13, 7, 116, 1, 2026),  # Nalini -> PHYS10

        # Grade 10-B (Class 2)
        (14, 2, 1, 2, 2026),    # Kamala -> MATH10
        (15, 7, 2, 2, 2026),    # Nalini -> SCI10
        (16, 14, 3, 2, 2026),   # Kanthi -> ENG10
        (17, 10, 4, 2, 2026),   # Deepika -> SIN10
        (18, 6, 5, 2, 2026),    # Priyantha -> HIST10
        (19, 13, 6, 2, 2026),   # Lalith -> ICT10
        (20, 8, 110, 2, 2026),  # Chandrasiri -> COM10
        (21, 9, 111, 2, 2026),  # Wimalarathana -> BUD10
        (22, 4, 112, 2, 2026),  # Anoma -> LIT10
        (23, 6, 113, 2, 2026),  # Priyantha -> GEO10
        (24, 11, 114, 2, 2026), # Jagath -> HPE10

        # Grade 11-A (Class 3)
        (25, 2, 7, 3, 2026),    # Kamala -> MATH11
        (26, 3, 8, 3, 2026),    # Nihal -> SCI11
        (27, 4, 117, 3, 2026),  # Anoma -> ENG11
        (28, 10, 118, 3, 2026), # Deepika -> SIN11
        (29, 6, 119, 3, 2026),  # Priyantha -> HIST11
        (30, 5, 120, 3, 2026),  # Chaminda -> ICT11
        (31, 8, 121, 3, 2026),  # Chandrasiri -> COM11
        (32, 9, 122, 3, 2026),  # Wimalarathana -> BUD11
        (33, 6, 124, 3, 2026),  # Priyantha -> GEO11
        (34, 11, 125, 3, 2026), # Jagath -> HPE11
        (35, 3, 126, 3, 2026),  # Nihal -> CHEM11
        (36, 7, 127, 3, 2026),  # Nalini -> PHYS11

        # Grade 11-B (Class 4)
        (37, 1, 7, 4, 2026),    # Sunil -> MATH11
        (38, 7, 8, 4, 2026),    # Nalini -> SCI11
        (39, 14, 117, 4, 2026), # Kanthi -> ENG11
        (40, 10, 118, 4, 2026), # Deepika -> SIN11
        (41, 6, 119, 4, 2026),  # Priyantha -> HIST11
        (42, 13, 120, 4, 2026), # Lalith -> ICT11
        (43, 8, 121, 4, 2026),  # Chandrasiri -> COM11
        (44, 9, 122, 4, 2026),  # Wimalarathana -> BUD11
        (45, 4, 123, 4, 2026),  # Anoma -> LIT11
        (46, 6, 124, 4, 2026),  # Priyantha -> GEO11
        (47, 11, 125, 4, 2026), # Jagath -> HPE11

        # Grade 9-A (Class 5)
        (48, 1, 101, 5, 2026),  # Sunil -> MATH09
        (49, 7, 102, 5, 2026),  # Nalini -> SCI09
        (50, 4, 103, 5, 2026),  # Anoma -> ENG09
        (51, 10, 104, 5, 2026), # Deepika -> SIN09
        (52, 6, 105, 5, 2026),  # Priyantha -> HIST09
        (53, 5, 106, 5, 2026),  # Chaminda -> ICT09
        (54, 6, 107, 5, 2026),  # Priyantha -> GEO09
        (55, 9, 108, 5, 2026),  # Wimalarathana -> BUD09
        (56, 11, 109, 5, 2026), # Jagath -> HPE09
        (57, 14, 128, 5, 2026), # Kanthi -> LIT09

        # Grade 9-B (Class 6)
        (58, 2, 101, 6, 2026),  # Kamala -> MATH09
        (59, 3, 102, 6, 2026),  # Nihal -> SCI09
        (60, 14, 103, 6, 2026), # Kanthi -> ENG09
        (61, 10, 104, 6, 2026), # Deepika -> SIN09
        (62, 6, 105, 6, 2026),  # Priyantha -> HIST09
        (63, 13, 106, 6, 2026), # Lalith -> ICT09
        (64, 6, 107, 6, 2026),  # Priyantha -> GEO09
        (65, 9, 108, 6, 2026),  # Wimalarathana -> BUD09
        (66, 11, 109, 6, 2026), # Jagath -> HPE09
        (67, 4, 128, 6, 2026),  # Anoma -> LIT09
    ]

    # -------------------------------------------------------------
    # 8. STUDENTS
    # (id, user_id, admission_number, first_name, last_name, dob, gender, parent_id, active, class_id)
    # user_id is 28 + s_id (student1..30)
    # -------------------------------------------------------------
    STUDENTS = [
        # Grade 10-A (Class 1)
        (1, 29, 'WIS-2026-00101', 'Kasun', 'Perera', '2010-05-15', 'MALE', 1, 1, 1),
        (2, 30, 'WIS-2026-00102', 'Nimasha', 'Silva', '2010-08-22', 'FEMALE', 2, 1, 1),
        (3, 31, 'WIS-2026-00103', 'Kavindu', 'Bandara', '2010-03-10', 'MALE', 1, 1, 1),
        (9, 37, 'WIS-2026-00106', 'Dinuka', 'Wickramasinghe', '2010-04-18', 'MALE', 6, 1, 1),
        (10, 38, 'WIS-2026-00107', 'Sanduni', 'Senanayake', '2010-09-12', 'FEMALE', 8, 1, 1),
        (11, 39, 'WIS-2026-00108', 'Akila', 'Gunaratne', '2010-01-25', 'MALE', 9, 1, 1),
        (12, 40, 'WIS-2026-00109', 'Hansika', 'Rajapaksha', '2010-06-30', 'FEMALE', 10, 1, 1),

        # Grade 10-B (Class 2)
        (4, 32, 'WIS-2026-00104', 'Dilshan', 'Fernando', '2010-11-04', 'MALE', 5, 1, 2),
        (5, 33, 'WIS-2026-00105', 'Tharushi', 'Jayawardena', '2010-07-19', 'FEMALE', 4, 1, 2),
        (13, 41, 'WIS-2026-00110', 'Senura', 'Fernando', '2010-02-14', 'MALE', 5, 1, 2),
        (14, 42, 'WIS-2026-00111', 'Thisuri', 'Perera', '2010-10-08', 'FEMALE', 1, 1, 2),
        (15, 43, 'WIS-2026-00112', 'Isuru', 'Dissanayake', '2010-12-19', 'MALE', 3, 1, 2),
        (16, 44, 'WIS-2026-00113', 'Oshadhi', 'Jayawardena', '2010-08-05', 'FEMALE', 4, 1, 2),

        # Grade 11-A (Class 3)
        (6, 34, 'WIS-2024-00201', 'Rashmi', 'Dissanayake', '2009-02-14', 'FEMALE', 3, 1, 3),
        (7, 35, 'WIS-2024-00202', 'Malith', 'Weerasekara', '2009-09-30', 'MALE', 7, 1, 3),
        (17, 45, 'WIS-2024-00204', 'Ravindu', 'Wickramasinghe', '2009-03-22', 'MALE', 6, 1, 3),
        (18, 46, 'WIS-2024-00205', 'Sachini', 'Gunaratne', '2009-07-11', 'FEMALE', 9, 1, 3),
        (19, 47, 'WIS-2024-00206', 'Nuwan', 'Rajapaksha', '2009-11-28', 'MALE', 10, 1, 3),

        # Grade 11-B (Class 4)
        (8, 36, 'WIS-2024-00203', 'Chathura', 'Gimhana', '2009-12-05', 'MALE', 3, 1, 4),
        (20, 48, 'WIS-2024-00207', 'Dulani', 'Senanayake', '2009-05-17', 'FEMALE', 8, 1, 4),
        (21, 49, 'WIS-2024-00208', 'Dhanushka', 'Fernando', '2009-08-23', 'MALE', 5, 1, 4),
        (22, 50, 'WIS-2024-00209', 'Amanda', 'Weerasekara', '2009-10-14', 'FEMALE', 7, 1, 4),

        # Grade 9-A (Class 5)
        (23, 51, 'WIS-2025-00301', 'Nethmi', 'Silva', '2011-04-12', 'FEMALE', 2, 1, 5),
        (24, 52, 'WIS-2025-00302', 'Kaveen', 'Perera', '2011-06-25', 'MALE', 1, 1, 5),
        (25, 53, 'WIS-2025-00303', 'Sithum', 'Jayawardena', '2011-09-03', 'MALE', 4, 1, 5),
        (26, 54, 'WIS-2025-00304', 'Hiruni', 'Dissanayake', '2011-11-15', 'FEMALE', 3, 1, 5),

        # Grade 9-B (Class 6)
        (27, 55, 'WIS-2025-00305', 'Charith', 'Wickramasinghe', '2011-01-30', 'MALE', 6, 1, 6),
        (28, 56, 'WIS-2025-00306', 'Methma', 'Senanayake', '2011-08-18', 'FEMALE', 8, 1, 6),
        (29, 57, 'WIS-2025-00307', 'Sanjana', 'Fernando', '2011-03-09', 'FEMALE', 5, 1, 6),
        (30, 58, 'WIS-2025-00308', 'Janith', 'Rajapaksha', '2011-12-21', 'MALE', 10, 1, 6),
    ]

    # Allocations
    ALLOCATIONS = []
    for alloc_id, s in enumerate(STUDENTS, start=1):
        s_id = s[0]
        c_id = s[9]
        ALLOCATIONS.append((alloc_id, s_id, c_id, 2026, '2026-01-05', 'ACTIVE'))

    # -------------------------------------------------------------
    # 9. TIME SLOTS (40 standard slots)
    # -------------------------------------------------------------
    DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    TIMES = [
        ('08:00:00', '08:45:00'),
        ('08:45:00', '09:30:00'),
        ('09:30:00', '10:15:00'),
        ('10:30:00', '11:15:00'),
        ('11:15:00', '12:00:00'),
        ('12:00:00', '12:45:00'),
        ('13:15:00', '14:00:00'),
        ('14:00:00', '14:45:00'),
    ]
    TIME_SLOTS = []
    slot_id = 1
    for day in DAYS:
        for p_idx, (st, en) in enumerate(TIMES, start=1):
            TIME_SLOTS.append((slot_id, day, p_idx, st, en))
            slot_id += 1

    # -------------------------------------------------------------
    # 10. TIMETABLES & ENTRIES (Collision-Free Across All 6 Classes)
    # -------------------------------------------------------------
    TIMETABLES = [
        (1, 1, 2026, 1, 'PUBLISHED'),
        (2, 2, 2026, 1, 'PUBLISHED'),
        (3, 3, 2026, 1, 'PUBLISHED'),
        (4, 4, 2026, 1, 'PUBLISHED'),
        (5, 5, 2026, 1, 'PUBLISHED'),
        (6, 6, 2026, 1, 'PUBLISHED'),
    ]

    # Use our verified collision-free solver logic
    CLASS_DEMANDS = {
        1: [
            (1, 1, 'ROOM-10A', 6),
            (2, 3, 'LAB-01', 5),
            (115, 3, 'LAB-01', 1),
            (3, 4, 'ROOM-10A', 5),
            (4, 10, 'ROOM-10A', 4),
            (5, 6, 'ROOM-10A', 3),
            (6, 5, 'IT-LAB-1', 4),
            (110, 8, 'ROOM-10A', 3),
            (111, 9, 'ROOM-10A', 3),
            (112, 14, 'ROOM-10A', 2),
            (113, 6, 'ROOM-10A', 2),
            (116, 7, 'LAB-02', 1),
            (114, 11, 'SPORTS-GRD', 1),
        ],
        2: [
            (1, 2, 'ROOM-10B', 6),
            (2, 7, 'LAB-02', 6),
            (3, 14, 'ROOM-10B', 5),
            (4, 10, 'ROOM-10B', 4),
            (5, 6, 'ROOM-10B', 3),
            (6, 13, 'IT-LAB-2', 4),
            (110, 8, 'ROOM-10B', 3),
            (111, 9, 'ROOM-10B', 3),
            (112, 4, 'ROOM-10B', 2),
            (113, 6, 'ROOM-10B', 2),
            (114, 11, 'SPORTS-GRD', 2),
        ],
        3: [
            (7, 2, 'ROOM-11A', 6),
            (8, 3, 'LAB-03', 5),
            (126, 3, 'LAB-01', 1),
            (117, 4, 'ROOM-11A', 5),
            (118, 10, 'ROOM-11A', 4),
            (119, 6, 'ROOM-11A', 3),
            (120, 5, 'IT-LAB-3', 4),
            (121, 8, 'ROOM-11A', 3),
            (122, 9, 'ROOM-11A', 3),
            (127, 7, 'LAB-03', 2),
            (124, 6, 'ROOM-11A', 2),
            (125, 11, 'SPORTS-GRD', 2),
        ],
        4: [
            (7, 1, 'ROOM-11B', 6),
            (8, 7, 'LAB-02', 6),
            (117, 14, 'ROOM-11B', 5),
            (118, 10, 'ROOM-11B', 4),
            (119, 6, 'ROOM-11B', 3),
            (120, 13, 'IT-LAB-2', 4),
            (121, 8, 'ROOM-11B', 3),
            (122, 9, 'ROOM-11B', 3),
            (123, 4, 'ROOM-11B', 2),
            (124, 6, 'ROOM-11B', 2),
            (125, 11, 'SPORTS-GRD', 2),
        ],
        5: [
            (101, 1, 'ROOM-09A', 6),
            (102, 7, 'LAB-03', 6),
            (103, 4, 'ROOM-09A', 5),
            (104, 10, 'ROOM-09A', 4),
            (105, 6, 'ROOM-09A', 4),
            (106, 5, 'IT-LAB-1', 4),
            (107, 6, 'ROOM-09A', 3),
            (108, 9, 'ROOM-09A', 3),
            (109, 11, 'SPORTS-GRD', 2),
            (128, 14, 'ROOM-09A', 3),
        ],
        6: [
            (101, 2, 'ROOM-09B', 6),
            (102, 3, 'LAB-01', 6),
            (103, 14, 'ROOM-09B', 5),
            (104, 10, 'ROOM-09B', 4),
            (105, 6, 'ROOM-09B', 4),
            (106, 13, 'IT-LAB-2', 4),
            (107, 6, 'ROOM-09B', 3),
            (108, 9, 'ROOM-09B', 3),
            (109, 11, 'SPORTS-GRD', 2),
            (128, 4, 'ROOM-09B', 3),
        ]
    }

    # Deterministic seed 42 finds valid schedule on attempt 0
    random.seed(42)
    slots_entries = {cid: {} for cid in range(1, 7)}
    teacher_busy = {s: set() for s in range(1, 41)}
    room_busy = {s: set() for s in range(1, 41)}

    for cid in range(1, 7):
        periods = []
        for sub_id, tech_id, room, cnt in CLASS_DEMANDS[cid]:
            for _ in range(cnt):
                periods.append((sub_id, tech_id, room))
        random.shuffle(periods)
        periods.sort(key=lambda p: (p[1] in [10, 6, 9, 8, 11]), reverse=True)

        available_slots = list(range(1, 41))
        random.shuffle(available_slots)

        def place(idx):
            if idx == len(periods):
                return True
            sub_id, tech_id, room = periods[idx]
            for s in available_slots:
                if s in slots_entries[cid]:
                    continue
                if tech_id in teacher_busy[s]:
                    continue
                if room != 'SPORTS-GRD' and room in room_busy[s]:
                    continue
                slots_entries[cid][s] = (sub_id, tech_id, room)
                teacher_busy[s].add(tech_id)
                if room != 'SPORTS-GRD':
                    room_busy[s].add(room)
                if place(idx + 1):
                    return True
                del slots_entries[cid][s]
                teacher_busy[s].remove(tech_id)
                if room != 'SPORTS-GRD':
                    room_busy[s].remove(room)
            return False

        assert place(0), f"Failed to place timetable for class {cid}"

    TIMETABLE_ENTRIES = []
    entry_id = 1
    for cid in range(1, 7):
        for s in sorted(slots_entries[cid].keys()):
            sub_id, tech_id, room = slots_entries[cid][s]
            TIMETABLE_ENTRIES.append((entry_id, cid, s, sub_id, tech_id, room))
            entry_id += 1

    # Conflict check verification
    c_s_set = set()
    t_s_set = set()
    r_s_set = set()
    for eid, tid, sid, sub_id, tech_id, room in TIMETABLE_ENTRIES:
        assert (tid, sid) not in c_s_set, f"Class collision in tt {tid}, slot {sid}"
        c_s_set.add((tid, sid))
        assert (tech_id, sid) not in t_s_set, f"Teacher collision for teacher {tech_id}, slot {sid}"
        t_s_set.add((tech_id, sid))
        if room != 'SPORTS-GRD':
            assert (room, sid) not in r_s_set, f"Room collision for room {room}, slot {sid}"
            r_s_set.add((room, sid))

    print(f"Verified {len(TIMETABLE_ENTRIES)} timetable entries without conflicts across all 6 classes (40 periods each)!")

    # -------------------------------------------------------------
    # 11. ATTENDANCE RECORDS & ENTRIES (Including TODAY 2026-10-06)
    # -------------------------------------------------------------
    ATTENDANCE_RECORDS = []
    ATTENDANCE_ENTRIES = []
    att_rec_id = 1
    att_entry_id = 1

    # 26 school dates (Sept & Oct 2026), ending with today 2026-10-06
    DATES = [
        ('2026-09-01', True), ('2026-09-02', True), ('2026-09-03', True), ('2026-09-04', True),
        ('2026-09-07', True), ('2026-09-08', True), ('2026-09-09', True), ('2026-09-10', True), ('2026-09-11', True),
        ('2026-09-14', True), ('2026-09-15', True), ('2026-09-16', True), ('2026-09-17', True), ('2026-09-18', True),
        ('2026-09-21', True), ('2026-09-22', True), ('2026-09-23', True), ('2026-09-24', True), ('2026-09-25', True),
        ('2026-09-28', True), ('2026-09-29', True), ('2026-09-30', True), ('2026-10-01', True), ('2026-10-02', True),
        ('2026-10-05', True), # Monday: locked
        ('2026-10-06', False),# Tuesday (TODAY): unlocked!
    ]

    class_students = {}
    for s in STUDENTS:
        class_students.setdefault(s[9], []).append(s[0])

    class_teachers = {1: 1, 2: 2, 3: 3, 4: 5, 5: 4, 6: 10}

    for dt, locked in DATES:
        for cid in [1, 2, 3, 4, 5, 6]:
            tid = class_teachers[cid]
            ATTENDANCE_RECORDS.append((att_rec_id, cid, tid, dt, 2026, 1 if locked else 0))
            
            s_list = class_students.get(cid, [])
            for s_idx, st_id in enumerate(s_list):
                # Deterministic realistic attendance patterns
                if st_id in [1, 6, 23]: # High achievers: Kasun, Rashmi, Nethmi
                    status = 'PRESENT'
                    remarks = 'On time'
                elif (st_id + att_rec_id) % 19 == 0:
                    status = 'ABSENT'
                    remarks = 'Medical leave'
                elif (st_id + att_rec_id) % 11 == 0:
                    status = 'LATE'
                    remarks = 'School bus delayed 15 mins'
                elif (st_id + att_rec_id) % 23 == 0:
                    status = 'EXCUSED'
                    remarks = 'Sports meet practice'
                else:
                    status = 'PRESENT'
                    remarks = 'On time'
                
                ATTENDANCE_ENTRIES.append((att_entry_id, att_rec_id, st_id, status, remarks))
                att_entry_id += 1
            
            att_rec_id += 1

    print(f"Generated {len(ATTENDANCE_RECORDS)} attendance records and {len(ATTENDANCE_ENTRIES)} attendance entries!")

    # -------------------------------------------------------------
    # 12. EXAMINATIONS, PAPERS & RESULTS (Covering Grades 9, 10, 11)
    # -------------------------------------------------------------
    EXAMINATIONS = [
        (1, 'Term 1 Mid-Year Examination 2026', 1, 2026, 'PUBLISHED'),
        (2, 'Term 2 Progress Assessment 2026', 2, 2026, 'PUBLISHED'),
        (3, 'Term 3 Final Examination 2026', 3, 2026, 'DRAFT'),
    ]

    # Papers:
    # (id, exam_id, subject_id, grade_level, max_marks)
    EXAM_PAPERS = [
        # Exam 1 (Term 1) - Grade 10 (13 subjects)
        (1, 1, 1, 10, 100.0),    # MATH10
        (2, 1, 2, 10, 100.0),    # SCI10
        (3, 1, 3, 10, 100.0),    # ENG10
        (4, 1, 4, 10, 100.0),    # SIN10
        (5, 1, 5, 10, 100.0),    # HIST10
        (6, 1, 6, 10, 100.0),    # ICT10
        (7, 1, 110, 10, 100.0),  # COM10
        (8, 1, 111, 10, 100.0),  # BUD10
        (9, 1, 112, 10, 100.0),  # LIT10
        (10, 1, 113, 10, 100.0), # GEO10
        (11, 1, 114, 10, 100.0), # HPE10
        (12, 1, 115, 10, 100.0), # CHEM10
        (13, 1, 116, 10, 100.0), # PHYS10

        # Exam 1 (Term 1) - Grade 11 (13 subjects)
        (14, 1, 7, 11, 100.0),   # MATH11
        (15, 1, 8, 11, 100.0),   # SCI11
        (16, 1, 117, 11, 100.0), # ENG11
        (17, 1, 118, 11, 100.0), # SIN11
        (18, 1, 119, 11, 100.0), # HIST11
        (19, 1, 120, 11, 100.0), # ICT11
        (20, 1, 121, 11, 100.0), # COM11
        (21, 1, 122, 11, 100.0), # BUD11
        (22, 1, 123, 11, 100.0), # LIT11
        (23, 1, 124, 11, 100.0), # GEO11
        (24, 1, 125, 11, 100.0), # HPE11
        (25, 1, 126, 11, 100.0), # CHEM11
        (26, 1, 127, 11, 100.0), # PHYS11

        # Exam 1 (Term 1) - Grade 9 (10 subjects)
        (27, 1, 101, 9, 100.0),  # MATH09
        (28, 1, 102, 9, 100.0),  # SCI09
        (29, 1, 103, 9, 100.0),  # ENG09
        (30, 1, 104, 9, 100.0),  # SIN09
        (31, 1, 105, 9, 100.0),  # HIST09
        (32, 1, 106, 9, 100.0),  # ICT09
        (33, 1, 107, 9, 100.0),  # GEO09
        (34, 1, 108, 9, 100.0),  # BUD09
        (35, 1, 109, 9, 100.0),  # HPE09
        (36, 1, 128, 9, 100.0),  # LIT09

        # Exam 2 (Term 2) - Grade 10 (6 core subjects)
        (37, 2, 1, 10, 100.0),   # MATH10
        (38, 2, 2, 10, 100.0),   # SCI10
        (39, 2, 3, 10, 100.0),   # ENG10
        (40, 2, 4, 10, 100.0),   # SIN10
        (41, 2, 5, 10, 100.0),   # HIST10
        (42, 2, 6, 10, 100.0),   # ICT10

        # Exam 2 (Term 2) - Grade 11 (6 core subjects)
        (43, 2, 7, 11, 100.0),   # MATH11
        (44, 2, 8, 11, 100.0),   # SCI11
        (45, 2, 117, 11, 100.0), # ENG11
        (46, 2, 118, 11, 100.0), # SIN11
        (47, 2, 119, 11, 100.0), # HIST11
        (48, 2, 120, 11, 100.0), # ICT11

        # Exam 2 (Term 2) - Grade 9 (6 core subjects)
        (49, 2, 101, 9, 100.0),  # MATH09
        (50, 2, 102, 9, 100.0),  # SCI09
        (51, 2, 103, 9, 100.0),  # ENG09
        (52, 2, 104, 9, 100.0),  # SIN09
        (53, 2, 105, 9, 100.0),  # HIST09
        (54, 2, 106, 9, 100.0),  # ICT09
    ]

    def calc_grade(m):
        if m >= 90.0: return 'A+'
        if m >= 75.0: return 'A'
        if m >= 65.0: return 'B'
        if m >= 50.0: return 'C'
        if m >= 35.0: return 'S'
        return 'F'

    # Map students to their grade
    student_grade = {s[0]: (10 if s[9] in [1, 2] else (11 if s[9] in [3, 4] else 9)) for s in STUDENTS}

    # Student aptitude offsets
    offsets = {
        1: 18, 2: 15, 3: 5, 4: -2, 5: 12, 6: 14, 7: 16, 8: 4,
        9: 10, 10: 8, 11: 6, 12: 11, 13: 2, 14: 7, 15: -5, 16: 9,
        17: 13, 18: 15, 19: 5, 20: 8, 21: 3, 22: 12,
        23: 16, 24: 10, 25: 6, 26: 12, 27: 4, 28: 9, 29: 7, 30: 2
    }

    paper_base = {
        # Exam 1
        1: 76, 2: 72, 3: 80, 4: 75, 5: 70, 6: 82, 7: 74, 8: 85, 9: 77, 10: 73, 11: 88, 12: 68, 13: 71,
        14: 74, 15: 71, 16: 78, 17: 76, 18: 72, 19: 84, 20: 75, 21: 86, 22: 78, 23: 74, 24: 87, 25: 69, 26: 72,
        27: 75, 28: 73, 29: 81, 30: 78, 31: 72, 32: 83, 33: 75, 34: 87, 35: 89, 36: 79,
        # Exam 2
        37: 78, 38: 75, 39: 82, 40: 77, 41: 74, 42: 85,
        43: 76, 44: 73, 45: 80, 46: 78, 47: 75, 48: 86,
        49: 77, 50: 74, 51: 83, 52: 80, 53: 76, 54: 87
    }

    EXAM_RESULTS = []
    res_id = 1
    for p in EXAM_PAPERS:
        p_id = p[0]
        p_grade = p[3]
        base = paper_base.get(p_id, 75)

        for s_id, s_grd in student_grade.items():
            if s_grd == p_grade:
                off = offsets.get(s_id, 0)
                var = ((s_id * 7 + p_id * 13) % 15) - 7
                marks = min(98.0, max(38.0, float(base + off + var)))
                
                # Dedicated top marks for Kasun (1) and Nethmi (23)
                if s_id == 1:
                    if p_id == 1: marks = 95.0
                    elif p_id == 2: marks = 90.0
                    elif p_id == 3: marks = 86.0
                    elif p_id == 6: marks = 96.0
                    elif p_id == 37: marks = 98.0
                elif s_id == 23: # Nethmi (Grade 9-A)
                    if p_id == 27: marks = 94.0
                    elif p_id == 28: marks = 91.0
                    elif p_id == 29: marks = 89.0
                    elif p_id == 32: marks = 96.0

                grade = calc_grade(marks)
                EXAM_RESULTS.append((res_id, p_id, s_id, marks, grade, 1))
                res_id += 1

    print(f"Generated {len(EXAM_PAPERS)} exam papers and {len(EXAM_RESULTS)} exam results across all grades (9, 10, 11)!")

    # -------------------------------------------------------------
    # 13. FEE STRUCTURES, STUDENT FEE ACCOUNTS, PAYMENT SLIPS & RECEIPTS
    # -------------------------------------------------------------
    FEE_STRUCTURES = [
        (1, 'Grade 10 Term 1 Tuition Fee', 'TUITION', 10, 2026, 1, 25000.00, '2026-10-31', 'First term secondary tuition fees', 1),
        (2, 'Grade 10 Annual Facility & Sports Fee', 'FACILITY', 10, 2026, 1, 8000.00, '2026-09-30', 'Sports complex and science lab maintenance', 1),
        (3, 'Grade 11 Term 1 Tuition Fee', 'TUITION', 11, 2026, 1, 28000.00, '2026-10-31', 'First term O/L tuition fees', 1),
        (4, 'Annual Digital Lab & Library Fee', 'LIBRARY', None, 2026, 1, 5000.00, '2026-11-15', 'School-wide digital library and IT resource access', 1),
        (5, 'Grade 11 Annual Facility Fee', 'FACILITY', 11, 2026, 1, 10000.00, '2026-09-30', 'Sports and science lab maintenance for O/L students', 1),
        (6, 'Term 1 Examination Fee', 'EXAMINATION', None, 2026, 1, 3500.00, '2026-10-15', 'All students sit the Term 1 comprehensive exam', 1),
        (7, 'School Transport Service - Term 1', 'TRANSPORT', None, 2026, 1, 6000.00, '2026-10-01', 'Daily air-conditioned school bus service', 1),
        (8, 'Grade 10 Admission & Registration Fee', 'ADMISSION', 10, 2026, 1, 15000.00, '2026-02-28', 'One-time admission charge for new Grade 10 enrolments', 1),
        (9, 'Grade 9 Term 1 Tuition Fee', 'TUITION', 9, 2026, 1, 22000.00, '2026-10-31', 'First term middle school tuition fees', 1),
        (10, 'Grade 9 Annual Facility Fee', 'FACILITY', 9, 2026, 1, 7500.00, '2026-09-30', 'Annual facility maintenance charge', 1),
    ]

    # Student fee accounts
    FEE_ACCOUNTS = [
        # Student 1: Kasun Perera (Grade 10)
        (1, 1, 'WIS-2026-00101', 'Kasun Perera', 10, 1, 25000.00, 25000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Counter cash payment in full'),
        (2, 1, 'WIS-2026-00101', 'Kasun Perera', 10, 2, 8000.00, 5000.00, 3000.00, 'PARTIAL', '2026-09-30', 2026, 'Bank transfer partial payment'),
        (3, 1, 'WIS-2026-00101', 'Kasun Perera', 10, 6, 3500.00, 3500.00, 0.00, 'PAID', '2026-10-15', 2026, 'Exam fee paid via bank deposit slip'),
        (4, 1, 'WIS-2026-00101', 'Kasun Perera', 10, 7, 6000.00, 0.00, 6000.00, 'OVERDUE', '2026-10-01', 2026, 'Transport fee term 1'),

        # Student 2: Nimasha Silva (Grade 10)
        (5, 2, 'WIS-2026-00102', 'Nimasha Silva', 10, 1, 25000.00, 15000.00, 10000.00, 'PARTIAL', '2026-10-31', 2026, 'First instalment paid'),
        (6, 2, 'WIS-2026-00102', 'Nimasha Silva', 10, 2, 8000.00, 0.00, 8000.00, 'OVERDUE', '2026-09-30', 2026, 'Annual facility charge'),
        (7, 2, 'WIS-2026-00102', 'Nimasha Silva', 10, 6, 3500.00, 3500.00, 0.00, 'PAID', '2026-10-15', 2026, 'Counter cash payment'),

        # Student 3: Kavindu Bandara (Grade 10)
        (8, 3, 'WIS-2026-00103', 'Kavindu Bandara', 10, 1, 25000.00, 25000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Paid with sibling discount verification'),
        (9, 3, 'WIS-2026-00103', 'Kavindu Bandara', 10, 4, 5000.00, 5000.00, 0.00, 'PAID', '2026-11-15', 2026, 'Online bank transfer'),

        # Student 4: Dilshan Fernando (Grade 10)
        (10, 4, 'WIS-2026-00104', 'Dilshan Fernando', 10, 1, 25000.00, 10000.00, 15000.00, 'PARTIAL', '2026-10-31', 2026, 'Instalment 1 paid'),
        (11, 4, 'WIS-2026-00104', 'Dilshan Fernando', 10, 7, 6000.00, 0.00, 6000.00, 'OVERDUE', '2026-10-01', 2026, 'School bus fee'),

        # Student 5: Tharushi Jayawardena (Grade 10)
        (12, 5, 'WIS-2026-00105', 'Tharushi Jayawardena', 10, 1, 25000.00, 0.00, 25000.00, 'PENDING', '2026-10-31', 2026, 'Awaiting slip review'),
        (13, 5, 'WIS-2026-00105', 'Tharushi Jayawardena', 10, 2, 8000.00, 0.00, 8000.00, 'OVERDUE', '2026-09-30', 2026, 'Regular facility charge'),

        # Student 6: Rashmi Dissanayake (Grade 11)
        (14, 6, 'WIS-2024-00201', 'Rashmi Dissanayake', 11, 3, 28000.00, 14000.00, 14000.00, 'PARTIAL', '2026-10-31', 2026, 'First half tuition paid'),
        (15, 6, 'WIS-2024-00201', 'Rashmi Dissanayake', 11, 5, 10000.00, 0.00, 10000.00, 'OVERDUE', '2026-09-30', 2026, 'Annual facility charge'),

        # Student 7: Malith Weerasekara (Grade 11)
        (16, 7, 'WIS-2024-00202', 'Malith Weerasekara', 11, 3, 28000.00, 28000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Full annual tuition cleared'),
        (17, 7, 'WIS-2024-00202', 'Malith Weerasekara', 11, 5, 10000.00, 10000.00, 0.00, 'PAID', '2026-09-30', 2026, 'Facility fee cleared'),

        # Student 8: Chathura Gimhana (Grade 11)
        (18, 8, 'WIS-2024-00203', 'Chathura Gimhana', 11, 3, 28000.00, 0.00, 28000.00, 'PENDING', '2026-10-31', 2026, 'Pending bursar notification'),

        # Student 9: Dinuka Wickramasinghe (Grade 10)
        (19, 9, 'WIS-2026-00106', 'Dinuka Wickramasinghe', 10, 1, 25000.00, 25000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Full cash payment'),

        # Student 17: Ravindu Wickramasinghe (Grade 11)
        (20, 17, 'WIS-2024-00204', 'Ravindu Wickramasinghe', 11, 3, 28000.00, 28000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Full payment via bank transfer'),

        # Student 23: Nethmi Silva (Grade 9)
        (21, 23, 'WIS-2025-00301', 'Nethmi Silva', 9, 9, 22000.00, 22000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Paid in full at counter'),
        (22, 23, 'WIS-2025-00301', 'Nethmi Silva', 9, 10, 7500.00, 0.00, 7500.00, 'OVERDUE', '2026-09-30', 2026, 'Annual facility charge'),

        # Student 24: Kaveen Perera (Grade 9)
        (23, 24, 'WIS-2025-00302', 'Kaveen Perera', 9, 9, 22000.00, 11000.00, 11000.00, 'PARTIAL', '2026-10-31', 2026, 'Half payment made'),
        (24, 24, 'WIS-2025-00302', 'Kaveen Perera', 9, 10, 7500.00, 0.00, 7500.00, 'OVERDUE', '2026-09-30', 2026, 'Annual facility charge'),

        # Student 27: Charith Wickramasinghe (Grade 9)
        (25, 27, 'WIS-2025-00305', 'Charith Wickramasinghe', 9, 9, 22000.00, 22000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Full tuition paid'),
        (26, 27, 'WIS-2025-00305', 'Charith Wickramasinghe', 9, 10, 7500.00, 7500.00, 0.00, 'PAID', '2026-09-30', 2026, 'Facility fee paid in full'),
    ]

    # Payment Slips
    PAYMENT_SLIPS = [
        # 1. Kasun Perera - Tuition (CASH, APPROVED)
        (1, 1, 1, 1, 'Mr. Bandula Perera (Father)', 'CASH', 'REC-WIS-20261001-01', None, 25000.00, '2026-10-01 09:30:00', 'APPROVED', 'Admin Counter', 'Cash received in full at office counter', '2026-10-01 09:30:00'),
        # 2. Kasun Perera - Facility (BANK_TRANSFER, APPROVED)
        (2, 2, 1, 1, 'Mr. Bandula Perera (Father)', 'BANK_TRANSFER', 'BOC-TRF-982341', None, 5000.00, '2026-10-02 11:15:00', 'APPROVED', 'Admin Finance', 'Partial transfer verified via BOC online statement', '2026-10-02 11:20:00'),
        # 3. Kasun Perera - Exam Fee (BANK_DEPOSIT, APPROVED)
        (3, 3, 1, 1, 'Mrs. Sunethra Perera (Mother)', 'BANK_DEPOSIT', 'BOC-DEP-774129', 'slip_kasun_exam_2026.jpg', 3500.00, '2026-10-03 14:00:00', 'APPROVED', 'Admin Counter', 'Bank deposit slip verified', '2026-10-03 14:30:00'),
        # 4. Nimasha Silva - Tuition (BANK_DEPOSIT, APPROVED)
        (4, 5, 2, 2, 'Mrs. Menaka Silva (Mother)', 'BANK_DEPOSIT', 'HNB-DEP-558291', 'slip_nimasha_tuition.jpg', 15000.00, '2026-10-02 10:45:00', 'APPROVED', 'Admin Finance', 'First instalment confirmed from HNB Gampaha', '2026-10-02 11:00:00'),
        # 5. Nimasha Silva - Exam Fee (CASH, APPROVED)
        (5, 7, 2, 2, 'Mr. Sarath Silva (Father)', 'CASH', 'REC-WIS-20261003-02', None, 3500.00, '2026-10-03 12:10:00', 'APPROVED', 'Admin Counter', 'Counter cash received', '2026-10-03 12:10:00'),
        # 6. Dilshan Fernando - Tuition (BANK_TRANSFER, APPROVED)
        (6, 10, 4, 5, 'Mr. Mohan Fernando (Father)', 'BANK_TRANSFER', 'COMBANK-DILSH-8812', None, 10000.00, '2026-10-03 15:20:00', 'APPROVED', 'Admin Finance', 'Direct Commercial Bank transfer approved', '2026-10-03 15:30:00'),
        # 7. Rashmi Dissanayake - Tuition (BANK_DEPOSIT, APPROVED)
        (7, 14, 6, 3, 'Mr. Gamini Dissanayake (Father)', 'BANK_DEPOSIT', 'HNB-RASH-449102', 'slip_rashmi_tuition.jpg', 14000.00, '2026-10-04 09:15:00', 'APPROVED', 'Admin Finance', 'First half bank deposit confirmed', '2026-10-04 09:30:00'),
        # 8. Malith Weerasekara - Tuition (BANK_TRANSFER, APPROVED)
        (8, 16, 7, 7, 'Mr. Douglas Weerasekara (Father)', 'BANK_TRANSFER', 'SAMPATH-MALT-90182', 'slip_malith_full.jpg', 28000.00, '2026-10-04 11:40:00', 'APPROVED', 'Admin Finance', 'Full tuition bank transfer cleared', '2026-10-04 11:50:00'),
        # 9. Malith Weerasekara - Facility (CASH, APPROVED)
        (9, 17, 7, 7, 'Mr. Douglas Weerasekara (Father)', 'CASH', 'REC-WIS-20261004-03', None, 10000.00, '2026-10-04 13:00:00', 'APPROVED', 'Admin Counter', 'Facility fee paid in full', '2026-10-04 13:00:00'),
        # 10. Dinuka Wickramasinghe - Tuition (CASH, APPROVED)
        (10, 19, 9, 6, 'Mr. Asoka Wickramasinghe (Father)', 'CASH', 'REC-WIS-20261005-01', None, 25000.00, '2026-10-05 08:45:00', 'APPROVED', 'Admin Counter', 'Cash payment in full', '2026-10-05 08:45:00'),
        # 11. Nethmi Silva - Tuition (CASH, APPROVED)
        (11, 21, 23, 2, 'Mrs. Menaka Silva (Mother)', 'CASH', 'REC-WIS-20261005-02', None, 22000.00, '2026-10-05 09:15:00', 'APPROVED', 'Admin Counter', 'Full tuition payment', '2026-10-05 09:15:00'),
        # 12. Tharushi Jayawardena - Tuition (BANK_DEPOSIT, PENDING) -> For demo verification!
        (12, 12, 5, 4, 'Mr. Rohan Jayawardena (Father)', 'BANK_DEPOSIT', 'BOC-THAR-339182', 'slip_tharushi_deposit.jpg', 25000.00, '2026-10-05 10:30:00', 'PENDING', None, None, None),
        # 13. Kaveen Perera - Tuition (CHEQUE, REJECTED) -> Demonstrates rejection workflow!
        (13, 23, 24, 1, 'Mr. Bandula Perera (Father)', 'CHEQUE', 'CHQ-BOC-550192', 'slip_chq_kaveen.jpg', 11000.00, '2026-10-04 16:00:00', 'REJECTED', 'Admin Finance', 'Drawer signature mismatch on cheque. Please resubmit counter payment.', '2026-10-05 09:00:00'),
        # 14. Charith Wickramasinghe - Tuition (BANK_TRANSFER, APPROVED)
        (14, 25, 27, 6, 'Mr. Asoka Wickramasinghe (Father)', 'BANK_TRANSFER', 'BOC-TRF-667102', None, 22000.00, '2026-10-05 11:20:00', 'APPROVED', 'Admin Finance', 'Online payment verified', '2026-10-05 11:30:00'),
        # 15. Charith Wickramasinghe - Facility (CASH, APPROVED)
        (15, 26, 27, 6, 'Mr. Asoka Wickramasinghe (Father)', 'CASH', 'REC-WIS-20261005-03', None, 7500.00, '2026-10-05 11:45:00', 'APPROVED', 'Admin Counter', 'Cash facility fee received', '2026-10-05 11:45:00'),
    ]

    # Payment Receipts
    PAYMENT_RECEIPTS = [
        (1, 1, 'RCPT-2026-00001', 1, 'WIS-2026-00101', 'Kasun Perera', 'Grade 10 Term 1 Tuition Fee', 'TUITION', 'FULL', 25000.00, 0.00, '2026-10-01 09:30:00', 'Admin Counter', 'Official receipt for Term 1 tuition fee'),
        (2, 2, 'RCPT-2026-00002', 1, 'WIS-2026-00101', 'Kasun Perera', 'Grade 10 Annual Facility & Sports Fee', 'FACILITY', 'PARTIAL', 5000.00, 3000.00, '2026-10-02 11:20:00', 'Admin Finance', 'Partial receipt for facility fee instalment'),
        (3, 3, 'RCPT-2026-00003', 1, 'WIS-2026-00101', 'Kasun Perera', 'Term 1 Examination Fee', 'EXAMINATION', 'FULL', 3500.00, 0.00, '2026-10-03 14:30:00', 'Admin Counter', 'Official receipt for Term 1 exam paper access'),
        (4, 4, 'RCPT-2026-00004', 2, 'WIS-2026-00102', 'Nimasha Silva', 'Grade 10 Term 1 Tuition Fee', 'TUITION', 'PARTIAL', 15000.00, 10000.00, '2026-10-02 11:00:00', 'Admin Finance', 'Official receipt for first tuition instalment'),
        (5, 5, 'RCPT-2026-00005', 2, 'WIS-2026-00102', 'Nimasha Silva', 'Term 1 Examination Fee', 'EXAMINATION', 'FULL', 3500.00, 0.00, '2026-10-03 12:10:00', 'Admin Counter', 'Official receipt for Term 1 exam fee'),
        (6, 6, 'RCPT-2026-00006', 4, 'WIS-2026-00104', 'Dilshan Fernando', 'Grade 10 Term 1 Tuition Fee', 'TUITION', 'PARTIAL', 10000.00, 15000.00, '2026-10-03 15:30:00', 'Admin Finance', 'First instalment receipt'),
        (7, 7, 'RCPT-2026-00007', 6, 'WIS-2024-00201', 'Rashmi Dissanayake', 'Grade 11 Term 1 Tuition Fee', 'TUITION', 'PARTIAL', 14000.00, 14000.00, '2026-10-04 09:30:00', 'Admin Finance', 'Official receipt for O/L tuition first half'),
        (8, 8, 'RCPT-2026-00008', 7, 'WIS-2024-00202', 'Malith Weerasekara', 'Grade 11 Term 1 Tuition Fee', 'TUITION', 'FULL', 28000.00, 0.00, '2026-10-04 11:50:00', 'Admin Finance', 'Official receipt for full O/L tuition fee'),
        (9, 9, 'RCPT-2026-00009', 7, 'WIS-2024-00202', 'Malith Weerasekara', 'Grade 11 Annual Facility Fee', 'FACILITY', 'FULL', 10000.00, 0.00, '2026-10-04 13:00:00', 'Admin Counter', 'Official receipt for facility fee'),
        (10, 10, 'RCPT-2026-00010', 9, 'WIS-2026-00106', 'Dinuka Wickramasinghe', 'Grade 10 Term 1 Tuition Fee', 'TUITION', 'FULL', 25000.00, 0.00, '2026-10-05 08:45:00', 'Admin Counter', 'Official receipt for full tuition fee'),
        (11, 11, 'RCPT-2026-00011', 23, 'WIS-2025-00301', 'Nethmi Silva', 'Grade 9 Term 1 Tuition Fee', 'TUITION', 'FULL', 22000.00, 0.00, '2026-10-05 09:15:00', 'Admin Counter', 'Official receipt for middle school tuition'),
        (12, 14, 'RCPT-2026-00012', 27, 'WIS-2025-00305', 'Charith Wickramasinghe', 'Grade 9 Term 1 Tuition Fee', 'TUITION', 'FULL', 22000.00, 0.00, '2026-10-05 11:30:00', 'Admin Finance', 'Official receipt for tuition fee'),
        (13, 15, 'RCPT-2026-00013', 27, 'WIS-2025-00305', 'Charith Wickramasinghe', 'Grade 9 Annual Facility Fee', 'FACILITY', 'FULL', 7500.00, 0.00, '2026-10-05 11:45:00', 'Admin Counter', 'Official receipt for facility fee'),
    ]

    return {
        'users': USERS,
        'parents': PARENTS,
        'teachers': TEACHERS,
        'staff': STAFF,
        'classes': CLASSES,
        'subjects': SUBJECTS,
        'tsa': TSA,
        'students': STUDENTS,
        'allocations': ALLOCATIONS,
        'time_slots': TIME_SLOTS,
        'timetables': TIMETABLES,
        'timetable_entries': TIMETABLE_ENTRIES,
        'attendance_records': ATTENDANCE_RECORDS,
        'attendance_entries': ATTENDANCE_ENTRIES,
        'examinations': EXAMINATIONS,
        'exam_papers': EXAM_PAPERS,
        'exam_results': EXAM_RESULTS,
        'fee_structures': FEE_STRUCTURES,
        'fee_accounts': FEE_ACCOUNTS,
        'payment_slips': PAYMENT_SLIPS,
        'payment_receipts': PAYMENT_RECEIPTS,
    }

def sql_val(v):
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return '1' if v else '0'
    if isinstance(v, (int, float)):
        return str(v)
    escaped = str(v).replace('\\', '\\\\').replace("'", "''")
    return f"'{escaped}'"

def format_insert(table_name, columns, rows):
    if not rows:
        return ""
    col_str = ", ".join(f"`{c}`" for c in columns)
    lines = [f"INSERT INTO `{table_name}` ({col_str}) VALUES"]
    val_lines = []
    for r in rows:
        val_str = ", ".join(sql_val(v) for v in r)
        val_lines.append(f"({val_str})")
    lines.append(",\n".join(val_lines) + ";\n")
    return "\n".join(lines)

def build_seed_sql(data):
    out = []
    out.append("-- =====================================================================")
    out.append("-- Wycherley International School, Gampaha (SIMS)")
    out.append("-- Comprehensive Authentic Sri Lankan School Seed Data")
    out.append("-- =====================================================================")
    out.append("\nUSE sim_system_db;\n")
    out.append("SET FOREIGN_KEY_CHECKS = 0;\n")

    tables_in_delete_order = [
        'payment_receipts', 'payment_slips', 'student_fee_accounts', 'fee_structures',
        'timetable_entries', 'timetables', 'time_slots',
        'exam_results', 'exam_papers', 'examinations',
        'attendance_entries', 'attendance_records',
        'teacher_subject_assignments', 'student_class_allocations',
        'academic_classes', 'subjects', 'students', 'staff', 'teachers', 'parents', 'users'
    ]
    for t in tables_in_delete_order:
        out.append(f"DELETE FROM `{t}`;")

    out.append("\nSET FOREIGN_KEY_CHECKS = 1;\n")

    # 1. Users
    user_rows = [(u[0], u[1], u[2], u[3], u[4], u[5], '2026-09-01 08:00:00', '2026-09-01 08:00:00') for u in data['users']]
    out.append("-- 1. Users")
    out.append(format_insert('users', ['id', 'username', 'email', 'password_hash', 'role', 'active', 'created_at', 'updated_at'], user_rows))

    # 2. Parents
    parent_rows = [(p[0], p[1], p[2], p[3], p[4], p[5], p[6], '2026-09-01 08:00:00') for p in data['parents']]
    out.append("-- 2. Parents")
    out.append(format_insert('parents', ['id', 'user_id', 'father_name', 'mother_name', 'phone', 'nic', 'address', 'created_at'], parent_rows))

    # 3. Teachers
    teacher_rows = [(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], '2026-09-01 08:00:00') for t in data['teachers']]
    out.append("-- 3. Teachers")
    out.append(format_insert('teachers', ['id', 'user_id', 'employee_number', 'first_name', 'last_name', 'qualification', 'phone', 'status', 'hire_date', 'created_at'], teacher_rows))

    # 4. Staff
    staff_rows = [(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], s[9], s[10], s[11], s[12], s[13], '2026-09-01 08:00:00') for s in data['staff']]
    out.append("-- 4. Staff & Supervisors")
    out.append(format_insert('staff', ['id', 'employee_number', 'first_name', 'last_name', 'job_position', 'department', 'qualification', 'phone', 'email', 'employment_type', 'salary', 'address', 'hire_date', 'status', 'created_at'], staff_rows))

    # 5. Subjects
    subject_rows = [(s[0], s[1], s[2], s[3], '2026-09-01 08:00:00') for s in data['subjects']]
    out.append("-- 5. Subjects")
    out.append(format_insert('subjects', ['id', 'subject_code', 'subject_name', 'grade_level', 'created_at'], subject_rows))

    # 6. Academic Classes
    class_rows = [(c[0], c[1], c[2], c[3], c[4], c[5], '2026-09-01 08:00:00') for c in data['classes']]
    out.append("-- 6. Academic Classes")
    out.append(format_insert('academic_classes', ['id', 'grade_level', 'class_name', 'academic_year', 'capacity', 'class_teacher_id', 'created_at'], class_rows))

    # 7. Students
    student_rows = [(st[0], st[1], st[2], st[3], st[4], st[5], st[6], st[7], st[8], '2026-09-01 08:00:00') for st in data['students']]
    out.append("-- 7. Students")
    out.append(format_insert('students', ['id', 'user_id', 'admission_number', 'first_name', 'last_name', 'dob', 'gender', 'parent_id', 'active', 'created_at'], student_rows))

    # 8. Student Class Allocations
    alloc_rows = [(a[0], a[1], a[2], a[3], a[4], a[5]) for a in data['allocations']]
    out.append("-- 8. Class Allocations")
    out.append(format_insert('student_class_allocations', ['id', 'student_id', 'class_id', 'academic_year', 'allocated_date', 'status'], alloc_rows))

    # 9. Teacher Subject Assignments
    tsa_rows = [(t[0], t[1], t[2], t[3], t[4]) for t in data['tsa']]
    out.append("-- 9. Teacher Subject Assignments")
    out.append(format_insert('teacher_subject_assignments', ['id', 'teacher_id', 'subject_id', 'class_id', 'academic_year'], tsa_rows))

    # 10. Time Slots
    slot_rows = [(s[0], s[1], s[2], s[3], s[4]) for s in data['time_slots']]
    out.append("-- 10. Time Slots")
    out.append(format_insert('time_slots', ['id', 'day_of_week', 'period_number', 'start_time', 'end_time'], slot_rows))

    # 11. Timetables
    tt_rows = [(t[0], t[1], t[2], t[3], t[4], '2026-09-01 08:00:00', '2026-09-01 08:00:00') for t in data['timetables']]
    out.append("-- 11. Timetables")
    out.append(format_insert('timetables', ['id', 'class_id', 'academic_year', 'term', 'status', 'created_at', 'updated_at'], tt_rows))

    # 12. Timetable Entries
    tte_rows = [(e[0], e[1], e[2], e[3], e[4], e[5]) for e in data['timetable_entries']]
    out.append("-- 12. Timetable Entries")
    out.append(format_insert('timetable_entries', ['id', 'timetable_id', 'time_slot_id', 'subject_id', 'teacher_id', 'room_number'], tte_rows))

    # 13. Attendance Records
    ar_rows = [(r[0], r[1], r[2], r[3], r[4], r[5], f"{r[3]} 08:15:00") for r in data['attendance_records']]
    out.append("-- 13. Attendance Records")
    out.append(format_insert('attendance_records', ['id', 'class_id', 'teacher_id', 'attendance_date', 'academic_year', 'is_locked', 'submitted_at'], ar_rows))

    # 14. Attendance Entries
    ae_rows = [(e[0], e[1], e[2], e[3], e[4]) for e in data['attendance_entries']]
    out.append("-- 14. Attendance Entries")
    out.append(format_insert('attendance_entries', ['id', 'attendance_record_id', 'student_id', 'status', 'remarks'], ae_rows))

    # 15. Examinations
    ex_rows = [(e[0], e[1], e[2], e[3], e[4], '2026-09-01 08:00:00') for e in data['examinations']]
    out.append("-- 15. Examinations")
    out.append(format_insert('examinations', ['id', 'exam_name', 'term', 'academic_year', 'status', 'created_at'], ex_rows))

    # 16. Exam Papers
    ep_rows = [(p[0], p[1], p[2], p[3], p[4]) for p in data['exam_papers']]
    out.append("-- 16. Exam Papers")
    out.append(format_insert('exam_papers', ['id', 'exam_id', 'subject_id', 'grade_level', 'max_marks'], ep_rows))

    # 17. Exam Results
    er_rows = [(r[0], r[1], r[2], r[3], r[4], r[5], '2026-09-01 08:00:00') for r in data['exam_results']]
    out.append("-- 17. Exam Results")
    out.append(format_insert('exam_results', ['id', 'exam_paper_id', 'student_id', 'marks_obtained', 'grade', 'is_published', 'created_at'], er_rows))

    # 18. Fee Structures
    fs_rows = [(f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7], f[8], f[9], '2026-09-01 08:00:00') for f in data['fee_structures']]
    out.append("-- 18. Fee Structures")
    out.append(format_insert('fee_structures', ['id', 'name', 'fee_type', 'grade_level', 'academic_year', 'term', 'amount', 'due_date', 'description', 'is_active', 'created_at'], fs_rows))

    # 19. Student Fee Accounts
    fa_rows = [(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], '2026-09-01 08:00:00', '2026-09-01 08:00:00') for a in data['fee_accounts']]
    out.append("-- 19. Student Fee Accounts")
    out.append(format_insert('student_fee_accounts', ['id', 'student_id', 'student_admission_number', 'student_name', 'grade_level', 'fee_structure_id', 'total_amount', 'paid_amount', 'balance_amount', 'status', 'due_date', 'academic_year', 'remarks', 'created_at', 'updated_at'], fa_rows))

    # 20. Payment Slips
    ps_rows = [(s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], s[8], s[9], s[10], s[11], s[12], s[13], '2026-09-01 08:00:00', '2026-09-01 08:00:00') for s in data['payment_slips']]
    out.append("-- 20. Payment Slips")
    out.append(format_insert('payment_slips', ['id', 'fee_account_id', 'student_id', 'parent_id', 'paid_by', 'payment_method', 'transaction_reference', 'slip_image_url', 'amount_paid', 'payment_date', 'verification_status', 'reviewed_by', 'review_remarks', 'reviewed_at', 'created_at', 'updated_at'], ps_rows))

    # 21. Payment Receipts
    pr_rows = [(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], '2026-09-01 08:00:00') for r in data['payment_receipts']]
    out.append("-- 21. Payment Receipts")
    out.append(format_insert('payment_receipts', ['id', 'payment_slip_id', 'receipt_number', 'student_id', 'student_admission_number', 'student_name', 'fee_structure_name', 'fee_type', 'receipt_type', 'amount_paid', 'remaining_balance', 'issued_date', 'issued_by', 'notes', 'created_at'], pr_rows))

    return "\n".join(out)

def main():
    print("Generating comprehensive seed data...")
    data = generate()
    sql_text = build_seed_sql(data)
    OUTPUT_FILE.write_text(sql_text, encoding='utf-8')
    print(f"Generated {OUTPUT_FILE} ({len(sql_text)} chars / {len(sql_text.splitlines())} lines)")

if __name__ == '__main__':
    main()
