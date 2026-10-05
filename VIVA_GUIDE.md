# Viva Demonstration Guide — UC-04: Examination & Academic Performance

- **Module**: Examination & Academic Performance (Section 7.5 of Project Report)
- **Student Name**: Pemadasa J.M.C.D
- **Student ID**: IT25103724
- **Branch**: `feature/uc04-exam-performance`
- **Main Roles**: Teacher (`teacher1 / teacher123`), Head of Academic (`head_academic / academic123`), Administrator (`admin / admin123`), Student (`student1 / student123`)

---

## 1. Module Overview & Scope (Section 7.5)
The Examination & Academic Performance module manages examinations, curriculum test papers, student marks entry, automated grade calculation, result publication, individual report cards, and statistical class performance analytics.

---

## 2. CRUD Operations Checklist

### 1. CREATE
- **Create Examination**: Click `+ Create Exam` modal. Sets exam name, academic term (1, 2, 3), and year. Defaults to `DRAFT`.
- **Create Exam Paper**: Click `+ Add Paper` modal. Associates subject with grade level and maximum marks.
- **Batch Marks Submission**: Teachers enter student marks (0–100) with live automatic grade calculation (`A+`, `A`, `B`, `C`, `S`, `F`) and remarks.

### 2. READ
- **Exams Master List**: View all exams with status badges (`DRAFT` / `PUBLISHED`) and action chips (✏️ Edit, 🗑️ Delete, 🚀 Publish, 📝 Marks, 📊 Analytics).
- **Official Student Report Card**: Select student and exam. Displays subject name, code, marks obtained, letter grade, total score, and overall percentage average.
- **Student Self-Service Portal (`MyResults`)**: Read-only view where students see only their published results.
- **Class Analytics**: Summary metrics (Evaluated candidates, batch average, pass rate %, top performing subject), visual grade distribution breakdown, and merit list ranking.

### 3. UPDATE
- **Edit Examination**: Modify examination details.
- **Publish Examination**: `🚀 Publish` action seals the exam and releases results to students/parents.
- **Marks Corrections**: Re-open marks entry table, adjust student scores, and re-submit.

### 4. DELETE
- **Delete Exam Paper**: Remove an incorrect paper and its recorded results.
- **Delete Single Student Result**: Delete an incorrect score entry (`DELETE /api/v1/exams/results/{id}`).
- **Delete Examination**: Remove canceled draft examinations.

---

## 3. How to Run & Demonstrate for Viva

1. **Start Backend**:
   ```powershell
   cd server
   .\mvnw.cmd spring-boot:run
   ```
2. **Start Frontend**:
   ```bash
   cd client
   npm run dev
   ```
3. Open `http://localhost:5173`
4. Login as **Head of Academic / Admin**: `head_academic` / `academic123` or `admin` / `admin123`
5. Navigate to **Exams & Performance**:
   - **Tab 1: All Exams**: Show exam list, modern button chips, and `+ Create Exam`.
   - **Tab 2: Batch Marks Entry**: Select an exam and paper. Demonstrate live grade calculation as you type marks.
   - **Tab 3: Report Card**: Select student and exam. Show human-readable subject names, total marks, and average.
   - **Tab 4: Class Analytics**: Select exam. Show evaluated count, batch average, pass rate %, and merit list with student full names and ranks.
6. Login as **Student**: `student1` / `student123` to demonstrate read-only published results portal.
