# Viva Demonstration Guide — UC-03: Student Attendance Management

- **Module**: Student Attendance Management (Section 7.3 of Project Report)
- **Student Name**: Dissanayake D.M.S.A
- **Student ID**: IT25101863
- **Branch**: `feature/uc03-attendance-management`
- **Main Roles**: Teacher (`teacher1 / teacher123`), Administrator (`admin / admin123`), Principal

---

## 1. Module Overview & Scope (Section 7.3)
The Student Attendance Management function enables teachers to digitally record, correct, and monitor daily student attendance. It provides fast and accurate attendance management with historical records, absence reasons, class summary statistics, and permanent register sealing.

---

## 2. CRUD Operations Checklist

### 1. CREATE
- **Daily Batch Attendance Submission**: Select class, supervising teacher, and date. Auto-loads enrolled students with default `PRESENT` status.
- **Attendance Statuses**: Supports `PRESENT`, `ABSENT`, `LATE`, and `EXCUSED`.
- **Absence Reasons**: Capture remarks/reasons for absent or excused students.

### 2. READ
- **Daily Register Lookup**: Load attendance sheet for any class and date.
- **Class Daily Summary Statistics**: View total enrolled, present count, absent count, late count, excused count, and attendance percentage.
- **Student Attendance Profile**: Longitudinal student attendance history and percentage rate lookup (`/attendance/student/{id}/summary`).

### 3. UPDATE
- **Edit Mode for Past Dates**: Load any previously submitted register to adjust statuses and reasons.
- **Auto Status Defaulting**: Streamlined workflow to quickly fix clerical mistakes.

### 4. DELETE / LOCK
- **Permanent Lock Register**: **🔒 Lock Record** button seals attendance for the date (`PATCH /api/v1/attendance/{id}/lock`), preventing further tampering.
- **Delete Attendance Register**: Remove accidentally submitted registers (`DELETE /api/v1/attendance/{id}`).

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
4. Login as **Teacher**: `teacher1` / `teacher123` or **Admin**: `admin` / `admin123`
5. Navigate to **Attendance Management**:
   - **Tab 1: Daily Sheet**:
     - Select a class (e.g. `Grade 10-A`) and today's date. Click **Load Attendance Sheet**.
     - Mark students as Present, Absent, Late, or Excused with absence remarks.
     - Click **Submit Attendance Sheet**.
     - Re-load the same date to demonstrate **Edit Mode**.
     - Click **🔒 Lock Record** to permanently lock the register and show that editing becomes disabled.
   - **Tab 2: Attendance Reports**:
     - View class daily summary rate.
     - Lookup an individual student's overall attendance percentage.
