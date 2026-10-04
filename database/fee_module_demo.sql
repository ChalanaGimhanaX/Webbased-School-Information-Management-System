-- =====================================================================
-- SE2030 - Fee & Payment Management Module - VIVA DEMO SETUP
-- Assigned Module: UC-06 Fee & Payment Management (IT25103710)
-- Purpose: Rich seed data for live CRUD demonstration in MySQL Workbench
-- Run AFTER: schema.sql and seed_actual_data.sql
-- =====================================================================

USE sim_system_db;

-- =====================================================================
-- STEP 1 — Add extra users & parents for richer demo (safe on re-run)
-- =====================================================================

-- Parent 2 already exists (Sarath Silva), add parent 3 with account
INSERT IGNORE INTO users (id, username, email, password_hash, role, active, created_at, updated_at) VALUES
(6, 'parent2', 'parent2@wycherley.lk', '$2a$10$SP1VDSy6clK579ubqX5L2ejsfd4PQxXCnW9N54Gt8P5sMYPltXiXu', 'PARENT', 1, NOW(), NOW()),
(7, 'student5', 'student5@wycherley.lk', '$2a$10$I/miQ.ImrP5DCqOFDhULz.oksMR0t0II3iqZdIAMvSE/36B2YdMXq', 'STUDENT', 1, NOW(), NOW());

-- Update parent 2 to link to user 6
UPDATE parents SET user_id = 6 WHERE id = 2;

-- Link remaining students to parents for the demo
UPDATE students SET parent_id = 1 WHERE id = 4;   -- Dilshan -> Bandula Perera
UPDATE students SET parent_id = 2 WHERE id = 5;   -- Tharushi -> Sarath Silva
UPDATE students SET parent_id = 2 WHERE id = 6;   -- Rashmi -> Sarath Silva

-- =====================================================================
-- STEP 2 — Add more Fee Structures (CRUD: Create demo)
-- =====================================================================

INSERT IGNORE INTO fee_structures (id, name, fee_type, grade_level, academic_year, term, amount, due_date, description, is_active, created_at, updated_at) VALUES
(5, 'Grade 11 Annual Facility Fee', 'FACILITY', 11, 2026, 1, 10000.00, '2026-09-30', 'Sports and science lab maintenance for O/L students', 1, NOW(), NOW()),
(6, 'Term 1 Examination Fee',       'EXAMINATION', NULL, 2026, 1, 3500.00, '2026-10-15', 'All students sit the Term 1 mock exam', 1, NOW(), NOW()),
(7, 'School Transport - Term 1',    'TRANSPORT',   NULL, 2026, 1, 6000.00, '2026-10-01', 'Daily school bus service Term 1', 1, NOW(), NOW()),
(8, 'Grade 10 Admission Fee',       'ADMISSION',   10,   2026, 1, 15000.00, '2026-02-28', 'One-time admission fee for new Grade 10 enrolments', 1, NOW(), NOW());

-- =====================================================================
-- STEP 3 — Assign fees to more students (CRUD: Create + Read)
-- =====================================================================

-- Kasun Perera (student 1) — already has accounts 1 & 2; add exam + transport
INSERT IGNORE INTO student_fee_accounts
  (student_id, student_admission_number, student_name, grade_level, fee_structure_id, total_amount, paid_amount, balance_amount, status, due_date, academic_year, remarks, created_at, updated_at)
