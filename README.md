# Web-based School Information Management System

**Institution**: Sri Lanka Institute of Information Technology (SLIIT)  
**Course**: SE2030 – Software Engineering  
**Academic Year / Semester**: Year 2, Semester 1 – 2026  
**Group ID**: `Group 2026 – Y2 – S1 – MLB – B3G2 – 01`  

---

## 👥 Group Members & Use Case Allocation

| IT Number | Student Name | Assigned Use Case & Module | Primary Actor |
| :--- | :--- | :--- | :--- |
| **IT25100975** | Dissanayake D.M.R.S | **UC-01**: Student & Class Management | Head of Academic |
| **IT25102861** | Bandara R.M.K.G.R.L | **UC-02**: Teacher & Staff Management | Administrator |
| **IT25101863** | Dissanayake D.M.S.A | **UC-03**: Student Attendance Management | Teacher |
| **IT25103724** | Pemadasa J.M.C.D | **UC-04**: Examination & Academic Performance | Teacher |
| **IT25101913** | Gimhana D.B.C *(Project Lead)* | **UC-05**: Timetable & Academic Scheduling | Head of Academic |
| **IT25103710** | Weerasekara K.T.J | **UC-06**: Fee & Payment Management | Administrator |

---

## 🏗️ Architecture & Technology Stack

- **Backend**: Java 17+, **Spring Boot 3.x**
  - **Spring Data JPA / Hibernate**: Object-relational mapping
  - **Spring Security + JWT**: Role-Based Access Control (`ADMIN`, `HEAD_OF_ACADEMIC`, `TEACHER`, `STUDENT`, `PARENT`)
  - **Database**: MySQL / PostgreSQL
- **Frontend**: React (Vite) + Tailwind CSS
- **Design & Modeling**: [Interactive Draw.io Database Model](https://app.diagrams.net/?grid=0&pv=0&border=10&edit=_blank#create=%7B%22type%22%3A%22mermaid%22%2C%22compressed%22%3Atrue%2C%22data%22%3A%22tVhbs6I4EP418zhVp848zDMis%2BuuRy3Fqp2nVBuiZgcIk4Rzxn%2B%2FHfASMAFk1iqrBNN8dn99h8kph4OE7NNL8On1BT%2FbTbQ2V19D%2FHz%2BLMzF68sm3k6jRWwOvtSCr0dQeFFIsecpw%2FsehDgKwj%2Frg5EIq2A9VIWb6A1i4jbjUIJMOOR4J%2FY2RhAG0%2BhtFpJwHmw2Xqz6mATz%2BTIM4tlyYYNTkWvgubJxLR0eBwSl%2BCFnCd5pYaNa9DZZuzfjgpVBDgdmGKxopCmCG1wG9MhkL%2FjkdkA228lfURgT%2FIfZH4u3FsU3pS0W6ifGQmooD0eN1zx%2FxGfDwI9CafUIbBDH0WIaLMKIrKNwuZ42aZY%2FKoftxTBSO9EwopKS6gpwd2oo6XrsjFx9t7DR6PV3GzphGKvpsFjtwgGtWZ5ATtm90dE%2FwdtscQ3rtnrmmKyCVbNOUJEVkiumBgWQG4O9Q1pCzVszZpryDqx1tNnOGwEiGRUyGcaUB0IhgsuJfQE8e4viYDKPmlhHlpSpM8hs%2BTbb18N7H%2FKcpmXSZNyIk818GT%2BIJSgtZVVm9LAK4IdS5e5fRvUDydRpo9LSnUvfIrQ0Xm%2FDeLuO7kEvldqIBWG43Dbrx46ntTPKPGkW0t7a70EUH8wVbW3xJuYq%2BG4qG7pstrLBCuBGuXcOQ1qmDwVdkXHtIq%2F9RLuL16dYo6LZqtmKWc4k5ujF1LtxYHL9qf7s%2BIHnVRcwWqz%2Bbh2je3l%2BMH5QTOaQmXq09QqxDKtfp0SBjewDE993LgVOIS0NBf5WDRdANX%2B3jr9ObRPtwHjQyuuxsZJUMt%2B8JkCScezGIid5me1McHbYu%2BdSaVIR55HAkcEpkKAXzZfY%2BZ5EX5vc8JhSgGS5vjemSZqd9M8kjWVFKk6MPZezq8DPElK%2B5xQ0%2BsknpDToUvmYsZL5mcTsQeOk2GlMJnpFiqPIvYc5py2%2Bm5Y6GuaDFtdnuAMljKTsnaU%2BVaoB2WVJjQAUETJOyYlBO7BrCQoFUK5PPv3qPzjP333B37UtjHa60tj0XYnnUtQt1E%2FGuThAmgpqJjJS%2FTAqzu0ZYmxzOM8UhIqku0FcBL0R4IwhZ8nyLCCj%2FeaNmZZ7zxY8y72t1HQuJGNN7FJqIA%2BXwLvuJ67I64%2FfW0%2FnimAMm%2B2un4Lr%2BDmaAUvvegHpdXdnNntTrHkqmVlgvRnYXujGZiH7BZk%2FszST2cN%2BGlhDWvvfWO9UBvxW%2FvU1ooRRnoEZUTP4RXq9Yi2dv2dUAcWA0tIZa7bqqDYRO%2FNajHkn6YqErrQryl3K1dGfec3F9xlFZ2jXd8TuwMhsLtxjMyuBExF78sHYD6d%2B6Fwuksts25TQvFqaUE2pSXXjPMey1Dr1OON%2FqILmfzTsUtbbC1CQqFT0truBXbG7t1hLoMjuyGzScf92Yaxv97iU6FPxwDjSSkfIRInCo3u870XEkwdQY3f98qaUvkC4GamFhpQ4Tb0JmbcifTI7SKv26xQbvJq13o6MpcpwAJQaTfro8q3TLb1TXhC09MBIKftChlRvkTxI71hSLgssGUaH9TpoNCMFnDJjZ21IT5oyynihO1Z6Mxue6xtXquzZUy54jmz0Z1tFxX8%3D%22%7D) & [docs/DATABASE_ARCHITECTURE.md](docs/DATABASE_ARCHITECTURE.md)

---

## 🔀 Git Branching Strategy & Contribution Rules

To ensure a high score in GitHub contribution metrics and code hygiene during SLIIT evaluations:

1. **`main`**: Protected branch. Deployed, production-ready code only.
2. **`develop`**: Integration branch where all sprint features are consolidated.
3. **Feature Branches**: One branch per member:
   - `feature/uc01-student-management` (IT25100975)
   - `feature/uc02-teacher-management` (IT25102861)
   - `feature/uc03-attendance-management` (IT25101863)
   - `feature/uc04-exam-performance` (IT25103724)
   - `feature/uc05-timetable-scheduling` (IT25101913)
   - `feature/uc06-fee-payment-management` (IT25103710)

> [!NOTE]
> Detailed guidelines for committing, opening PRs, and peer reviews are documented in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🚀 Getting Started

### Prerequisites
- JDK 17 or higher
- Maven 3.8+
- Node.js 18+ and npm
- MySQL Server 8.0+

### Database Setup
1. Create database:
```sql
CREATE DATABASE sim_system_db;
```
2. Configure credentials in `server/src/main/resources/application.properties`.

### Backend Setup (Spring Boot)
```bash
cd server
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend Setup (React)
```bash
cd client
npm install
npm run dev
```
