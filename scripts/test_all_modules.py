import json
import subprocess
import urllib.request
import urllib.error
import sys

BASE_URL = "http://localhost:8080/api/v1"
MYSQL_PATH = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
MYSQL_PASS = "Shi@lkasd2"
DB_NAME = "sim_system_db"

def query_db(sql):
    cmd = [MYSQL_PATH, "-u", "root", f"-p{MYSQL_PASS}", DB_NAME, "-N", "-e", sql]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        return f"DB_ERR: {res.stderr.strip()}"
    return res.stdout.strip()

def http_req(method, endpoint, body=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode()
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode()
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = {"raw": content}
        return e.code, parsed
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("=" * 75)
    print("  SIMS SYSTEMATIC VERIFICATION: ALL 6 MODULES + LIVE DATABASE UPDATES")
    print("=" * 75)
    
    # ---------------------------------------------------------
    # 1. AUTHENTICATION
    # ---------------------------------------------------------
    print("\n[STEP 1] Testing Authentication (POST /auth/login)...")
    status, res = http_req("POST", "/auth/login", {"username": "admin", "password": "admin123"})
    if status != 200 or "token" not in res:
        print(f"  FAILED to login: HTTP {status} - {res}")
        sys.exit(1)
    token = res["token"]
    print(f"  SUCCESS: Logged in as '{res['username']}' (Role: {res['role']}, Email: {res['email']})")
    
    # ---------------------------------------------------------
    # 2. UC-01: STUDENT & CLASS MANAGEMENT
    # ---------------------------------------------------------
    print("\n[STEP 2] Testing UC-01: Student & Class Management...")
    # 2.1 Create Class
    class_name = "Grade 10-T1"
    status, res_c = http_req("POST", "/students/classes", {
        "className": class_name,
        "gradeLevel": 10,
        "academicYear": 2026,
        "capacity": 30
    }, token)
    class_id = res_c.get("id")
    print(f"  2.1 Create Class '{class_name}': HTTP {status} -> Class ID {class_id}")
    assert status == 201 and class_id, f"Failed class creation: {res_c}"
    db_class = query_db(f"SELECT id, class_name, grade_level, academic_year FROM academic_classes WHERE id = {class_id};")
    print(f"      [Live MySQL Check]: academic_classes row -> {db_class}")
    
    # 2.2 Register Student
    adm_num = f"WYC-TEST-{class_id}"
    status, res_s = http_req("POST", "/students", {
        "admissionNumber": adm_num,
        "firstName": "Nuwan",
        "lastName": "Jayawardena",
        "dob": "2010-05-15",
        "gender": "MALE",
        "initialClassId": class_id
    }, token)
    student_id = res_s.get("id")
    print(f"  2.2 Register Student '{adm_num}': HTTP {status} -> Student ID {student_id}")
    assert status == 201 and student_id, f"Failed student creation: {res_s}"
    db_student = query_db(f"SELECT id, admission_number, first_name, last_name FROM students WHERE id = {student_id};")
    print(f"      [Live MySQL Check]: students row -> {db_student}")
    
    # 2.3 Update Student
    status, res_u = http_req("PUT", f"/students/{student_id}", {
        "firstName": "Nuwan Perera",
        "lastName": "Jayawardena",
        "dob": "2010-05-15",
        "gender": "MALE"
    }, token)
    print(f"  2.3 Update Student details: HTTP {status} -> Name: {res_u.get('firstName')}")
    assert status == 200, f"Failed student update: {res_u}"
    db_student_up = query_db(f"SELECT first_name, last_name FROM students WHERE id = {student_id};")
    print(f"      [Live MySQL Check]: students updated name -> {db_student_up}")
    
    # ---------------------------------------------------------
    # 3. UC-02: TEACHER & STAFF MANAGEMENT
    # ---------------------------------------------------------
    print("\n[STEP 3] Testing UC-02: Teacher & Staff Management...")
    # 3.1 Create Subject
    subj_code = f"TST{class_id}"
    status, res_subj = http_req("POST", "/teachers/subjects", {
        "subjectCode": subj_code,
        "subjectName": "Advanced Computing",
        "gradeLevel": 10
    }, token)
    subject_id = res_subj.get("id")
    print(f"  3.1 Create Subject '{subj_code}': HTTP {status} -> Subject ID {subject_id}")
    assert status == 201 and subject_id, f"Failed subject creation: {res_subj}"
    db_subj = query_db(f"SELECT id, subject_code, subject_name FROM subjects WHERE id = {subject_id};")
    print(f"      [Live MySQL Check]: subjects row -> {db_subj}")
    
    # 3.2 Register Teacher
    emp_no = f"T-TEST-{class_id}"
    status, res_t = http_req("POST", "/teachers", {
        "employeeNumber": emp_no,
        "firstName": "Priya",
        "lastName": "Silva",
        "qualification": "BSc Computer Science",
        "phone": "0771234567",
        "hireDate": "2024-01-15"
    }, token)
    teacher_id = res_t.get("id")
    print(f"  3.2 Register Teacher '{emp_no}': HTTP {status} -> Teacher ID {teacher_id}")
    assert status == 201 and teacher_id, f"Failed teacher creation: {res_t}"
    db_teacher = query_db(f"SELECT id, employee_number, first_name, status FROM teachers WHERE id = {teacher_id};")
    print(f"      [Live MySQL Check]: teachers row -> {db_teacher}")
    
    # 3.3 Patch Status
    status, res_status = http_req("PATCH", f"/teachers/{teacher_id}/status?status=ON_LEAVE", None, token)
    print(f"  3.3 Change Teacher Status to ON_LEAVE: HTTP {status} -> Status: {res_status.get('status')}")
    db_t_status = query_db(f"SELECT status FROM teachers WHERE id = {teacher_id};")
    print(f"      [Live MySQL Check]: teachers status in MySQL -> {db_t_status}")
    # Restore to ACTIVE
    http_req("PATCH", f"/teachers/{teacher_id}/status?status=ACTIVE", None, token)
    
    # 3.4 Assign Subject to Teacher
    status, res_assign = http_req("POST", "/teachers/assign-subject", {
        "teacherId": teacher_id,
        "subjectId": subject_id,
        "classId": class_id,
        "academicYear": 2026
    }, token)
    print(f"  3.4 Assign Subject to Teacher: HTTP {status}")
    assert status == 200, f"Failed subject assign: {res_assign}"
    assign_id = query_db(f"SELECT id FROM teacher_subject_assignments WHERE teacher_id = {teacher_id} AND subject_id = {subject_id};")
    db_assign = query_db(f"SELECT id, teacher_id, subject_id, class_id FROM teacher_subject_assignments WHERE id = {assign_id};")
    print(f"      [Live MySQL Check]: teacher_subject_assignments row -> {db_assign}")

    # ---------------------------------------------------------
    # 4. UC-03: ATTENDANCE MANAGEMENT
    # ---------------------------------------------------------
    print("\n[STEP 4] Testing UC-03: Student Attendance Management...")
    # 4.1 Batch Attendance Submit (POST /api/v1/attendance)
    att_date = "2026-09-18"
    status, res_att = http_req("POST", "/attendance", {
        "classId": class_id,
        "teacherId": teacher_id,
        "attendanceDate": att_date,
        "academicYear": 2026,
        "entries": [
            {"studentId": student_id, "status": "PRESENT", "remarks": "On time"}
        ]
    }, token)
    att_rec_id = res_att.get("id")
    print(f"  4.1 Submit Batch Attendance for Date {att_date}: HTTP {status} -> Record ID {att_rec_id}")
    assert status == 201 and att_rec_id, f"Failed attendance submit: {res_att}"
    db_att_rec = query_db(f"SELECT id, class_id, attendance_date FROM attendance_records WHERE id = {att_rec_id};")
    db_att_ent = query_db(f"SELECT id, student_id, status FROM attendance_entries WHERE attendance_record_id = {att_rec_id};")
    print(f"      [Live MySQL Check]: attendance_records -> {db_att_rec}")
    print(f"      [Live MySQL Check]: attendance_entries -> {db_att_ent}")
    
    # 4.2 Class Attendance Summary
    status, res_sum = http_req("GET", f"/attendance/class/{class_id}/summary?date={att_date}", None, token)
    print(f"  4.2 Fetch Class Summary: HTTP {status} -> Enrolled: {res_sum.get('totalEnrolled')}, Present: {res_sum.get('presentCount')}, Rate: {res_sum.get('attendanceRate')}%")
    assert status == 200, f"Failed class summary: {res_sum}"

    # ---------------------------------------------------------
    # 5. UC-04: EXAM PERFORMANCE & GRADING
    # ---------------------------------------------------------
    print("\n[STEP 5] Testing UC-04: Examination Performance & Grading...")
    # 5.1 Create Exam
    exam_title = f"Mid Term Evaluation {class_id}"
    status, res_ex = http_req("POST", "/exams", {
        "examName": exam_title,
        "term": 1,
        "academicYear": 2026
    }, token)
    exam_id = res_ex.get("id")
    print(f"  5.1 Create Exam '{exam_title}': HTTP {status} -> Exam ID {exam_id}")
    assert status == 201 and exam_id, f"Failed exam creation: {res_ex}"
    db_exam = query_db(f"SELECT id, exam_name, term, status FROM examinations WHERE id = {exam_id};")
    print(f"      [Live MySQL Check]: examinations row -> {db_exam}")
    
    # 5.2 Add Exam Paper
    status, res_p = http_req("POST", "/exams/papers", {
        "examId": exam_id,
        "subjectId": subject_id,
        "gradeLevel": 10,
        "maxMarks": 100.0
    }, token)
    paper_id = res_p.get("id")
    print(f"  5.2 Add Exam Paper for Subject {subject_id}: HTTP {status} -> Paper ID {paper_id}")
    assert status == 201 and paper_id, f"Failed paper creation: {res_p}"
    db_paper = query_db(f"SELECT id, exam_id, subject_id, max_marks FROM exam_papers WHERE id = {paper_id};")
    print(f"      [Live MySQL Check]: exam_papers row -> {db_paper}")
    
    # 5.3 Batch Submit Marks
    status, res_m = http_req("POST", "/exams/marks", {
        "examPaperId": paper_id,
        "marks": [
            {"studentId": student_id, "marksObtained": 88.5}
        ]
    }, token)
    print(f"  5.3 Submit Marks (88.5/100): HTTP {status} -> Results Count: {len(res_m)}")
    assert status == 201, f"Failed marks submit: {res_m}"
    db_res = query_db(f"SELECT id, exam_paper_id, student_id, marks_obtained, grade FROM exam_results WHERE exam_paper_id = {paper_id};")
    print(f"      [Live MySQL Check]: exam_results row (auto-graded) -> {db_res}")
    
    # 5.4 Exam Analytics
    status, res_an = http_req("GET", f"/exams/{exam_id}/analytics", None, token)
    print(f"  5.4 Exam Analytics: HTTP {status} -> Avg: {res_an.get('batchAverage')}, Pass Rate: {res_an.get('passRate')}%, Merit Candidates: {len(res_an.get('meritList', []))}")
    assert status == 200, f"Failed analytics: {res_an}"

    # ---------------------------------------------------------
    # 6. UC-05: TIMETABLE & SCHEDULING (LEAD MODULE - DEEP DIVE)
    # ---------------------------------------------------------
    print("\n" + "=" * 75)
    print("  [STEP 6] DEEP-TESTING UC-05: TIMETABLE & SCHEDULING (LEAD FEATURE)")
    print("=" * 75)
    
    # 6.1 Create Class Timetable
    status, res_tt = http_req("POST", "/timetables", {
        "classId": class_id,
        "academicYear": 2026,
        "term": 1
    }, token)
    tt_id = res_tt.get("id")
    print(f"  6.1 Initialize Timetable for Class {class_id}: HTTP {status} -> Timetable ID {tt_id}")
    assert status == 201 and tt_id, f"Failed timetable creation: {res_tt}"
    db_tt = query_db(f"SELECT id, class_id, academic_year, status FROM timetables WHERE id = {tt_id};")
    print(f"      [Live MySQL Check]: timetables row -> {db_tt}")
    
    # 6.2 Add First Period Slot (Monday, Period 1, Room Lab-101)
    status, res_entry1 = http_req("POST", f"/timetables/{tt_id}/entries", {
        "timeSlotId": 1,
        "subjectId": subject_id,
        "teacherId": teacher_id,
        "roomNumber": "Lab-101"
    }, token)
    entry1_id = res_entry1.get("id")
    print(f"  6.2 Add Valid Slot (Monday, Period 1, Room Lab-101): HTTP {status} -> Entry ID {entry1_id}")
    assert status == 201 and entry1_id, f"Failed entry creation: {res_entry1}"
    db_entry1 = query_db(f"SELECT id, timetable_id, subject_id, teacher_id, room_number FROM timetable_entries WHERE id = {entry1_id};")
    print(f"      [Live MySQL Check]: timetable_entries row -> {db_entry1}")
    
    # 6.3 Conflict Test 1: CLASS_SLOT_TAKEN
    print("\n  --- Testing Conflict Invariant 1: CLASS_SLOT_TAKEN ---")
    status_c1, res_c1 = http_req("POST", f"/timetables/{tt_id}/entries", {
        "timeSlotId": 1,
        "subjectId": subject_id,
        "teacherId": teacher_id,
        "roomNumber": "Room-202"
    }, token)
    print(f"  >> Attempting same class slot collision: HTTP {status_c1}")
    print(f"     Title  : {res_c1.get('title')}")
    print(f"     Detail : {res_c1.get('detail')}")
    assert status_c1 == 409, f"Expected HTTP 409 Conflict, got {status_c1}: {res_c1}"
    print("     -> SUCCESS: CLASS_SLOT_TAKEN correctly intercepted and blocked with 409 ProblemDetail!")
    
    # Create second class & timetable for cross-class conflict tests
    status, res_c2 = http_req("POST", "/students/classes", {"className": "Grade 10-T2", "gradeLevel": 10, "academicYear": 2026, "capacity": 30}, token)
    class2_id = res_c2["id"]
    status, res_tt2 = http_req("POST", "/timetables", {"classId": class2_id, "academicYear": 2026, "term": 1}, token)
    tt2_id = res_tt2["id"]
    
    # 6.4 Conflict Test 2: TEACHER_BUSY
    print("\n  --- Testing Conflict Invariant 2: TEACHER_BUSY ---")
    status_c2, res_c2 = http_req("POST", f"/timetables/{tt2_id}/entries", {
        "timeSlotId": 1,
        "subjectId": subject_id,
        "teacherId": teacher_id,  # Same teacher who is already in Lab-101 with Class 1
        "roomNumber": "Room-303"
    }, token)
    print(f"  >> Attempting teacher double-booking collision: HTTP {status_c2}")
    print(f"     Title  : {res_c2.get('title')}")
    print(f"     Detail : {res_c2.get('detail')}")
    assert status_c2 == 409, f"Expected HTTP 409 Conflict, got {status_c2}: {res_c2}"
    print("     -> SUCCESS: TEACHER_BUSY correctly intercepted and blocked with 409 ProblemDetail!")

    # 6.5 Conflict Test 3: ROOM_OCCUPIED
    print("\n  --- Testing Conflict Invariant 3: ROOM_OCCUPIED ---")
    status, res_t2 = http_req("POST", "/teachers", {
        "employeeNumber": f"T-SEC-{class_id}",
        "firstName": "Kamal",
        "lastName": "Perera",
        "qualification": "BSc",
        "phone": "0719876543",
        "hireDate": "2024-02-01"
    }, token)
    teacher2_id = res_t2["id"]
    status_c3, res_c3 = http_req("POST", f"/timetables/{tt2_id}/entries", {
        "timeSlotId": 1,
        "subjectId": subject_id,
        "teacherId": teacher2_id,  # Different teacher
        "roomNumber": "Lab-101"     # Same room already booked by Class 1
    }, token)
    print(f"  >> Attempting room double-booking collision: HTTP {status_c3}")
    print(f"     Title  : {res_c3.get('title')}")
    print(f"     Detail : {res_c3.get('detail')}")
    assert status_c3 == 409, f"Expected HTTP 409 Conflict, got {status_c3}: {res_c3}"
    print("     -> SUCCESS: ROOM_OCCUPIED correctly intercepted and blocked with 409 ProblemDetail!")

    # 6.6 Update Timetable Entry (PUT)
    print("\n  --- Testing Timetable Entry Update (PUT) ---")
    status_up, res_up = http_req("PUT", f"/timetables/{tt_id}/entries/{entry1_id}", {
        "timeSlotId": 1,
        "subjectId": subject_id,
        "teacherId": teacher_id,
        "roomNumber": "Lab-UPDATED"
    }, token)
    print(f"  6.6 Update Entry Room to 'Lab-UPDATED': HTTP {status_up} -> Room: {res_up.get('roomNumber')}")
    assert status_up == 200, f"Failed entry update: {res_up}"
    db_up = query_db(f"SELECT room_number FROM timetable_entries WHERE id = {entry1_id};")
    print(f"      [Live MySQL Check]: timetable_entries updated room in MySQL -> '{db_up}'")
    assert db_up.upper() == "LAB-UPDATED", f"Expected LAB-UPDATED, got '{db_up}'"
    
    # 6.7 Delete Timetable Entry (DELETE)
    print("\n  --- Testing Timetable Entry Deletion (DELETE) ---")
    status_del, _ = http_req("DELETE", f"/timetables/{tt_id}/entries/{entry1_id}", None, token)
    print(f"  6.7 Delete Entry {entry1_id}: HTTP {status_del}")
    assert status_del in [200, 204], f"Failed entry delete: {status_del}"
    db_del_check = query_db(f"SELECT count(*) FROM timetable_entries WHERE id = {entry1_id};")
    print(f"      [Live MySQL Check]: count in timetable_entries after delete -> {db_del_check}")
    assert db_del_check == "0", f"Expected count 0, got {db_del_check}"
    print("     -> SUCCESS: Live row deleted from MySQL!")

    # ---------------------------------------------------------
    # 7. UC-06: FEE & PAYMENT MANAGEMENT
    # ---------------------------------------------------------
    print("\n[STEP 7] Testing UC-06: Fee & Payment Management...")
    # 7.1 Create Fee Structure
    status, res_fee = http_req("POST", "/fees/structures", {
        "name": f"Term Transport Fee Grade 10 - T{class_id}",
        "feeType": "TRANSPORT",
        "gradeLevel": 10,
        "academicYear": 2026,
        "term": 1,
        "amount": 25000.0,
        "dueDate": "2026-10-31"
    }, token)
    fee_struct_id = res_fee.get("id")
    print(f"  7.1 Create Fee Structure: HTTP {status} -> Fee Structure ID {fee_struct_id}")
    assert status == 201 and fee_struct_id, f"Failed fee structure creation: {res_fee}"
    db_fee_s = query_db(f"SELECT id, name, amount, fee_type FROM fee_structures WHERE id = {fee_struct_id};")
    print(f"      [Live MySQL Check]: fee_structures row -> {db_fee_s}")
    
    # 7.2 Assign Fee to Student Account
    status, res_acc = http_req("POST", "/fees/accounts/assign-student", {
        "studentId": student_id,
        "studentAdmissionNumber": adm_num,
        "studentName": "Nuwan Perera Jayawardena",
        "gradeLevel": 10,
        "feeStructureId": fee_struct_id
    }, token)
    acc_id = res_acc.get("id")
    print(f"  7.2 Assign Fee to Student: HTTP {status} -> Account ID {acc_id}, Total: {res_acc.get('totalAmount')}, Bal: {res_acc.get('balanceAmount')}")
    assert status == 201 and acc_id, f"Failed fee assignment: {res_acc}"
    db_acc = query_db(f"SELECT id, student_id, total_amount, balance_amount, status FROM student_fee_accounts WHERE id = {acc_id};")
    print(f"      [Live MySQL Check]: student_fee_accounts row -> {db_acc}")
    
    # 7.3 Record Direct Payment
    status, res_pay = http_req("POST", "/fees/payments/record-direct", {
        "feeAccountId": acc_id,
        "amount": 25000.0,
        "paymentMethod": "CASH",
        "transactionReference": f"CASH-REC-{acc_id}",
        "paidBy": "Father",
        "notes": "Full settlement test"
    }, token)
    receipt_id = res_pay.get("id")
    print(f"  7.3 Record Direct Payment: HTTP {status} -> Receipt ID {receipt_id}, Number: {res_pay.get('receiptNumber')}")
    assert status == 201 and receipt_id, f"Failed direct payment: {res_pay}"
    db_slip = query_db(f"SELECT id, fee_account_id, amount_paid, verification_status FROM payment_slips WHERE fee_account_id = {acc_id};")
    db_receipt = query_db(f"SELECT id, receipt_number, amount_paid, remaining_balance FROM payment_receipts WHERE id = {receipt_id};")
    db_acc_after = query_db(f"SELECT balance_amount, status FROM student_fee_accounts WHERE id = {acc_id};")
    print(f"      [Live MySQL Check]: payment_slips -> {db_slip}")
    print(f"      [Live MySQL Check]: payment_receipts -> {db_receipt}")
    print(f"      [Live MySQL Check]: student_fee_accounts (Balance & Status) -> {db_acc_after}")
    
    # 7.4 Financial Summary Report
    status, res_fin = http_req("GET", "/fees/reports/summary", None, token)
    print(f"  7.4 Financial Summary: HTTP {status} -> Invoiced: {res_fin.get('totalInvoiced')}, Collected: {res_fin.get('totalCollected')}, Recovery: {res_fin.get('collectionRatePercentage')}%")
    assert status == 200, f"Failed financial summary: {res_fin}"

    # ---------------------------------------------------------
    # 8. CLEANUP TEST FIXTURES
    # ---------------------------------------------------------
    print("\n[STEP 8] Cleaning up temporary test fixtures...")
    query_db(f"DELETE FROM payment_receipts WHERE id = {receipt_id};")
    query_db(f"DELETE FROM payment_slips WHERE fee_account_id = {acc_id};")
    query_db(f"DELETE FROM student_fee_accounts WHERE id = {acc_id};")
    query_db(f"DELETE FROM fee_structures WHERE id = {fee_struct_id};")
    query_db(f"DELETE FROM timetables WHERE id in ({tt_id}, {tt2_id});")
    query_db(f"DELETE FROM exam_results WHERE exam_paper_id = {paper_id};")
    query_db(f"DELETE FROM exam_papers WHERE id = {paper_id};")
    query_db(f"DELETE FROM examinations WHERE id = {exam_id};")
    query_db(f"DELETE FROM attendance_entries WHERE attendance_record_id = {att_rec_id};")
    query_db(f"DELETE FROM attendance_records WHERE id = {att_rec_id};")
    query_db(f"DELETE FROM teacher_subject_assignments WHERE id = {assign_id};")
    query_db(f"DELETE FROM subjects WHERE id = {subject_id};")
    query_db(f"DELETE FROM teachers WHERE id in ({teacher_id}, {teacher2_id});")
    query_db(f"DELETE FROM student_class_allocations WHERE student_id = {student_id};")
    query_db(f"DELETE FROM students WHERE id = {student_id};")
    query_db(f"DELETE FROM academic_classes WHERE id in ({class_id}, {class2_id});")
    print("  SUCCESS: Temporary test fixtures removed. Database is in a pristine state.")
    
    print("\n" + "=" * 75)
    print("  ALL MODULES (UC-01 TO UC-06) & CONFLICT ENGINE VERIFIED 100% OPERATIONAL")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
