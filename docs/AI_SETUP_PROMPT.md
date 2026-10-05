# AI Agent Prompt – Set Up the Database and Start SIMS

Paste the prompt below into any AI coding agent that can run terminal commands
(Antigravity, GitHub Copilot Agent, Claude Code, Cursor, Gemini CLI, …) while the
SIMS project folder is open. It contains everything the agent needs to know about
this project, so it does not have to guess.

> Prefer zero effort? Just double-click `SIMS-Setup-and-Run.bat` in the project root –
> it does all of this automatically. Use this prompt when you want an AI agent to do it,
> to debug a failing setup, or to use your own installed MySQL.

---

## Full prompt (copy everything inside the box)

```text
You are setting up and running the "SIMS – School Information Management System"
(SLIIT SE2030 group project, Wycherley International School Gampaha) on this
Windows PC. Your job: get the DATABASE running, start the BACKEND and FRONTEND,
and PROVE it works. Work step by step, run real commands, and verify each step
before moving on. Do not stop until the verification in STEP 6 passes or you hit
a blocker you cannot solve (then explain it clearly).

=== PROJECT FACTS (trust these) ===
- Repo: https://github.com/ChalanaGimhanaX/Webbased-School-Information-Management-System
  (main working branch: develop). If the folder is not already open, clone it.
- server/  = Spring Boot 3.2.3 REST API, Java (compiles for 17, run with JDK 21 LTS),
             Maven wrapper server/mvnw.cmd, port 8080, base path /api/v1, JWT auth.
- client/  = React 19 + Vite 8 + Tailwind 4 SPA, port 5173. Needs Node.js 22.12+ (24 LTS ok).
             client/vite.config.js proxies /api -> http://localhost:8080.
- Ignore the legacy Thymeleaf app in the repo-root src/ folder; it is NOT part of this setup.
- Database config: server/src/main/resources/application.properties
    spring.datasource.url=jdbc:mysql://localhost:3306/sim_system_db?...
    spring.datasource.username=${DB_USERNAME:root}
    spring.datasource.password=${DB_PASSWORD:...}
    spring.jpa.hibernate.ddl-auto=update   (Hibernate CREATES all tables itself)
- On startup, data seeders automatically create demo users, classes, students,
  teachers, timetable and fee data. You do NOT need to import any SQL.
- Spring relaxed binding: any property can be overridden with an environment
  variable, e.g. SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME,
  SPRING_DATASOURCE_PASSWORD, SPRING_JPA_DATABASE_PLATFORM.
- Optional: GEMINI_API_KEY env var enables the student "AI Study Buddy"
  (without it the assistant returns HTTP 503 "not configured" – that is fine).
- An "h2" Spring profile exists (in-memory H2, zero setup, data lost on restart).
- A ready-made launcher SIMS-Setup-and-Run.bat exists in the repo root. It downloads
  portable JDK 21, Node 24 and MariaDB 11.4 into .runtime\ and starts everything.
  You may use it (option A below) or do the setup manually.

=== HARD RULES ===
1. NEVER run database/schema.sql or database/*.sql against a database that has data –
   schema.sql starts with DROP TABLE statements and wipes everything. Hibernate
   creates the schema automatically; you do not need these files.
2. Do NOT edit application.properties to put real passwords in it and do NOT commit
   secrets. Pass credentials through environment variables only.
3. Do NOT git commit, git push or change branches unless I explicitly ask.
4. Do NOT kill a process you did not start without telling me what it is
   (name + PID) and asking first – unless it is clearly an old SIMS java/node/mariadb
   process on ports 8080, 5173 or 3307.
5. Do NOT install software system-wide with admin rights if a portable/no-admin option
   works. Prefer winget only if I already have it and approve.
6. Long-running servers must run in the background / separate terminals so you can
   keep working and verifying.

=== STEP 1 – Inspect the machine (report findings before changing anything) ===
- Windows version, CPU architecture, free disk space (need ~2 GB).
- `java -version`, `node -v`, `npm -v`, `git --version` – note which exist.
- Is MySQL/MariaDB already installed or running? Check services
  (sc query | findstr /i "mysql mariadb") and listeners on 3306/3307.
- Are ports 8080, 5173, 3306, 3307 free? (netstat -ano | findstr LISTENING)
- Is GEMINI_API_KEY already set?

=== STEP 2 – Choose the database (pick the first that applies, tell me which) ===
A) FASTEST / recommended on a fresh PC: run SIMS-Setup-and-Run.bat (portable MariaDB on
   127.0.0.1:3307, db sim_system_db, user root, password sims_local_2026). If you use
   this, set SIMS_NO_BROWSER=1 if you cannot open a browser, then jump to STEP 6.
B) MySQL 8 is ALREADY installed and running on 3306: ask me for the MySQL username
   and password, then set SPRING_DATASOURCE_USERNAME / SPRING_DATASOURCE_PASSWORD
   (or DB_USERNAME / DB_PASSWORD). The database is auto-created if you use
   SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/sim_system_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
C) No MySQL and you want a persistent DB without the .bat: download the portable
   MariaDB ZIP (https://archive.mariadb.org/mariadb-11.4.4/winx64-packages/mariadb-11.4.4-winx64.zip),
   extract it, initialise with
     bin\mariadb-install-db.exe --datadir=<data dir> --password=<pw> --port=3307
   start bin\mariadbd.exe --defaults-file=<data dir>\my.ini --bind-address=127.0.0.1 --console
   and set SPRING_DATASOURCE_URL to port 3307 plus
   SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MariaDBDialect.
D) Just need a quick demo, data loss is OK: use the h2 profile
   (mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=h2").
Wait until the DB port is accepting connections before starting the backend.

=== STEP 3 – Runtimes ===
- Need a JDK 17–21 (JDK 21 Temurin recommended). If only JDK 22+ (e.g. 25) is
  present, it still works (Lombok is 1.18.42), but tests need
  -DargLine=-Dnet.bytebuddy.experimental=true. Set JAVA_HOME for the backend terminal.
- Need Node.js >= 22.12. If missing, use a portable ZIP from nodejs.org or winget.

=== STEP 4 – Start the backend ===
- In server/: run the Maven wrapper by its FULL PATH, e.g.
  "<repo>\server\mvnw.cmd" spring-boot:run
  (with the DB environment variables from STEP 2 set in that same terminal).
- First run downloads Maven + dependencies (several minutes). Wait until the log shows
  "Started SimsApplication" and port 8080 is listening. If it fails, read the FIRST
  error in the log (usually DB connection/credentials) and fix it.

=== STEP 5 – Start the frontend ===
- In client/: `npm install` (only if node_modules is missing or outdated), then
  `npm run dev` in the background. Wait for "Local: http://localhost:5173".

=== STEP 6 – Verify (mandatory, show me the output) ===
1. POST http://localhost:5173/api/v1/auth/login  body {"username":"admin","password":"admin123"}
   -> 200 with a JWT "token" and role ADMIN. (Going through 5173 also proves the Vite proxy works.)
2. Log in as each demo user and report the returned role:
     admin / admin123            -> ADMIN
     head_academic / academic123 -> HEAD_OF_ACADEMIC
     teacher1 / teacher123       -> TEACHER
     student1 / student123       -> STUDENT
     parent1 / parent123         -> PARENT
3. With the admin token (Authorization: Bearer <token>) GET /api/v1/students,
   /api/v1/students/classes, /api/v1/teachers and /api/v1/fees/accounts – report row counts
   (expect demo data, e.g. 6 students, 4 classes, 3 teachers).
4. If you used MySQL/MariaDB, confirm the tables exist in sim_system_db
   (expect ~21 tables).
Use PowerShell Invoke-RestMethod or curl.exe – not a browser – for these checks.

=== KNOWN PITFALLS (check these first if something fails) ===
- "'mvnw.cmd' is not recognized" even inside server/: some shells set
  NoDefaultCurrentDirectoryInExePath. Call scripts by full path (or .\mvnw.cmd in PowerShell).
- Vite on Windows often listens only on IPv6 [::1]:5173 – test with "localhost", not 127.0.0.1.
- Git-for-Windows' tar cannot extract .zip; use %SystemRoot%\System32\tar.exe or Expand-Archive.
- Access denied for user 'root': wrong DB password – ask me, do not guess repeatedly.
- Port 8080 busy: often an old SIMS backend; identify the PID/process before stopping it.
- HTTP 403 on a GET right after login usually means a missing/expired Bearer token,
  not a broken server. 405 on GET /api/v1/timetables is expected (no list endpoint).
- AI Study Buddy says "not configured": GEMINI_API_KEY is not set – optional.

=== FINAL REPORT (when done) ===
Give me a short table: database type/host/port/db name/user, backend URL, frontend URL,
Java and Node versions used, which login checks passed, row counts, and the exact
commands to (a) start everything again later and (b) stop everything.
```

---

## Short version (when the agent already knows the repo)

```text
Set up and run SIMS on this Windows PC. Prefer running SIMS-Setup-and-Run.bat from the
repo root (portable JDK 21 + Node 24 + MariaDB on port 3307, no admin). If I already
have MySQL on 3306, ask me for its credentials and pass them via SPRING_DATASOURCE_*
env vars instead. Never run database/schema.sql (it drops all tables) – Hibernate and
the seeders create schema + demo data. Don't commit, push or put passwords in
application.properties. Backend: server\mvnw.cmd spring-boot:run (port 8080).
Frontend: client\npm install && npm run dev (port 5173, proxies /api to 8080).
Verify by POSTing {"username":"admin","password":"admin123"} to
http://localhost:5173/api/v1/auth/login, logging in as student1/student123,
teacher1/teacher123, head_academic/academic123, parent1/parent123, and GETting
/api/v1/students with the admin token. Report results and how to start/stop again.
```

---

## Demo logins (for reference)

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Head of Academic | `head_academic` | `academic123` |
| Teacher | `teacher1` | `teacher123` |
| Student | `student1` | `student123` |
| Parent | `parent1` | `parent123` |