VALUES
(1, 'WYC-2026-00101', 'Kasun Perera',   10, 6, 3500.00,  3500.00, 0.00,    'PAID',    '2026-10-15', 2026, 'Paid with tuition', NOW(), NOW()),
(1, 'WYC-2026-00101', 'Kasun Perera',   10, 7, 6000.00,  0.00,    6000.00, 'PENDING', '2026-10-01', 2026, NULL,                NOW(), NOW()),
-- Nimasha Silva (student 2) — exam fee PAID, facility PENDING
(2, 'WYC-2026-00102', 'Nimasha Silva',  10, 6, 3500.00,  3500.00, 0.00,    'PAID',    '2026-10-15', 2026, 'Counter payment',   NOW(), NOW()),
(2, 'WYC-2026-00102', 'Nimasha Silva',  10, 2, 8000.00,  0.00,    8000.00, 'PENDING', '2026-09-30', 2026, 'Overdue reminder',  NOW(), NOW()),
-- Dilshan Fernando (student 4) — Grade 10 tuition PENDING
(4, 'WYC-2026-00104', 'Dilshan Fernando', 10, 1, 25000.00, 10000.00, 15000.00, 'PARTIAL', '2026-10-31', 2026, 'First instalment paid', NOW(), NOW()),
(4, 'WYC-2026-00104', 'Dilshan Fernando', 10, 7,  6000.00,     0.00,  6000.00, 'PENDING', '2026-10-01', 2026, NULL, NOW(), NOW()),
-- Tharushi (student 5) — facility + tuition
(5, 'WYC-2026-00105', 'Tharushi Jayawardena', 10, 1, 25000.00, 0.00, 25000.00, 'PENDING', '2026-10-31', 2026, NULL, NOW(), NOW()),
(5, 'WYC-2026-00105', 'Tharushi Jayawardena', 10, 2,  8000.00, 0.00,  8000.00, 'PENDING', '2026-09-30', 2026, NULL, NOW(), NOW()),
-- Rashmi Dissanayake (student 6) — Grade 11 fees
(6, 'WYC-2026-00201', 'Rashmi Dissanayake', 11, 3, 28000.00, 14000.00, 14000.00, 'PARTIAL', '2026-10-31', 2026, 'First half paid', NOW(), NOW()),
(6, 'WYC-2026-00201', 'Rashmi Dissanayake', 11, 5, 10000.00,     0.00, 10000.00, 'PENDING', '2026-09-30', 2026, NULL, NOW(), NOW()),
-- Malith Weerasekara (student 7) — fully paid tuition
(7, 'WYC-2026-00202', 'Malith Weerasekara', 11, 3, 28000.00, 28000.00, 0.00, 'PAID', '2026-10-31', 2026, 'Bank transfer', NOW(), NOW());

-- =====================================================================
-- STEP 4 — Payment Slips for the demo (bank slips pending admin review)
-- =====================================================================

-- Helper: get fee account IDs for Dilshan's partial payment
SET @dilshan_tuition_id = (SELECT id FROM student_fee_accounts WHERE student_id = 4 AND fee_structure_id = 1 LIMIT 1);
SET @nimasha_tuition_id = (SELECT id FROM student_fee_accounts WHERE student_id = 2 AND fee_structure_id = 1 LIMIT 1);
SET @rashmi_tuition_id  = (SELECT id FROM student_fee_accounts WHERE student_id = 6 AND fee_structure_id = 3 LIMIT 1);
SET @malith_tuition_id  = (SELECT id FROM student_fee_accounts WHERE student_id = 7 AND fee_structure_id = 3 LIMIT 1);
SET @kasun_exam_id      = (SELECT id FROM student_fee_accounts WHERE student_id = 1 AND fee_structure_id = 6 LIMIT 1);

-- Slip: Dilshan first instalment (APPROVED)
INSERT IGNORE INTO payment_slips
  (fee_account_id, student_id, parent_id, amount_paid, payment_date, payment_method, transaction_reference, slip_image_url, verification_status, reviewed_by, review_remarks, reviewed_at, created_at, updated_at)
VALUES
(@dilshan_tuition_id, 4, 1, 10000.00, NOW(), 'BANK_TRANSFER', 'BOC-DILSH-20261001', NULL, 'APPROVED', 'Admin Counter', 'First instalment approved', NOW(), NOW(), NOW());

-- Slip: Rashmi first instalment (APPROVED)
INSERT IGNORE INTO payment_slips
  (fee_account_id, student_id, parent_id, amount_paid, payment_date, payment_method, transaction_reference, slip_image_url, verification_status, reviewed_by, review_remarks, reviewed_at, created_at, updated_at)
