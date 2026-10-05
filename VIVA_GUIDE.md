# Viva Demonstration Guide — UC-01: Student & Class Management

- **Module**: Student & Class Management (Section 7.1 of Project Report)
- **Student Name**: Dissanayake D.M.R.S
- **Student ID**: IT25100975
- **Branch**: `feature/uc01-student-management`
- **Main Roles**: School Administrator (`admin / admin123`), Head of Academic (`head_academic / academic123`)

---

## 1. Module Overview & Scope (Section 7.1)
The Student & Class Management module is responsible for managing student records and organizing students into academic classes. It provides a centralized repository for maintaining student personal and guardian information, class allocations, and enrollment status.

---

## 2. CRUD Operations Checklist

### 1. CREATE
- **Register New Student**: Click `+ Register Student` modal. Validates first name, last name, DOB, gender, parent/guardian contact, and admission number.
- **Create Academic Class**: Click `+ New Class` modal. Defines grade level (1–13), class section/name (e.g. `10-A`), academic year, and classroom capacity.
- **Allocate Student to Class**: Assign student to an academic class for the active year with automated capacity validation.

### 2. READ
- **Student Directory**: Comprehensive directory with live multi-field search (first name, last name, admission number).
- **Grade-Level Filter**: Filter students across all school grades (Grades 1 through 13).
- **Class Lists**: View enrolled class lists and current enrollment vs capacity count.
- **Student Profile View**: View detailed student profiles and guardian details.

### 3. UPDATE
- **Edit Student Details**: Modify student name, birth date, gender, guardian information.
- **Class Reallocation / Transfer**: Move student between classes in the same academic year (safe update preventing duplicate key conflicts).
- **Update Class Details**: Update class section names, grade levels, and capacity limits.

### 4. DELETE / DEACTIVATE
- **Deactivate Student**: Soft-delete pattern (`active = false`). Disables student login and active roster visibility while strictly preserving historical attendance records, examination marks, and fee audit trails.
- **Remove Class Allocation**: Remove incorrect class assignment.

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
4. Login as **Admin**: `admin` / `admin123` or **Head of Academic**: `head_academic` / `academic123`
5. Navigate to **Student & Class Management**:
   - Demonstrate registering a new student.
   - Demonstrate filtering by Grade 10, Grade 11, etc.
   - Demonstrate searching by admission number.
   - Demonstrate creating a new class and allocating a student.
   - Demonstrate editing student details and soft-deactivating.
