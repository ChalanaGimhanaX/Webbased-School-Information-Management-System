// Assigned module owner: IT25103710
import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../api/axios';
import PaymentMaintenance from '../components/PaymentMaintenance';

const FEE_TYPES = ['TUITION', 'FACILITY', 'EXAMINATION', 'LIBRARY', 'ADMISSION', 'TRANSPORT', 'ACTIVITY', 'OTHER'];
const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'BANK_DEPOSIT', 'CHEQUE'];

const resolveSlipUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
};

const REMARK_PRESETS = [
  { label: 'Bank Statement Verified', text: 'Bank reference verified with statement and branch records' },
  { label: 'Counter Cash Verified', text: 'Direct counter deposit verified with official bank teller stamp' },
  { label: 'Online Transfer Cleared', text: 'Online fund transfer cleared into institutional collection account' },
  { label: 'Illegible Slip Image', text: 'Slip image is illegible or blurry. Please upload a clear photo of the bank slip.' },
  { label: 'Amount Mismatch', text: 'Amount indicated on the deposit slip does not match the entered payment amount.' },
  { label: 'Duplicate Reference', text: 'This transaction reference number has already been processed.' },
];

const Fees = () => {
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'slips' | 'reports'

  const [feeStructures, setFeeStructures] = useState([]);
  const [studentAccounts, setStudentAccounts] = useState([]);
  const [students, setStudents] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [overdueAccounts, setOverdueAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const [editingStructure, setEditingStructure] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Forms
  const emptyStructureForm = {
    name: '', feeType: 'TUITION', gradeLevel: '', academicYear: new Date().getFullYear(),
    term: '', amount: '', dueDate: '', description: '',
  };
  const [structureForm, setStructureForm] = useState(emptyStructureForm);

  const emptyAssignForm = {
    studentId: '', feeStructureId: '', dueDate: '', remarks: '',
  };
  const [assignForm, setAssignForm] = useState(emptyAssignForm);

  const emptyPaymentForm = {
    amount: '', paymentMethod: 'CASH', transactionReference: '', paidBy: '', notes: '',
  };
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  // Bank Deposit Slip Review State
  const [allSlips, setAllSlips] = useState([]);
  const [pendingSlips, setPendingSlips] = useState([]);
  const [slipReviewModalOpen, setSlipReviewModalOpen] = useState(false);
  const [selectedSlipForReview, setSelectedSlipForReview] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [slipsFilter, setSlipsFilter] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  const [slipsSearch, setSlipsSearch] = useState('');

  // Slip Inspector Interactive Tools State
  const [slipZoom, setSlipZoom] = useState(1);
  const [slipRotation, setSlipRotation] = useState(0);
  const [slipFilter, setSlipFilter] = useState('normal'); // 'normal' | 'contrast' | 'invert'
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  /* ─── Data Loading ─── */
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [structRes, accRes, studRes, sumRes, ovRes, allSlipsRes] = await Promise.all([
        api.get('/fees/structures').catch(() => ({ data: [] })),
        api.get('/fees/accounts').catch(() => ({ data: [] })),
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/fees/reports/summary').catch(() => ({ data: null })),
        api.get('/fees/reports/overdue').catch(() => ({ data: [] })),
        api.get('/fees/payments').catch(() => ({ data: [] })),
      ]);

      const loadedSlips = Array.isArray(allSlipsRes.data) ? allSlipsRes.data : [];
      setFeeStructures(Array.isArray(structRes.data) ? structRes.data : []);
      setStudentAccounts(Array.isArray(accRes.data) ? accRes.data : []);
      setStudents(Array.isArray(studRes.data) ? studRes.data : []);
      setFinancialSummary(sumRes.data);
      setOverdueAccounts(Array.isArray(ovRes.data) ? ovRes.data : []);
      setAllSlips(loadedSlips);
      setPendingSlips(loadedSlips.filter(s => s.verificationStatus === 'PENDING'));
    } catch {
      setError('Failed to load fee and payment slip data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const flash = (msg) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 4500); };
  const errMsg = (err) => err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error || 'Operation failed.';

  /* ─── Fee Structure CRUD ─── */
  const openCreateStructure = () => {
    setEditingStructure(null);
    setStructureForm(emptyStructureForm);
    setError('');
    setStructureModalOpen(true);
  };

  const openEditStructure = (s) => {
    setEditingStructure(s);
    setStructureForm({
      name: s.name || '', feeType: s.feeType || 'TUITION', gradeLevel: s.gradeLevel || '',
      academicYear: s.academicYear || new Date().getFullYear(), term: s.term || '',
      amount: s.amount || '', dueDate: s.dueDate || '', description: s.description || '',
    });
    setError('');
    setStructureModalOpen(true);
  };

  const handleStructureSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const payload = {
        name: structureForm.name.trim(),
        feeType: structureForm.feeType,
        gradeLevel: structureForm.gradeLevel ? parseInt(structureForm.gradeLevel) : null,
        academicYear: parseInt(structureForm.academicYear),
        term: structureForm.term ? parseInt(structureForm.term) : null,
        amount: parseFloat(structureForm.amount),
        dueDate: structureForm.dueDate || null,
        description: structureForm.description.trim() || null,
      };

      if (editingStructure) {
        await api.put(`/fees/structures/${editingStructure.id}`, {
          name: payload.name, amount: payload.amount,
          dueDate: payload.dueDate, description: payload.description,
        });
        flash(`Fee structure "${payload.name}" updated.`);
      } else {
        await api.post('/fees/structures', payload);
        flash(`Fee structure "${payload.name}" created.`);
      }
      setStructureModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStructure = async (s) => {
    if (!window.confirm(`Delete fee structure "${s.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/fees/structures/${s.id}`);
      flash(`Fee structure "${s.name}" deleted.`);
      fetchAll();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  /* ─── Fee Account (Assign) ─── */
  const openAssignModal = () => {
    setAssignForm(emptyAssignForm);
    setError('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const student = students.find(s => s.id === parseInt(assignForm.studentId));
      if (!student) throw new Error('Select a student.');
      const structure = feeStructures.find(f => f.id === parseInt(assignForm.feeStructureId));
      if (!structure) throw new Error('Select a fee structure.');

      await api.post('/fees/accounts/assign-student', {
        studentId: student.id,
        studentAdmissionNumber: student.admissionNumber,
        studentName: `${student.firstName} ${student.lastName}`,
        gradeLevel: student.currentGrade || structure.gradeLevel || 10,
        feeStructureId: structure.id,
        dueDate: assignForm.dueDate || null,
        remarks: assignForm.remarks.trim() || null,
      });
      flash(`Fee assigned to ${student.firstName} ${student.lastName}.`);
      setAssignModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAccount = async (acct) => {
    const reason = window.prompt(`Reason for cancelling fee account #${acct.id} (${acct.studentName}):`);
    if (reason === null) return;
    try {
      await api.post(`/fees/accounts/${acct.id}/cancel?reason=${encodeURIComponent(reason || 'Cancelled by admin')}`);
      flash(`Account #${acct.id} cancelled.`);
      fetchAll();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  /* ─── Direct Payment (Cash/Cheque/Bank) ─── */
  const openPaymentModal = (acct) => {
    setSelectedAccount(acct);
    setPaymentForm({
      amount: acct.balanceAmount || '',
      paymentMethod: 'CASH',
      transactionReference: `REC-${Date.now().toString().slice(-6)}`,
      paidBy: acct.studentName ? `${acct.studentName} (Parent)` : '',
      notes: '',
    });
    setError('');
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await api.post('/fees/payments/record-direct', {
        feeAccountId: selectedAccount.id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference.trim() || null,
        paidBy: paymentForm.paidBy.trim() || null,
        recordedBy: 'Admin Counter',
        notes: paymentForm.notes.trim() || null,
      });
      flash(`Payment of LKR ${Number(paymentForm.amount).toLocaleString()} recorded!`);
      setPaymentModalOpen(false);
      fetchAll();

      // Show receipt modal
      if (res.data) {
        setActiveReceipt(res.data);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  const viewReceiptsForStudent = async (studentId) => {
    try {
      const res = await api.get(`/fees/receipts/student/${studentId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setActiveReceipt(res.data[0]);
        setReceiptModalOpen(true);
      } else {
        setError('No issued receipts found for this student.');
      }
    } catch {
      setError('Could not retrieve receipt information.');
    }
  };

  /* ─── Slip Verification (Approve / Reject) ─── */
  const openReviewSlipModal = (slip) => {
    setSelectedSlipForReview(slip);
    setReviewRemarks(slip.reviewRemarks || '');
    setSlipZoom(1);
    setSlipRotation(0);
    setSlipFilter('normal');
    setError('');
    setSlipReviewModalOpen(true);
  };

  const navigatePendingSlip = (direction) => {
    if (!selectedSlipForReview || pendingSlips.length <= 1) return;
    const currentIndex = pendingSlips.findIndex(s => s.id === selectedSlipForReview.id);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < pendingSlips.length) {
      openReviewSlipModal(pendingSlips[nextIndex]);
    }
  };

  const copyReferenceToClipboard = (ref) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const downloadSlipFile = (slip) => {
    if (!slip?.slipImageUrl) return;
    const a = document.createElement('a');
    a.href = resolveSlipUrl(slip.slipImageUrl);
    a.download = `slip-${slip.id}-${slip.transactionReference || 'voucher'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleVerifySlip = async (decision) => {
    if (!selectedSlipForReview) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.put(`/fees/payments/${selectedSlipForReview.id}/verify`, {
        status: decision,
        reviewedBy: 'Admin Finance',
        reviewRemarks: reviewRemarks.trim() || (decision === 'APPROVED' ? 'Deposit slip verified and approved' : 'Rejected after review'),
      });

      flash(`Payment slip #${selectedSlipForReview.id} has been ${decision.toLowerCase()}!`);
      setSlipReviewModalOpen(false);
      fetchAll();

      // If approved and receipt returned, show receipt modal
      if (decision === 'APPROVED' && res.data?.receiptNumber) {
        try {
          const rcptRes = await api.get(`/fees/receipts/${res.data.receiptNumber}`);
          if (rcptRes.data) {
            setActiveReceipt(rcptRes.data);
            setReceiptModalOpen(true);
          }
        } catch {
          // Receipt generated successfully
        }
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Table Columns ─── */
  const structureCols = [
    { header: 'ID', accessor: 'id' },
    { header: 'Fee Name', accessor: 'name' },
    { header: 'Type', cell: (r) => <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-medium">{r.feeType}</span> },
    { header: 'Grade', cell: (r) => r.gradeLevel ? `Grade ${r.gradeLevel}` : 'All' },
    { header: 'Year', accessor: 'academicYear' },
    { header: 'Term', cell: (r) => r.term ? `Term ${r.term}` : 'All' },
    { header: 'Amount', cell: (r) => <span className="font-semibold text-gray-900">LKR {Number(r.amount).toLocaleString()}</span> },
    { header: 'Due Date', cell: (r) => r.dueDate || '—' },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex space-x-2">
          <button onClick={() => openEditStructure(r)} className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold px-2 py-1 bg-indigo-50 rounded">Edit</button>
          <button onClick={() => deleteStructure(r)} className="text-red-600 hover:text-red-900 text-xs font-semibold px-2 py-1 bg-red-50 rounded">Delete</button>
        </div>
      ),
    },
  ];

  const accountCols = [
    { header: '#', accessor: 'id' },
    {
      header: 'Student',
      cell: (r) => (
        <div>
          <div className="font-medium text-gray-900">{r.studentName || `Student #${r.studentId}`}</div>
          <div className="text-xs text-gray-400">{r.studentAdmissionNumber || `ID: ${r.studentId}`}</div>
        </div>
      ),
    },
    { header: 'Fee Structure', cell: (r) => r.feeStructure?.name || '—' },
    { header: 'Total Invoiced', cell: (r) => `LKR ${Number(r.totalAmount || 0).toLocaleString()}` },
    { header: 'Paid', cell: (r) => <span className="text-green-600 font-medium">LKR {Number(r.paidAmount || 0).toLocaleString()}</span> },
    { header: 'Balance', cell: (r) => <span className="text-red-600 font-semibold">LKR {Number(r.balanceAmount || 0).toLocaleString()}</span> },
    {
      header: 'Status',
      cell: (r) => {
        const s = r.status;
        if (s === 'PAID') return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 font-medium">Paid</span>;
        if (s === 'PARTIALLY_PAID') return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">Partial</span>;
        if (s === 'CANCELLED') return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500 font-medium">Cancelled</span>;
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">Pending</span>;
      },
    },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex space-x-1.5">
          <button
            onClick={() => openPaymentModal(r)}
            disabled={r.balanceAmount <= 0 || r.status === 'CANCELLED'}
            className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold px-2 py-1 bg-indigo-50 rounded disabled:text-gray-400 disabled:bg-gray-50"
          >
            {r.balanceAmount <= 0 ? 'Settled' : 'Pay'}
          </button>
          {r.paidAmount > 0 && (
            <button
              onClick={() => viewReceiptsForStudent(r.studentId)}
              className="text-green-600 hover:text-green-900 text-xs font-semibold px-2 py-1 bg-green-50 rounded"
            >
              Receipt
            </button>
          )}
          <button
            onClick={() => cancelAccount(r)}
            disabled={r.status === 'CANCELLED' || r.status === 'PAID'}
            className="text-red-600 hover:text-red-900 text-xs font-semibold px-2 py-1 bg-red-50 rounded disabled:text-gray-400 disabled:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      ),
    },
  ];

  const filteredAccounts = studentAccounts.filter((a) => {
    const t = search.toLowerCase();
    return (a.studentName || '').toLowerCase().includes(t) ||
           (a.studentAdmissionNumber || '').toLowerCase().includes(t) ||
           (a.feeStructure?.name || '').toLowerCase().includes(t);
  });

  // Filtered slips for Slips Tab
  const filteredSlips = allSlips.filter((s) => {
    if (slipsFilter !== 'ALL' && s.verificationStatus !== slipsFilter) return false;
    if (!slipsSearch.trim()) return true;
    const q = slipsSearch.toLowerCase();
    return (s.studentName || '').toLowerCase().includes(q) ||
           (s.studentAdmissionNumber || '').toLowerCase().includes(q) ||
           (s.feeStructureName || '').toLowerCase().includes(q) ||
           (s.paidBy || '').toLowerCase().includes(q) ||
           (s.transactionReference || '').toLowerCase().includes(q) ||
           String(s.id).includes(q) ||
           String(s.studentId).includes(q);
  });

  // Helper to look up account details for current slip under review
  const currentSlipAccount = selectedSlipForReview
    ? studentAccounts.find(a => a.id === selectedSlipForReview.feeAccountId) || {
        studentName: selectedSlipForReview.studentName,
        studentAdmissionNumber: selectedSlipForReview.studentAdmissionNumber,
        feeStructure: { name: selectedSlipForReview.feeStructureName },
        balanceAmount: selectedSlipForReview.accountBalance,
        totalAmount: selectedSlipForReview.accountTotal,
      }
    : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Fee & Payment Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Configure institutional fees, record student payments, review bank deposit slips, and generate receipts</p>
        </div>
        <div className="flex space-x-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'accounts'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            Accounts & Structures
          </button>
          <button
            onClick={() => setActiveTab('slips')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'slips'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            <span>Bank Slips & Verification</span>
            {pendingSlips.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white animate-pulse">
                {pendingSlips.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'reports'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            Financial Summaries & Reports
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{success}</div>}

      {/* ── TAB 1: Accounts & Structures ── */}
      {activeTab === 'accounts' && (
        <div className="space-y-8">
          {/* 🔔 Pending Bank Deposit Slips for Admin Review */}
          {pendingSlips.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <h3 className="text-lg font-bold text-amber-900">
                    Pending Bank Slips Awaiting Review ({pendingSlips.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-200 text-amber-900">
                    Action Required
                  </span>
                  <button
                    onClick={() => setActiveTab('slips')}
                    className="text-xs font-bold px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>Open Slips Verification Hub</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                Parents have uploaded deposit/transfer receipts. Review the slip image and transaction details below to verify and settle the student accounts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingSlips.map((slip) => (
                  <div key={slip.id} className="bg-white rounded-lg p-4 border border-amber-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900 text-sm">Slip #{slip.id}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                          {slip.paymentMethod}
                        </span>
                      </div>
                      <div className="mt-2 text-xs space-y-1 text-gray-600">
                        <div><strong>Student:</strong> {slip.studentName || `#${slip.studentId}`}</div>
                        <div><strong>Paid By:</strong> {slip.paidBy || 'Parent'}</div>
                        <div><strong>Ref:</strong> <span className="font-mono text-indigo-700">{slip.transactionReference}</span></div>
                        <div><strong>Amount:</strong> <span className="text-green-700 font-bold text-sm">LKR {Number(slip.amountPaid).toLocaleString()}</span></div>
                      </div>
                      {slip.slipImageUrl && (
                        <div
                          onClick={() => openReviewSlipModal(slip)}
                          className="mt-2 h-28 bg-gray-900 rounded-md border border-gray-300 overflow-hidden cursor-pointer relative group flex items-center justify-center"
                        >
                          <img
                            src={resolveSlipUrl(slip.slipImageUrl)}
                            alt="Slip thumbnail"
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <span>🔍 Click to Inspect</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => openReviewSlipModal(slip)}
                      className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>🔍 Review & Verify Slip Image</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PaymentMaintenance accounts={studentAccounts} refreshAccounts={fetchAll} />
          {/* Quick Metrics Bar */}
          {financialSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Total Billed</span>
                <p className="text-xl font-bold text-gray-800 mt-1">LKR {Number(financialSummary.totalInvoiced).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Total Collected</span>
                <p className="text-xl font-bold text-green-600 mt-1">LKR {Number(financialSummary.totalCollected).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Total Outstanding</span>
                <p className="text-xl font-bold text-red-600 mt-1">LKR {Number(financialSummary.totalOutstanding).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Collection Rate</span>
                <p className="text-xl font-bold text-indigo-600 mt-1">{financialSummary.collectionRatePercentage}%</p>
              </div>
            </div>
          )}

          {/* Fee Structures */}
          <div className="bg-white rounded-lg shadow-xs p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Official Fee Structures</h3>
              <button onClick={openCreateStructure} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                + Add Fee Structure
              </button>
            </div>
            {loading ? (
              <div className="py-6 text-center text-gray-500">Loading...</div>
            ) : (
              <DataTable columns={structureCols} data={feeStructures} />
            )}
          </div>

          {/* Student Fee Accounts */}
          <div className="bg-white rounded-lg shadow-xs p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Student Fee Accounts</h3>
              <div className="flex space-x-3">
                <input
                  type="text" placeholder="Search student or fee..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-64"
                />
                <button onClick={openAssignModal} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                  + Assign Fee
                </button>
              </div>
            </div>
            {loading ? (
              <div className="py-6 text-center text-gray-500">Loading...</div>
            ) : (
              <DataTable columns={accountCols} data={filteredAccounts} />
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Bank Deposit Slips & Verification Hub ── */}
      {activeTab === 'slips' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar for Slips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-xs border border-amber-200 bg-amber-50/30">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending Review</span>
              <div className="flex items-center justify-between mt-1">
                <p className="text-2xl font-bold text-amber-900">{pendingSlips.length}</p>
                {pendingSlips.length > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-200 text-amber-900">
                    Needs Action
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-xs border border-green-200 bg-green-50/30">
              <span className="text-xs font-bold uppercase tracking-wider text-green-800">Approved Slips</span>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {allSlips.filter(s => s.verificationStatus === 'APPROVED').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-xs border border-red-200 bg-red-50/30">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">Rejected Slips</span>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {allSlips.filter(s => s.verificationStatus === 'REJECTED').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-xs border border-indigo-200 bg-indigo-50/30">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Total Slips Submitted</span>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{allSlips.length}</p>
            </div>
          </div>

          {/* Verification Workspace Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bank Deposit & Transfer Slip Verifications</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Inspect parent-uploaded receipts, verify transaction references against bank statements, and approve or reject payments.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setSlipsFilter('PENDING')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      slipsFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pending ({pendingSlips.length})
                  </button>
                  <button
                    onClick={() => setSlipsFilter('APPROVED')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      slipsFilter === 'APPROVED' ? 'bg-green-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Approved ({allSlips.filter(s => s.verificationStatus === 'APPROVED').length})
                  </button>
                  <button
                    onClick={() => setSlipsFilter('REJECTED')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      slipsFilter === 'REJECTED' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Rejected ({allSlips.filter(s => s.verificationStatus === 'REJECTED').length})
                  </button>
                  <button
                    onClick={() => setSlipsFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      slipsFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All ({allSlips.length})
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search student, ref #, or slip ID..."
                  value={slipsSearch}
                  onChange={(e) => setSlipsSearch(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500 w-56"
                />
              </div>
            </div>

            {/* Slips List Table */}
            {filteredSlips.length === 0 ? (
              <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="text-3xl mb-2">📄</div>
                <p className="font-semibold text-gray-700">No payment slips found matching this filter</p>
                <p className="text-xs text-gray-500 mt-1">Select another filter or check back once parents upload deposit slips.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">Slip</th>
                      <th className="px-4 py-3 text-left">Student & Fee Structure</th>
                      <th className="px-4 py-3 text-left">Bank Ref & Payer</th>
                      <th className="px-4 py-3 text-right">Amount Paid</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Slip Image</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredSlips.map((slip) => (
                      <tr key={slip.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-gray-900">#{slip.id}</span>
                          <div className="text-[11px] text-gray-400">
                            {slip.paymentDate ? new Date(slip.paymentDate).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{slip.studentName || `Student #${slip.studentId}`}</div>
                          <div className="text-[11px] text-indigo-600 font-medium">
                            {slip.studentAdmissionNumber ? `${slip.studentAdmissionNumber} • ` : ''}
                            {slip.feeStructureName || 'Institutional Fee'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono font-semibold text-gray-800 flex items-center gap-1">
                            <span>{slip.transactionReference || 'N/A'}</span>
                            {slip.transactionReference && (
                              <button
                                onClick={() => copyReferenceToClipboard(slip.transactionReference)}
                                className="text-gray-400 hover:text-indigo-600 text-[10px]"
                                title="Copy Reference"
                              >
                                📋
                              </button>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {slip.paidBy || 'Parent'} • <span className="font-semibold">{slip.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className="font-bold text-green-700 text-sm">
                            LKR {Number(slip.amountPaid).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-[11px] rounded-full font-bold border ${
                            slip.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                            slip.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                          }`}>
                            {slip.verificationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {slip.slipImageUrl ? (
                            <button
                              onClick={() => openReviewSlipModal(slip)}
                              className="relative group inline-block h-12 w-16 bg-slate-900 rounded border border-gray-300 overflow-hidden shadow-xs hover:border-indigo-500 transition-colors"
                            >
                              <img
                                src={resolveSlipUrl(slip.slipImageUrl)}
                                alt="Slip thumbnail"
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px]">
                                🔍
                              </div>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No image</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => openReviewSlipModal(slip)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md shadow-xs transition-colors flex items-center gap-1 ml-auto ${
                              slip.verificationStatus === 'PENDING'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                            }`}
                          >
                            <span>🔍</span>
                            <span>{slip.verificationStatus === 'PENDING' ? 'Review & Verify' : 'View Details'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Reports ── */}
      {activeTab === 'reports' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Overview</h3>
              {financialSummary ? (
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Invoiced:</span>
                    <span className="font-semibold text-gray-900">LKR {Number(financialSummary.totalInvoiced).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Collected:</span>
                    <span className="font-semibold text-green-600">LKR {Number(financialSummary.totalCollected).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Outstanding:</span>
                    <span className="font-semibold text-red-600">LKR {Number(financialSummary.totalOutstanding).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Fully Paid Accounts:</span>
                    <span className="font-semibold text-gray-900">{financialSummary.paidAccountsCount}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Partially Paid Accounts:</span>
                    <span className="font-semibold text-gray-900">{financialSummary.partiallyPaidAccountsCount}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Unpaid / Pending Accounts:</span>
                    <span className="font-semibold text-gray-900">{financialSummary.pendingAccountsCount}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-gray-800">Overall Collection Efficiency:</span>
                    <span className="font-bold text-indigo-600 text-lg">{financialSummary.collectionRatePercentage}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No summary data available.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Collection Rate</h3>
              {financialSummary && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div
                      className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(financialSummary.collectionRatePercentage || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Target institutional benchmark: 95% collection rate per academic term.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Overdue Accounts Requiring Action</h3>
            {overdueAccounts.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No overdue accounts at this time.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Student</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Admission #</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Fee Structure</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500">Due Date</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-500">Overdue Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {overdueAccounts.map((a) => (
                      <tr key={a.id}>
                        <td className="px-4 py-2 font-medium text-gray-900">{a.studentName}</td>
                        <td className="px-4 py-2 text-gray-500 font-mono text-xs">{a.studentAdmissionNumber}</td>
                        <td className="px-4 py-2 text-gray-700">{a.feeStructure?.name}</td>
                        <td className="px-4 py-2 text-red-600">{a.dueDate}</td>
                        <td className="px-4 py-2 text-right font-bold text-red-600">
                          LKR {Number(a.balanceAmount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: Create / Edit Fee Structure ── */}
      <Modal isOpen={structureModalOpen} onClose={() => setStructureModalOpen(false)}
             title={editingStructure ? 'Edit Fee Structure' : 'Add New Fee Structure'}>
        <form onSubmit={handleStructureSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fee Structure Name *</label>
            <input type="text" required value={structureForm.name}
              onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Grade 10 Term 1 Tuition Fee" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fee Type *</label>
              <select value={structureForm.feeType}
                onChange={(e) => setStructureForm({ ...structureForm, feeType: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                {FEE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade Level</label>
              <input type="number" min="1" max="13" value={structureForm.gradeLevel}
                onChange={(e) => setStructureForm({ ...structureForm, gradeLevel: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1–13 (empty for all)" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Year *</label>
              <input type="number" required value={structureForm.academicYear}
                onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Term</label>
              <input type="number" min="1" max="3" value={structureForm.term}
                onChange={(e) => setStructureForm({ ...structureForm, term: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1–3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (LKR) *</label>
              <input type="number" step="0.01" min="0" required value={structureForm.amount}
                onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="25000.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" value={structureForm.dueDate}
                onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={structureForm.description}
              onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Notes about this fee..." />
          </div>

          <div className="flex justify-end pt-3 border-t space-x-3">
            <button type="button" onClick={() => setStructureModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Saving...' : editingStructure ? 'Update Fee' : 'Create Fee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Assign Fee to Student ── */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Fee to Student">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Student *</label>
            <select required value={assignForm.studentId}
              onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">-- Choose a Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.admissionNumber} — {s.firstName} {s.lastName} (Grade {s.currentGrade || '—'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Fee Structure *</label>
            <select required value={assignForm.feeStructureId}
              onChange={(e) => setAssignForm({ ...assignForm, feeStructureId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">-- Choose Fee Structure --</option>
              {feeStructures.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — LKR {Number(f.amount).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date (Override default)</label>
            <input type="date" value={assignForm.dueDate}
              onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Remarks</label>
            <input type="text" value={assignForm.remarks}
              onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Approved under scholarship criteria" />
          </div>

          <div className="flex justify-end pt-3 border-t space-x-3">
            <button type="button" onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Assigning...' : 'Assign Fee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Direct Counter Payment ── */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}
             title={selectedAccount ? `Record Payment — ${selectedAccount.studentName}` : 'Record Payment'}>
        {selectedAccount && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md text-xs space-y-1">
              <div><span className="font-semibold">Fee:</span> {selectedAccount.feeStructure?.name}</div>
              <div><span className="font-semibold">Total Invoiced:</span> LKR {Number(selectedAccount.totalAmount).toLocaleString()}</div>
              <div><span className="font-semibold">Current Balance:</span> <span className="font-bold text-red-600">LKR {Number(selectedAccount.balanceAmount).toLocaleString()}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (LKR) *</label>
                <input type="number" step="0.01" min="0.01" max={selectedAccount.balanceAmount} required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
                <select value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payer Name</label>
              <input type="text" value={paymentForm.paidBy}
                onChange={(e) => setPaymentForm({ ...paymentForm, paidBy: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Parent / Guardian" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reference #</label>
              <input type="text" value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. REC-001" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <input type="text" value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="flex justify-end pt-3 border-t space-x-3">
              <button type="button" onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
                {submitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL: Advanced Bank Slip Review & Verification Studio (Admin) ── */}
      <Modal
        isOpen={slipReviewModalOpen}
        onClose={() => setSlipReviewModalOpen(false)}
        maxWidth="max-w-6xl"
        title={
          selectedSlipForReview
            ? `Review Deposit Slip #${selectedSlipForReview.id} — ${selectedSlipForReview.studentName || `Student #${selectedSlipForReview.studentId}`}`
            : 'Review Payment Slip'
        }
      >
        {selectedSlipForReview && (
          <div className="space-y-4">
            {/* Header info & Carousel Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">
                  Slip #{selectedSlipForReview.id}
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                  selectedSlipForReview.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                  selectedSlipForReview.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                  'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                }`}>
                  {selectedSlipForReview.verificationStatus === 'PENDING' ? '⏳ PENDING REVIEW' : selectedSlipForReview.verificationStatus}
                </span>
                <span className="text-xs text-gray-500">
                  Submitted: {selectedSlipForReview.paymentDate ? new Date(selectedSlipForReview.paymentDate).toLocaleString() : '—'}
                </span>
              </div>

              {pendingSlips.length > 1 && selectedSlipForReview.verificationStatus === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Slip {pendingSlips.findIndex(s => s.id === selectedSlipForReview.id) + 1} of {pendingSlips.length} pending
                  </span>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => navigatePendingSlip(-1)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 font-semibold"
                      title="Previous pending slip"
                    >
                      &larr; Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => navigatePendingSlip(1)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 font-semibold"
                      title="Next pending slip"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Split Screen 2-Column Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Deep Slip Image Inspector Studio (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <span>🔍</span> Slip Image Inspector
                  </span>

                  {/* Inspector Controls */}
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Zoom Buttons */}
                    <div className="flex items-center bg-gray-100 rounded-md p-0.5 border border-gray-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setSlipZoom(prev => Math.max(0.75, prev - 0.25))}
                        className="px-2 py-1 hover:bg-gray-200 rounded font-bold"
                        title="Zoom Out"
                      >
                        –
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSlipZoom(1); setSlipRotation(0); setSlipFilter('normal'); }}
                        className="px-2 py-1 hover:bg-gray-200 rounded font-semibold text-[11px]"
                        title="Reset View"
                      >
                        {Math.round(slipZoom * 100)}%
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlipZoom(prev => Math.min(3, prev + 0.25))}
                        className="px-2 py-1 hover:bg-gray-200 rounded font-bold"
                        title="Zoom In"
                      >
                        +
                      </button>
                    </div>

                    {/* Rotation Buttons */}
                    <div className="flex items-center bg-gray-100 rounded-md p-0.5 border border-gray-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setSlipRotation(prev => (prev - 90 + 360) % 360)}
                        className="px-2 py-1 hover:bg-gray-200 rounded font-bold"
                        title="Rotate Counter-Clockwise"
                      >
                        ↺
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlipRotation(prev => (prev + 90) % 360)}
                        className="px-2 py-1 hover:bg-gray-200 rounded font-bold"
                        title="Rotate Clockwise"
                      >
                        ↻
                      </button>
                    </div>

                    {/* Contrast / Color Enhancements */}
                    <button
                      type="button"
                      onClick={() => setSlipFilter(prev => prev === 'contrast' ? 'normal' : 'contrast')}
                      className={`px-2 py-1 text-xs rounded border transition-colors font-medium ${
                        slipFilter === 'contrast'
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                      }`}
                      title="Enhance high contrast to read faint stamps or pen handwriting"
                    >
                      🌓 Contrast
                    </button>

                    {/* Lightbox / Fullscreen */}
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded font-medium"
                      title="Open in Fullscreen Lightbox"
                    >
                      ⛶ Fullscreen
                    </button>

                    {/* Download */}
                    {selectedSlipForReview.slipImageUrl && (
                      <button
                        type="button"
                        onClick={() => downloadSlipFile(selectedSlipForReview)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded font-medium"
                        title="Download slip image file"
                      >
                        ⬇ Save
                      </button>
                    )}
                  </div>
                </div>

                {/* Slip Image Viewport */}
                <div className="relative bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center min-h-[380px] max-h-[500px] border border-slate-700 shadow-inner select-none p-2">
                  {selectedSlipForReview.slipImageUrl ? (
                    <div className="overflow-auto w-full h-full flex items-center justify-center">
                      <img
                        src={resolveSlipUrl(selectedSlipForReview.slipImageUrl)}
                        alt={`Slip #${selectedSlipForReview.id}`}
                        style={{
                          transform: `scale(${slipZoom}) rotate(${slipRotation}deg)`,
                          filter: slipFilter === 'contrast'
                            ? 'contrast(160%) brightness(95%) saturate(120%)'
                            : slipFilter === 'invert'
                            ? 'invert(100%) hue-rotate(180deg)'
                            : 'none',
                          transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
                        }}
                        className="max-h-[460px] max-w-full object-contain rounded shadow-lg cursor-grab active:cursor-grabbing"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 text-slate-400">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm font-semibold">No slip image file attached with this payment</p>
                      <p className="text-xs text-slate-500 mt-1">This payment was entered without an image attachment.</p>
                    </div>
                  )}

                  {selectedSlipForReview.slipImageUrl && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      {slipRotation !== 0 && `${slipRotation}° `}
                      {slipZoom !== 1 && `${Math.round(slipZoom * 100)}% `}
                      {slipFilter === 'contrast' && 'High-Contrast'}
                    </div>
                  )}
                </div>

                {selectedSlipForReview.slipImageUrl && (
                  <div className="flex justify-between items-center text-[11px] text-gray-500 px-1">
                    <span>Tip: Use <strong>+ / –</strong> to zoom in, and <strong>↺ / ↻</strong> if image was taken sideways.</span>
                    <a
                      href={resolveSlipUrl(selectedSlipForReview.slipImageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      ↗ Open raw file in new tab
                    </a>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Verification Checklist & Account Workbench (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Student & Account Information Card */}
                <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-indigo-700 font-bold">Student Record</span>
                      <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                        {currentSlipAccount?.studentName || selectedSlipForReview.studentName || `Student #${selectedSlipForReview.studentId}`}
                      </h4>
                      <div className="text-gray-500 font-mono text-[11px]">
                        Admission: {currentSlipAccount?.studentAdmissionNumber || selectedSlipForReview.studentAdmissionNumber || `#${selectedSlipForReview.studentId}`}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                      {selectedSlipForReview.paymentMethod}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-indigo-200 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 text-[11px]">Fee Structure:</span>
                      <div className="font-semibold text-gray-800 truncate">
                        {currentSlipAccount?.feeStructure?.name || selectedSlipForReview.feeStructureName || 'Fee Account'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[11px]">Account Balance:</span>
                      <div className="font-bold text-red-600">
                        {currentSlipAccount?.balanceAmount != null
                          ? `LKR ${Number(currentSlipAccount.balanceAmount).toLocaleString()}`
                          : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claimed Payment Verification Box */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2.5 text-xs">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    Claimed Payment Verification
                  </span>

                  <div className="p-3 bg-green-50/70 border border-green-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-green-800 text-[11px] font-semibold">Amount to Verify:</span>
                      <div className="text-lg font-bold text-green-700">
                        LKR {Number(selectedSlipForReview.amountPaid).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {currentSlipAccount?.balanceAmount != null && (
                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                          Number(selectedSlipForReview.amountPaid) === Number(currentSlipAccount.balanceAmount)
                            ? 'bg-green-200 text-green-900'
                            : Number(selectedSlipForReview.amountPaid) < Number(currentSlipAccount.balanceAmount)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {Number(selectedSlipForReview.amountPaid) === Number(currentSlipAccount.balanceAmount)
                            ? '✓ Full Settlement'
                            : Number(selectedSlipForReview.amountPaid) < Number(currentSlipAccount.balanceAmount)
                            ? 'ℹ Partial Payment'
                            : '⚠️ Exceeds Balance'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Bank Reference / Voucher #:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {selectedSlipForReview.transactionReference || 'N/A'}
                        </span>
                        {selectedSlipForReview.transactionReference && (
                          <button
                            type="button"
                            onClick={() => copyReferenceToClipboard(selectedSlipForReview.transactionReference)}
                            className="text-xs px-1.5 py-0.5 bg-gray-200 hover:bg-gray-300 rounded font-medium"
                            title="Copy to clipboard"
                          >
                            {copiedRef ? '✓ Copied' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Deposited / Paid By:</span>
                      <span className="font-semibold text-gray-900">{selectedSlipForReview.paidBy || 'Parent'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Date:</span>
                      <span className="font-medium text-gray-800">
                        {selectedSlipForReview.paymentDate ? new Date(selectedSlipForReview.paymentDate).toLocaleDateString() : '—'}
                      </span>
                    </div>

                    {selectedSlipForReview.reviewedBy && (
                      <div className="flex justify-between pt-1 border-t text-[11px] text-gray-500">
                        <span>Reviewed By:</span>
                        <span className="font-semibold text-gray-700">{selectedSlipForReview.reviewedBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Remarks & Quick Presets */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Verification Notes & Remarks
                  </label>
                  
                  {/* Preset quick buttons */}
                  {selectedSlipForReview.verificationStatus === 'PENDING' && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {REMARK_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReviewRemarks(preset.text)}
                          className="px-2 py-0.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 rounded text-[10px] font-medium border border-gray-200 transition-colors"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    rows={2}
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="e.g. Bank reference verified with bank statement / Branch voucher confirmed"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">{error}</div>}

                {/* Decision Actions Bar */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSlipReviewModalOpen(false)}
                    className="px-3.5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-xs font-semibold"
                  >
                    Close
                  </button>

                  {selectedSlipForReview.verificationStatus === 'PENDING' ? (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleVerifySlip('REJECTED')}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold disabled:opacity-50 shadow-xs transition-colors flex items-center gap-1"
                      >
                        <span>❌</span>
                        <span>{submitting ? 'Rejecting...' : 'Reject Slip'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleVerifySlip('APPROVED')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold disabled:opacity-50 shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>✅</span>
                        <span>{submitting ? 'Processing...' : 'Approve & Settle Fee'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {selectedSlipForReview.receiptNumber && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const r = await api.get(`/fees/receipts/${selectedSlipForReview.receiptNumber}`);
                              if (r.data) {
                                setActiveReceipt(r.data);
                                setReceiptModalOpen(true);
                              }
                            } catch {
                              // error
                            }
                          }}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors"
                        >
                          📄 View Official Receipt
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── FULLSCREEN LIGHTBOX FOR DEEP IMAGE INSPECTION ── */}
      {isLightboxOpen && selectedSlipForReview?.slipImageUrl && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Toolbar */}
          <div className="flex justify-between items-center text-white pb-3 border-b border-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">Slip #{selectedSlipForReview.id}</span>
              <span className="text-xs text-gray-400">
                {selectedSlipForReview.studentName} • Ref: {selectedSlipForReview.transactionReference}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSlipZoom(prev => Math.max(0.75, prev - 0.25))}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold text-white"
              >
                – Zoom Out
              </button>
              <button
                type="button"
                onClick={() => setSlipZoom(1)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-white"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setSlipZoom(prev => Math.min(3.5, prev + 0.25))}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold text-white"
              >
                + Zoom In
              </button>
              <button
                type="button"
                onClick={() => setSlipRotation(prev => (prev + 90) % 360)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold text-white"
              >
                ↻ Rotate
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold text-white ml-2"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Lightbox Canvas */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <img
              src={resolveSlipUrl(selectedSlipForReview.slipImageUrl)}
              alt="Fullscreen bank slip"
              style={{
                transform: `scale(${slipZoom}) rotate(${slipRotation}deg)`,
                filter: slipFilter === 'contrast'
                  ? 'contrast(160%) brightness(95%) saturate(120%)'
                  : 'none',
                transition: 'transform 0.15s ease-out',
              }}
              className="max-h-[85vh] max-w-full object-contain rounded shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ── MODAL: Official Payment Receipt ── */}
      <Modal isOpen={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Official Payment Receipt">
        {activeReceipt && (
          <div className="space-y-4">
            <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50/30 text-center">
              <div className="text-xs uppercase tracking-wider text-gray-500">Wycherley International School</div>
              <h4 className="text-lg font-bold text-gray-900 mt-1">Official Payment Receipt</h4>
              <div className="font-mono text-xs font-semibold text-indigo-700 mt-1">
                Receipt #{activeReceipt.receiptNumber}
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-b py-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Student Name:</span>
                <span className="font-semibold text-gray-900">{activeReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Admission Number:</span>
                <span className="font-mono text-gray-900">{activeReceipt.studentAdmissionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fee Purpose:</span>
                <span className="font-medium text-gray-900">{activeReceipt.feeStructureName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-green-700 text-base">LKR {Number(activeReceipt.amountPaid).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Remaining Balance:</span>
                <span className="font-semibold text-red-600">LKR {Number(activeReceipt.remainingBalance).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 pt-2 border-t">
                <span>Issued: {new Date(activeReceipt.issuedDate || Date.now()).toLocaleDateString()}</span>
                <span>Counter: {activeReceipt.issuedBy || 'Cashier'}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium"
              >
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Fees;
