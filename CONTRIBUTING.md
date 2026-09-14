# Git Contribution & Team Workflow Guide (SLIIT SE2030)

This guide outlines the exact Git workflow every member must follow to ensure maximum marks during GitHub repository inspections and vivas.

---

## 1. Setup Your Git Identity (Mandatory First Step)

Every team member **must** configure their local Git client using their own name and the email address linked to their GitHub account. If you skip this, GitHub cannot credit your commits on the repository's Insights/Contributors page.

```bash
git config --global user.name "Your Name"
git config --global user.email "your-github-email@example.com"
```

Verify your config:
```bash
git config user.name
git config user.email
```

---

## 2. Branch Allocation per Member

Each member must work exclusively on their assigned branch:

| Member IT Number | Student Name | Assigned Branch | Use Case |
| :--- | :--- | :--- | :--- |
| IT25100975 | Dissanayake D.M.R.S | `feature/uc01-student-management` | UC-01 |
| IT25102861 | Bandara R.M.K.G.R.L | `feature/uc02-teacher-management` | UC-02 |
| IT25101863 | Dissanayake D.M.S.A | `feature/uc03-attendance-management` | UC-03 |
| IT25103724 | Pemadasa J.M.C.D | `feature/uc04-exam-performance` | UC-04 |
| IT25101913 | Gimhana D.B.C | `feature/uc05-timetable-scheduling` | UC-05 |
| IT25103710 | Weerasekara K.T.J | `feature/uc06-fee-payment-management` | UC-06 |

---

## 3. Daily Workflow Steps

### Step 1: Sync with `develop`
Before starting work, ensure you have the latest changes:
```bash
git checkout develop
git pull origin develop
```

### Step 2: Switch to Your Feature Branch
```bash
git checkout feature/<your-assigned-branch>
# Keep your branch updated with develop
git merge develop
```

### Step 3: Make Regular, Atomic Commits
Do **NOT** write 1000 lines of code and push once. Make small, focused commits as you build each layer (Model, Repository, Service, Controller, UI component).

Use **Conventional Commit Messages**:
- `feat(uc01): create student entity and jpa repository`
- `feat(uc02): add teacher assignment endpoint`
- `feat(uc03): implement daily attendance roster screen`
- `feat(uc04): add automatic grade calculation service`
- `feat(uc05): implement timetable slot collision validation`
- `feat(uc06): create bank slip upload and receipt generation`
- `fix(uc03): resolve date parsing issue on attendance check`
- `test(uc05): add unit tests for room double-booking logic`

Commit example:
```bash
git add .
git commit -m "feat(uc05): add timetable conflict detection service"
```

### Step 4: Push to Your Remote Feature Branch
```bash
git push -u origin feature/<your-assigned-branch>
```

---

## 4. Pull Request (PR) & Peer Review Process

When your module or milestone feature is ready:
1. Go to the GitHub repository.
2. Click **"New Pull Request"**.
3. Set **Base Branch**: `develop` | **Compare Branch**: `feature/<your-assigned-branch>`.
4. Fill out the PR template completely:
   - Mention your IT Number and Use Case.
   - Describe what was implemented.
   - Attach screenshots or Postman test runs.
5. **Assign at least 1 peer reviewer** from your group members.
6. The reviewer must check the code diff, leave a constructive comment (e.g., *"Reviewed DTO validations and error handling, verified with Postman, ready to merge"*), and click **Approve**.
7. Merge the PR into `develop` using **"Squash and merge"** or standard **"Create a merge commit"**.

> [!WARNING]
> **Never commit or push directly to `main` or `develop`.** All updates must pass through Pull Requests with peer approvals.
