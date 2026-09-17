import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../api/axios';

const FEE_TYPES = ['TUITION', 'FACILITY', 'EXAMINATION', 'LIBRARY', 'ADMISSION', 'TRANSPORT', 'ACTIVITY', 'OTHER'];
const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'BANK_DEPOSIT', 'CHEQUE'];

const Fees = () => {
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'reports'

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

  /* ─── Data Loading ─── */
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [structRes, accRes, studRes, sumRes, ovRes] = await Promise.all([
        api.get('/fees/structures').catch(() => ({ data: [] })),
        api.get('/fees/accounts').catch(() => ({ data: [] })),
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/fees/reports/summary').catch(() => ({ data: null })),
        api.get('/fees/reports/overdue').catch(() => ({ data: [] })),
      ]);
      setFeeStructures(Array.isArray(structRes.data) ? structRes.data : []);
      setStudentAccounts(Array.isArray(accRes.data) ? accRes.data : []);
      setStudents(Array.isArray(studRes.data) ? studRes.data : []);
      setFinancialSummary(sumRes.data);
      setOverdueAccounts(Array.isArray(ovRes.data) ? ovRes.data : []);
    } catch {
      setError('Failed to load fee data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const flash = (msg) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 4000); };
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

  const cancelAccount = async (acc) => {
    if (!window.confirm(`Cancel fee account #${acc.id} for ${acc.studentName}?`)) return;
    try {
      await api.delete(`/fees/accounts/${acc.id}`);
      flash(`Fee account #${acc.id} cancelled.`);
      fetchAll();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  /* ─── Payment & Receipt Generation ─── */
  const openPaymentModal = (account) => {
    setSelectedAccount(account);
    setPaymentForm({
      ...emptyPaymentForm,
      amount: account?.balanceAmount || '',
      paidBy: account?.studentName || '',
    });
    setError('');
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setSubmitting(true); setError('');
    try {
      const res = await api.post('/fees/payments/record-direct', {
        feeAccountId: selectedAccount.id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference.trim() || `REC-${Date.now()}`,
        paidBy: paymentForm.paidBy.trim() || 'Parent/Student',
        recordedBy: 'Admin Counter',
        notes: paymentForm.notes.trim() || 'Counter payment',
      });
      
      flash(`Payment recorded successfully! Generating receipt...`);
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
      if (res.data && res.data.length > 0) {
        setActiveReceipt(res.data[0]);
        setReceiptModalOpen(true);
      } else {
        setError('No issued receipts found for this student.');
      }
    } catch {
      setError('Could not retrieve receipt information.');
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fee & Payment Management</h2>
          <p className="text-sm text-gray-500 mt-1">Configure institutional fees, record student payments, track arrears, and generate receipts</p>
        </div>
        <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'accounts' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Accounts & Structures
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'
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
          {/* Quick Metrics Bar */}
          {financialSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Total Billed</span>
                <p className="text-xl font-bold text-gray-800 mt-1">LKR {Number(financialSummary.totalInvoiced).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Total Collected</span>
                <p className="text-xl font-bold text-green-600 mt-1">LKR {Number(financialSummary.totalCollected).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Total Outstanding</span>
                <p className="text-xl font-bold text-red-600 mt-1">LKR {Number(financialSummary.totalOutstanding).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <span className="text-xs font-semibold uppercase text-gray-400">Collection Rate</span>
                <p className="text-xl font-bold text-indigo-600 mt-1">{financialSummary.collectionRatePercentage}%</p>
              </div>
            </div>
          )}

          {/* Fee Structures */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
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
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Student Fee Accounts</h3>
              <div className="flex space-x-3">
                <input
                  type="text" placeholder="Search student or fee..."
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-60 focus:ring-indigo-500 focus:border-indigo-500"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={openAssignModal} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
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

      {/* ── TAB 2: Financial Reports & Summaries ── */}
      {activeTab === 'reports' && financialSummary && (
        <div className="space-y-8">
          {/* Detailed Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <span className="text-xs font-semibold uppercase text-gray-400">Total Billed</span>
              <p className="text-2xl font-bold text-gray-800 mt-1">LKR {Number(financialSummary.totalInvoiced).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <span className="text-xs font-semibold uppercase text-gray-400">Total Collected</span>
              <p className="text-2xl font-bold text-green-600 mt-1">LKR {Number(financialSummary.totalCollected).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <span className="text-xs font-semibold uppercase text-gray-400">Arrears / Outstanding</span>
              <p className="text-2xl font-bold text-red-600 mt-1">LKR {Number(financialSummary.totalOutstanding).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <span className="text-xs font-semibold uppercase text-gray-400">Recovery Efficiency</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{financialSummary.collectionRatePercentage}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <span className="text-xs font-semibold uppercase text-gray-400">Overdue Accounts</span>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{financialSummary.overdueAccountsCount}</p>
            </div>
          </div>

          {/* Fee Type Breakdown Table */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown by Fee Category</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Invoiced</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collection Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(financialSummary.feeTypeBreakdowns || []).map((fb) => (
                    <tr key={fb.feeType} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{fb.feeType}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">LKR {Number(fb.totalInvoiced).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">LKR {Number(fb.totalCollected).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">LKR {Number(fb.totalOutstanding).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-indigo-600">{fb.collectionPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grade-Level Breakdown Table */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Grade-Wise Collection Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade Level</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Enrolled Accounts</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoiced Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Arrears</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recovery %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(financialSummary.gradeBreakdowns || []).map((gb) => (
                    <tr key={gb.gradeLevel} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-indigo-700">Grade {gb.gradeLevel}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">{gb.totalAccounts}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">LKR {Number(gb.totalInvoiced).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">LKR {Number(gb.totalCollected).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">LKR {Number(gb.totalOutstanding).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-indigo-600">{gb.collectionPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Create / Edit Fee Structure ── */}
      <Modal isOpen={structureModalOpen} onClose={() => setStructureModalOpen(false)}
             title={editingStructure ? `Edit: ${editingStructure.name}` : 'Create Fee Structure'}>
        <form onSubmit={handleStructureSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
            <input type="text" required value={structureForm.name}
              onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Grade 10 Tuition Fee" />
          </div>

          {!editingStructure && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fee Type <span className="text-red-500">*</span></label>
                  <select value={structureForm.feeType}
                    onChange={(e) => setStructureForm({ ...structureForm, feeType: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade Level</label>
                  <input type="number" min="1" max="13" value={structureForm.gradeLevel}
                    onChange={(e) => setStructureForm({ ...structureForm, gradeLevel: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year <span className="text-red-500">*</span></label>
                  <input type="number" required min="2020" max="2030" value={structureForm.academicYear}
                    onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Term</label>
                  <select value={structureForm.term}
                    onChange={(e) => setStructureForm({ ...structureForm, term: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">— All Terms —</option>
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                    <option value="3">Term 3</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (LKR) <span className="text-red-500">*</span></label>
            <input type="number" step="0.01" min="0.01" required value={structureForm.amount}
              onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="5000.00" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input type="date" value={structureForm.dueDate}
              onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea rows={2} value={structureForm.description}
              onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional description..." />
          </div>

          <div className="flex justify-end pt-3 border-t space-x-3">
            <button type="button" onClick={() => setStructureModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Saving...' : editingStructure ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Assign Fee ── */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Fee to Student">
        <form onSubmit={handleAssignSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student <span className="text-red-500">*</span></label>
            <select required value={assignForm.studentId}
              onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">— Select Student —</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.admissionNumber} — {s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fee Structure <span className="text-red-500">*</span></label>
            <select required value={assignForm.feeStructureId}
              onChange={(e) => setAssignForm({ ...assignForm, feeStructureId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">— Select Fee —</option>
              {feeStructures.map(f => (
                <option key={f.id} value={f.id}>{f.name} — LKR {Number(f.amount).toLocaleString()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input type="date" value={assignForm.dueDate}
              onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Remarks</label>
            <input type="text" value={assignForm.remarks}
              onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional remarks" />
          </div>

          <div className="flex justify-end pt-3 border-t space-x-3">
            <button type="button" onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Assigning...' : 'Assign Fee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Payment ── */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)}
             title={selectedAccount ? `Record Payment — ${selectedAccount.studentName}` : 'Record Payment'}>
        {selectedAccount && (
          <form onSubmit={handlePaymentSubmit} className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-md text-xs space-y-1">
              <div><span className="font-semibold">Student:</span> {selectedAccount.studentName}</div>
              <div><span className="font-semibold">Fee:</span> {selectedAccount.feeStructure?.name || '—'}</div>
              <div><span className="font-semibold">Outstanding:</span> LKR {Number(selectedAccount.balanceAmount).toLocaleString()}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (LKR) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0.01" max={selectedAccount.balanceAmount} required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method <span className="text-red-500">*</span></label>
              <select value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
              </select>
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
