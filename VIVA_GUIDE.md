# Viva Demonstration Guide — UC-06: Fee & Payment Management

- **Module**: Fee & Payment Management (Section 7.6 of Project Report)
- **Student Name**: Weerasekara K.T.J
- **Student ID**: IT25103710
- **Branch**: `feature/uc06-fee-payment-management`
- **Main Roles**: School Administrator (`admin / admin123`), Parent (`parent1 / parent123`), Principal

---

## 1. Module Overview & Scope (Section 7.6)
The Fee & Payment Management function manages student fee structures, individual fee accounts, counter cash/cheque/transfer payments, parent bank deposit slip uploads, administrative slip verification with image inspection lightbox, automated receipt generation, financial summaries, and account cancellations.

---

## 2. CRUD Operations Checklist

### 1. CREATE
- **Create Fee Structure**: Click `+ Add Fee Structure`. Configures structure name, fee type (`TUITION`, `FACILITY`, `EXAM`, `LIBRARY`, `SPORTS`, `LABORATORY`, `ADMISSION`, `OTHER`), target grade level, academic year, term, and amount.
- **Assign Student Fee Account**: Click `+ Assign Fee Account` or batch grade assignment. Allocates fee obligations with due dates.
- **Record Direct Counter Payment**: `💳 Pay` button. Records Cash, Cheque, or Bank Transfer payments with transaction references and payer details.
- **Submit Bank Slip**: Parents upload bank deposit slips for verification (`POST /api/v1/fees/slips/upload`).

### 2. READ
- **Student Fee Accounts Directory**: Master table showing Invoiced Total, Paid Amount, Balance, and Status (`PAID`, `PARTIAL`, `PENDING`, `CANCELLED`).
- **Official Payment Receipt**: `📄 Receipt` button opens print-ready institutional receipt modal with receipt number, payment method, student name, and itemized billing.
- **Financial Reports & Summaries**: Comprehensive dashboard metrics: Total Invoiced, Total Collected, Total Outstanding, Collection Efficiency %, Paid Accounts, Partial Accounts (`partialAccountsCount`), and Pending Accounts.
- **Parent Portal (`/parent/fees`)**: Dedicated view where parents view fee accounts for their enrolled children, check balances, and upload payment slips.

### 3. UPDATE
- **Edit Fee Structure**: Adjust fee structure amounts, terms, and descriptions.
- **Verify / Reject Bank Slips**: Admin verification studio with image zoom lightbox (`POST /api/v1/fees/slips/{id}/verify`) to approve or reject with audit notes.
- **Balance Recalculation**: Automatic balance and status transition (`PENDING` → `PARTIAL` → `PAID`) on every verified payment.

### 4. DELETE / CANCEL
- **Cancel Fee Account**: `❌ Cancel` action calls `DELETE /api/v1/fees/accounts/{id}` and `POST /api/v1/fees/accounts/{id}/cancel` to mark uncollected accounts as `CANCELLED`.
- **Delete Fee Structure**: Remove unused fee structures with dependency validation.

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
4. Login as **Admin**: `admin` / `admin123`
5. Navigate to **Fees & Payments**:
   - **Tab 1: Accounts & Structures**:
     - Demonstrate `+ Add Fee Structure`.
     - Assign fee account to a student.
     - Click `💳 Pay` to record a direct payment and watch balance and status pill update from `Pending` → `Partial` or `Paid`.
     - Click `📄 Receipt` to view the generated receipt.
     - Demonstrate `❌ Cancel` on an account with zero payments.
   - **Tab 2: Bank Slip Verification Hub**:
     - View uploaded slips and open the inspection lightbox.
   - **Tab 3: Financial Reports**:
     - Demonstrate collection efficiency %, invoiced vs collected totals, and breakdown cards.
6. Login as **Parent**: `parent1` / `parent123` to demonstrate child fee balances and online slip upload.