VALUES
(@rashmi_tuition_id, 6, 2, 14000.00, NOW(), 'BANK_DEPOSIT', 'HNB-RASH-20261002', 'slip-rashmi-oct.jpg', 'APPROVED', 'Admin Finance', 'Bank deposit confirmed', NOW(), NOW(), NOW());

-- Slip: Malith full payment (APPROVED) — results in PAID status
INSERT IGNORE INTO payment_slips
  (fee_account_id, student_id, parent_id, amount_paid, payment_date, payment_method, transaction_reference, slip_image_url, verification_status, reviewed_by, review_remarks, reviewed_at, created_at, updated_at)
VALUES
(@malith_tuition_id, 7, 2, 28000.00, NOW(), 'BANK_TRANSFER', 'COMBANK-MALT-20261003', 'slip-malith-full.jpg', 'APPROVED', 'Admin Finance', 'Full payment cleared', NOW(), NOW(), NOW());

-- Slip: Kasun exam fee — PENDING (shows admin what to approve in demo)
INSERT IGNORE INTO payment_slips
  (fee_account_id, student_id, parent_id, amount_paid, payment_date, payment_method, transaction_reference, slip_image_url, verification_status, reviewed_by, review_remarks, reviewed_at, created_at, updated_at)
VALUES
(@kasun_exam_id, 1, 1, 3500.00, NOW(), 'BANK_DEPOSIT', 'BOC-KASUN-EXAM-20261003', 'slip-kasun-exam.jpg', 'PENDING', NULL, NULL, NULL, NOW(), NOW());

-- =====================================================================
-- STEP 5 — Receipts for the approved slips
-- =====================================================================

SET @dilshan_slip = (SELECT id FROM payment_slips WHERE transaction_reference = 'BOC-DILSH-20261001' LIMIT 1);
SET @rashmi_slip  = (SELECT id FROM payment_slips WHERE transaction_reference = 'HNB-RASH-20261002' LIMIT 1);
SET @malith_slip  = (SELECT id FROM payment_slips WHERE transaction_reference = 'COMBANK-MALT-20261003' LIMIT 1);

INSERT IGNORE INTO payment_receipts
  (payment_slip_id, receipt_number, student_id, student_name, student_admission_number, fee_structure_name, fee_type, amount_paid, remaining_balance, receipt_type, issued_by, notes, created_at)
VALUES
(@dilshan_slip, 'RCPT-2026-00002', 4, 'Dilshan Fernando', 'WYC-2026-00104', 'Grade 10 Term 1 Tuition Fee', 'TUITION', 10000.00, 15000.00, 'PARTIAL', 'Admin Counter', 'First instalment receipt', NOW()),
(@rashmi_slip,  'RCPT-2026-00003', 6, 'Rashmi Dissanayake', 'WYC-2026-00201', 'Grade 11 Term 1 Tuition Fee', 'TUITION', 14000.00, 14000.00, 'PARTIAL', 'Admin Finance', 'First half payment', NOW()),
(@malith_slip,  'RCPT-2026-00004', 7, 'Malith Weerasekara', 'WYC-2026-00202', 'Grade 11 Term 1 Tuition Fee', 'TUITION', 28000.00, 0.00, 'FULL', 'Admin Finance', 'Full tuition cleared', NOW());

-- =====================================================================
-- STEP 6 — Verify the live data (run these SELECT queries during viva)
-- =====================================================================

-- Q1: Show all fee structures (CREATE / READ)
SELECT id, name, fee_type, grade_level, amount, due_date, is_active FROM fee_structures ORDER BY id;

-- Q2: Show all student fee accounts with status (READ)
SELECT sfa.id, sfa.student_name, sfa.student_admission_number, fs.name AS fee_name,
       sfa.total_amount, sfa.paid_amount, sfa.balance_amount, sfa.status, sfa.due_date
