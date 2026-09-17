import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../api/axios';

const Fees = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [studentAccounts, setStudentAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialPaymentForm = {
    amount: '',
    paymentMethod: 'CASH',
    transactionReference: '',
    paidBy: '',
    notes: '',
  };
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError('');
      const [structRes, accRes] = await Promise.all([
        api.get('/fees/structures').catch(() => ({ data: [] })),
        api.get('/fees/accounts').catch(() => ({ data: [] })),
      ]);
      setFeeStructures(structRes.data || []);
      setStudentAccounts(accRes.data || []);
    } catch (err) {
      console.error('Failed to load fee data:', err);
      setError('Failed to load fee information from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const openPaymentModal = (account) => {
    setSelectedAccount(account);
    setPaymentForm({
      ...initialPaymentForm,
      amount: account?.balanceAmount || '',
      paidBy: account?.studentName || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        feeAccountId: selectedAccount.id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference.trim() || `REC-${Date.now()}`,
        paidBy: paymentForm.paidBy.trim() || 'Parent/Student',
        recordedBy: 'Admin Counter',
        notes: paymentForm.notes.trim() || 'Over-the-counter settlement',
      };

      await api.post('/fees/payments/record-direct', payload);
      setSuccess(`Payment of LKR ${paymentForm.amount} recorded successfully for account #${selectedAccount.id}!`);
      setIsModalOpen(false);
      fetchFeeData();
    } catch (err) {
      console.error('Failed to record payment:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to record payment.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const columnsStruct = [
    { header: 'ID', accessor: 'id' },
    { header: 'Fee Name', accessor: 'feeName' },
    { header: 'Type', accessor: 'feeType' },
    { header: 'Grade', cell: (r) => (r.gradeLevel ? `Grade ${r.gradeLevel}` : 'All Grades') },
    { header: 'Year', accessor: 'academicYear' },
    {
      header: 'Amount',
      cell: (r) => <span className="font-semibold text-gray-900">LKR {Number(r.amount).toLocaleString()}</span>,
    },
  ];

  const columnsAccounts = [
    { header: 'Account #', accessor: 'id' },
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.studentName || `Student #${row.studentId}`}</div>
          <div className="text-xs text-gray-400">Adm: {row.admissionNumber || `ID: ${row.studentId}`}</div>
        </div>
      ),
    },
    { header: 'Fee Type', accessor: 'feeStructureName' },
    {
      header: 'Total Fee',
      cell: (row) => `LKR ${Number(row.totalAmount || 0).toLocaleString()}`,
    },
    {
      header: 'Paid',
      cell: (row) => <span className="text-green-600 font-medium">LKR {Number(row.paidAmount || 0).toLocaleString()}</span>,
    },
    {
      header: 'Balance',
      cell: (row) => <span className="text-red-600 font-semibold">LKR {Number(row.balanceAmount || 0).toLocaleString()}</span>,
    },
    {
      header: 'Status',
      cell: (row) => {
        const s = row.paymentStatus || row.status;
        if (s === 'PAID') {
          return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Paid</span>;
        } else if (s === 'PARTIALLY_PAID') {
          return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">Partial</span>;
        }
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => openPaymentModal(row)}
          disabled={row.balanceAmount <= 0}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {row.balanceAmount <= 0 ? 'Settled' : 'Pay Counter'}
        </button>
      ),
    },
  ];

  const filteredAccounts = studentAccounts.filter((acc) => {
    const term = search.toLowerCase();
    const sName = (acc.studentName || '').toLowerCase();
    const adm = (acc.admissionNumber || '').toLowerCase();
    const fName = (acc.feeStructureName || '').toLowerCase();
    return sName.includes(term) || adm.includes(term) || fName.includes(term);
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Fee & Payment Management</h2>
        <p className="text-sm text-gray-500 mt-1">Configure institutional fee structures and record student account payments</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Official Fee Structures</h3>
          {loading ? (
            <div className="py-6 text-center text-gray-500">Loading fee structures...</div>
          ) : (
            <DataTable columns={columnsStruct} data={feeStructures} />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Student Fee Accounts</h3>
            <input
              type="text"
              placeholder="Search by student name or fee..."
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-72 focus:ring-indigo-500 focus:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="py-6 text-center text-gray-500">Loading student accounts...</div>
          ) : (
            <DataTable columns={columnsAccounts} data={filteredAccounts} />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAccount ? `Record Payment - Account #${selectedAccount.id}` : 'Record Payment'}
      >
        {selectedAccount && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md text-xs space-y-1">
              <div><span className="font-semibold text-gray-700">Student:</span> {selectedAccount.studentName}</div>
              <div><span className="font-semibold text-gray-700">Fee:</span> {selectedAccount.feeStructureName}</div>
              <div><span className="font-semibold text-gray-700">Outstanding Balance:</span> LKR {Number(selectedAccount.balanceAmount).toLocaleString()}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount to Pay (LKR) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={selectedAccount.balanceAmount}
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method <span className="text-red-500">*</span></label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="CASH">Cash Counter</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="BANK_DEPOSIT">Bank Deposit</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payer Name</label>
              <input
                type="text"
                placeholder="Parent / Guardian Name"
                value={paymentForm.paidBy}
                onChange={(e) => setPaymentForm({ ...paymentForm, paidBy: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction / Reference #</label>
              <input
                type="text"
                placeholder="e.g. REC-99201"
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Fees;
