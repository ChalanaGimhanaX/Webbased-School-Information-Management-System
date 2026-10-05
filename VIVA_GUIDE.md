# Viva Demonstration Guide — UC-05: Timetable & Academic Scheduling

- **Module**: Timetable & Academic Scheduling (Section 7.4 of Project Report)
- **Student Name**: Gimhana D.B.C (Chalana Gimhana)
- **Student ID**: IT25101913
- **Branch**: `feature/uc05-timetable-scheduling`
- **Main Roles**: Head of Academic (`head_academic / academic123`), Administrator (`admin / admin123`), Teacher (`teacher1 / teacher123`), Student (`student1 / student123`)

---

## 1. Module Overview & Scope (Section 7.4)
The Timetable & Academic Scheduling module connects academic classes, curriculum subjects, teachers, classrooms, and time periods into conflict-free, structured schedules. It provides a 5-day × 8-period interactive timetable grid, multi-point collision prevention, comprehensive subject management, teacher timetable filtering, and dedicated student timetable access.

---

## 2. CRUD Operations Checklist

### 1. CREATE
- **Initialize Class Timetable**: Click `+ Initialize Class Timetable`. Creates a master timetable container for a class, year, and term in `DRAFT` status.
- **Assign Period Entry**: Click `+ Add Period Entry` or click any empty slot on the 5×8 weekly grid. Assigns Day, Period (1–8), Subject, Teacher, and Classroom.
- **Automated 3-Point Collision Engine**: Evaluates conflicts in real-time:
  1. Class slot collision (class already booked at this day & period)
  2. Teacher double-booking (teacher already assigned to another class at this time)
  3. Classroom conflict (room already occupied at this time)
- **Create Curriculum Subject**: Create subjects directly in the Subjects tab (`POST /api/v1/timetables/subjects`) or via the inline shortcut link inside the period assignment modal.

### 2. READ
- **Tab 1: Class Timetable Grid**: Full weekly 5-day × 8-period schedule with subject tones, teacher badge, and room number.
- **Tab 2: Teacher Timetables**: Filter schedule by teacher to view their complete weekly teaching workload and class assignments.
- **Tab 3: Subjects Management**: Master subjects directory with search, grade filter, code, and class allocation count.
- **Tab 4: Time Slots & Bell Schedule**: Official 8-period school schedule including morning registration, interval break, and period start/end times.
- **Tab 5: Student Dedicated Timetable Preview**: Clean, read-only student timetable matching the student portal view.

### 3. UPDATE
- **Modify Period Entry**: Click any existing slot to change teacher, subject, room, or time allocation (with self-exclusion logic in conflict detector).
- **Publish Timetable**: Seal timetable status (`DRAFT` → `PUBLISHED`).
- **Edit Subject**: Update subject code, name, and grade level directly.

### 4. DELETE
- **Delete Period Entry**: Click `Delete Entry` on any slot to remove cancelled or incorrect allocations.
- **Delete Subject**: Remove unused subjects with dependency checks (`DELETE /api/v1/timetables/subjects/{id}`).

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
4. Login as **Head of Academic**: `head_academic` / `academic123` or **Admin**: `admin` / `admin123`
5. Navigate to **Timetable & Scheduling**:
   - **Tab 1: Class Timetables**: Select a class (e.g. `Grade 10-A`). Show the 5×8 grid. Click an empty slot to assign a subject, teacher, and room.
   - **Collision Prevention Demo**: Try assigning the same teacher or room to another class at the same period; show the collision error banner.
   - **Tab 2: Teacher Timetables**: Select a teacher to demonstrate the consolidated teacher schedule.
   - **Tab 3: Subjects Management**: Show subject listing, add a new subject, edit, and delete.
   - **Tab 4: Bell Schedule**: Show school time slots and interval break.
   - **Tab 5: Student View**: Show the dedicated student view.
6. Login as **Student**: `student1` / `student123` to prove strict role isolation (no editing allowed).