FROM student_fee_accounts sfa
JOIN fee_structures fs ON fs.id = sfa.fee_structure_id
ORDER BY sfa.student_name, sfa.status;

-- Q3: Show all payment slips (PENDING ones for admin review = CREATE by parent)
SELECT ps.id, sfa.student_name, ps.amount_paid, ps.payment_method,
       ps.transaction_reference, ps.slip_image_url, ps.verification_status, ps.reviewed_by
FROM payment_slips ps
JOIN student_fee_accounts sfa ON sfa.id = ps.fee_account_id
ORDER BY ps.created_at DESC;

-- Q4: Show receipts (generated after APPROVE = UPDATE triggers receipt creation)
SELECT pr.receipt_number, pr.student_name, pr.fee_structure_name,
       pr.amount_paid, pr.remaining_balance, pr.receipt_type, pr.issued_by, pr.created_at
FROM payment_receipts pr ORDER BY pr.created_at DESC;

-- Q5: Financial Summary (what admin sees in Reports tab)
SELECT
  COUNT(*) AS total_accounts,
  SUM(total_amount) AS total_billed,
  SUM(paid_amount) AS total_collected,
  SUM(balance_amount) AS total_outstanding,
  ROUND(SUM(paid_amount) / SUM(total_amount) * 100, 1) AS collection_rate_pct,
  SUM(CASE WHEN status='PAID' THEN 1 ELSE 0 END) AS paid_count,
  SUM(CASE WHEN status='PARTIAL' THEN 1 ELSE 0 END) AS partial_count,
  SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) AS pending_count
FROM student_fee_accounts
WHERE status != 'CANCELLED';

-- Q6: Parent 1 (Bandula Perera) children's fees (what the Parent Portal shows)
SELECT s.first_name, s.last_name, sfa.student_admission_number,
       fs.name AS fee_name, sfa.total_amount, sfa.paid_amount, sfa.balance_amount, sfa.status
FROM students s
JOIN student_fee_accounts sfa ON sfa.student_id = s.id
JOIN fee_structures fs ON fs.id = sfa.fee_structure_id
WHERE s.parent_id = 1
ORDER BY s.first_name;

-- =====================================================================
-- VIVA LIVE DEMO CRUD SCRIPT — paste & run each block to show live changes
-- =====================================================================

/*
  ── CREATE: Add a new fee structure ──
  INSERT INTO fee_structures (name, fee_type, grade_level, academic_year, term, amount, due_date, description, is_active)
  VALUES ('Grade 10 Activity Fee', 'ACTIVITY', 10, 2026, 1, 2000.00, '2026-11-30', 'Annual sports day and cultural activities', 1);

  ── READ: See it appear ──
  SELECT * FROM fee_structures WHERE fee_type = 'ACTIVITY';

  ── UPDATE: Change the amount ──
  UPDATE fee_structures SET amount = 2500.00, updated_at = NOW() WHERE fee_type = 'ACTIVITY' AND grade_level = 10;

  ── READ: Confirm update ──
  SELECT id, name, amount, updated_at FROM fee_structures WHERE fee_type = 'ACTIVITY';

  ── DELETE: Soft-delete (deactivate) ──
  UPDATE fee_structures SET is_active = 0, updated_at = NOW() WHERE fee_type = 'ACTIVITY' AND grade_level = 10;

  ── READ: Confirm it's gone from active list ──
  SELECT id, name, is_active FROM fee_structures WHERE fee_type = 'ACTIVITY';

  ── PAYMENT FLOW DEMO ──
  -- 1. Parent submits bank slip (INSERT into payment_slips, status=PENDING)
  -- 2. Admin reviews in web portal → clicks Approve
  -- 3. Backend updates student_fee_accounts (paid_amount increases, balance decreases)
  -- 4. Backend inserts into payment_receipts
  -- Run this to see the live change:
  SELECT student_name, paid_amount, balance_amount, status FROM student_fee_accounts WHERE student_id = 4;
*/

-- =====================================================================
-- END OF DEMO SETUP
-- =====================================================================
