# Viva Demonstration Guide — UC-02: Teacher & Staff Management

- **Module**: Teacher & Staff Management (Section 7.2 of Project Report)
- **Student Name**: Bandara R.M.K.G.R.L
- **Student ID**: IT25102861
- **Branch**: `feature/uc02-teacher-management`
- **Main Roles**: School Administrator (`admin / admin123`), Head of Academic (`head_academic / academic123`)

---

## 1. Module Overview & Scope (Section 7.2)
The Teacher & Staff Management module manages teacher profiles, non-academic staff information, subject allocations, and operational employment statuses. It maintains accurate records of teachers, their qualifications, contact details, and teaching responsibilities across subjects and classes.

---

## 2. CRUD Operations Checklist

### 1. CREATE
- **Register Academic Teacher**: Click `+ Register Teacher` modal. Validates employee number uniqueness, full name, email (`@wycherley.lk`), phone, qualification, and hire date.
- **Register Non-Academic Staff**: Click `+ Register Staff` modal. Captures job position, department, employment type, and basic salary records.
- **Subject Allocation**: Assign teachers to curriculum subjects and grades via `<TeacherAssignments>`.
- **Subject Creation**: Maintain curriculum subjects list directly.

### 2. READ
- **Teacher Directory**: View active, on-leave, and inactive teachers with search and status filters.
- **Staff Directory**: View administrative and operational staff records categorized by department.
- **Assignment Matrix**: Dynamic view of subjects taught by each teacher.
- **Salary Information**: View basic salary and employment terms.

### 3. UPDATE
- **Edit Teacher Details**: Modify contact details, qualifications, and employment profile.
- **Edit Staff Details**: Update department, job position, and salary.
- **Inline Status Toggle**: Quickly switch status between `ACTIVE`, `ON_LEAVE`, and `INACTIVE` via styled status pills.
- **Modify Subject Allocation**: Update or reassign subject responsibilities.

### 4. DELETE / DEACTIVATE
- **Deactivate Teacher / Staff**: Soft-delete pattern (`status = INACTIVE`), preserving historical timetable, exam, and attendance associations.
- **Remove Subject Allocation**: Detach incorrect subject assignments.
- **Delete Subject**: Remove unused subjects with cascading safety checks (`DELETE /api/v1/teachers/subjects/{id}`).

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
5. Navigate to **Teacher & Staff Management**:
   - Demonstrate registering a new teacher and non-academic staff member.
   - Demonstrate switching status pills (`ACTIVE` ↔ `ON_LEAVE` ↔ `INACTIVE`).
   - Demonstrate assigning and removing subjects for a teacher.
   - Demonstrate editing teacher profile details.
