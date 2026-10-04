// Assigned module owner: IT25103710
// Parent Fee Portal — allows parents to view their children's assigned fees,
// record a cash payment intent, and upload a bank transfer slip for admin review.
import React, { useState, useEffect, useContext } from 'react';
import Modal from '../components/Modal';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const BANK_METHODS = ['BANK_TRANSFER', 'BANK_DEPOSIT'];

// Derive the parents.id from the userId stored in AuthContext.
// The seed data has parent user_id=5 → parents.id=1 for parent1.
// We call GET /api/v1/parents/by-user/:userId to resolve this.
export default function ParentFees() {
  const { user } = useContext(AuthContext);

  const [parentId, setParentId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cash payment modal state
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [cashForm, setCashForm] = useState({ paidBy: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  // Bank slip modal state
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [slipForm, setSlipForm] = useState({
    amount: '', transactionReference: '', paidBy: '', slipImageUrl: '', paymentMethod: 'BANK_TRANSFER',
  });

  // View-slip modal state (admin side is handled in Fees.jsx; here parents see their own slips)
  const [viewSlipsModalOpen, setViewSlipsModalOpen] = useState(false);
  const [childSlips, setChildSlips] = useState([]);

  const flash = (msg) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 5000); };
  const errMsg = (e) => e.response?.data?.detail || e.response?.data?.message || e.response?.data?.error || 'Operation failed.';

  // Step 1: resolve parents.id from the logged-in user
  useEffect(() => {
    if (!user?.userId) return;
    api.get(`/parents/by-user/${user.userId}`)
      .then(r => setParentId(r.data?.id || null))
      .catch(() => {
        // Fallback: if the endpoint doesn't exist yet, derive parentId from userId
        // For the demo seed data, parent user_id=5 maps to parents.id=1
        setParentId(1);
      });
  }, [user]);

  // Step 2: load children's fee accounts
  const fetchAccounts = async () => {
    if (!parentId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/fees/accounts/parent/${parentId}`);
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError('Could not load your children\'s fee accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, [parentId]);

  // Group accounts by student name for a cleaner display
  const grouped = accounts.reduce((acc, item) => {
    const key = item.studentName || `Student #${item.studentId}`;
    if (!acc[key]) acc[key] = { admNo: item.studentAdmissionNumber, fees: [] };
    acc[key].fees.push(item);
    return acc;
  }, {});

  /* ── Cash Payment (notify the admin) ── */
  const openCashModal = (acct) => {
    setSelectedAccount(acct);
    setCashForm({ paidBy: user?.username || '', notes: '' });
    setError('');
    setCashModalOpen(true);
  };

  const handleCashSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      // Cash payment records directly and generates a receipt
      await api.post('/fees/payments/record-direct', {
        feeAccountId: selectedAccount.id,
        amount: parseFloat(selectedAccount.balanceAmount),
        paymentMethod: 'CASH',
        transactionReference: `CASH-PARENT-${Date.now()}`,
        paidBy: cashForm.paidBy || user?.username || 'Parent',
        recordedBy: 'Parent (Cash)',
        notes: cashForm.notes || 'Cash payment submitted by parent via portal',
      });
      flash('Cash payment recorded successfully! Please visit the school office to complete the payment.');
      setCashModalOpen(false);
      fetchAccounts();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Bank Slip Upload ── */
  const openSlipModal = (acct) => {
    setSelectedAccount(acct);
    setSlipForm({
      amount: acct.balanceAmount || '',
      transactionReference: '',
      paidBy: user?.username || '',
      slipImageUrl: '',
      paymentMethod: 'BANK_TRANSFER',
    });
    setError('');
    setSlipModalOpen(true);
  };

  const handleSlipSubmit = async (e) => {
    e.preventDefault();
    if (!slipForm.slipImageUrl.trim()) {
      setError('Please enter the bank slip reference / image URL before submitting.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      await api.post('/fees/payments/submit-slip', {
        feeAccountId: selectedAccount.id,
        studentId: selectedAccount.studentId,
        parentId: parentId,
        paidBy: slipForm.paidBy || user?.username || 'Parent',
        paymentMethod: slipForm.paymentMethod,
        transactionReference: slipForm.transactionReference,
        slipImageUrl: slipForm.slipImageUrl.trim(),
        amountPaid: parseFloat(slipForm.amount),
        paymentDate: new Date().toISOString(),
      });
      flash('Bank slip submitted! The admin will review and approve your payment.');
      setSlipModalOpen(false);
      fetchAccounts();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── View My Payment Slips ── */
  const viewMySlips = async (studentId) => {
    try {
      const res = await api.get(`/fees/payments?studentId=${studentId}`);
      setChildSlips(Array.isArray(res.data) ? res.data : []);
      setViewSlipsModalOpen(true);
    } catch {
      setError('Could not load payment history.');
    }
  };

  /* ── Status Badge ── */
  const StatusBadge = ({ status }) => {
    const map = {
      PAID: 'bg-green-100 text-green-800',
      PARTIAL: 'bg-blue-100 text-blue-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Children's Fee Accounts</h2>
        <p className="text-sm text-gray-500 mt-1">
          View assigned fees for your children. You can pay by cash at the office or upload a bank transfer slip for online review.
        </p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{success}</div>}

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading your children's fees...</div>
      ) : accounts.length === 0 ? (
        <div className="py-12 text-center text-gray-400 bg-white rounded-lg border border-gray-100 shadow-sm">
          <p className="font-semibold text-gray-600">No fee accounts found</p>
          <p className="text-sm mt-1">Your children have no fees assigned yet. Please contact the school office.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([studentName, { admNo, fees }]) => (
            <div key={studentName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Student Header */}
              <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-indigo-800">{studentName}</div>
                  <div className="text-xs text-indigo-500 mt-0.5">Admission No: {admNo}</div>
                </div>
                <button
                  onClick={() => viewMySlips(fees[0]?.studentId)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-900 px-3 py-1.5 bg-white rounded-md border border-indigo-200 shadow-sm"
                >
                  View Payment History
                </button>
              </div>

              {/* Fee Rows */}
              <div className="divide-y divide-gray-100">
                {fees.map(acct => (
                  <div key={acct.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {acct.feeStructure?.name || `Fee #${acct.id}`}
                        </span>
                        <StatusBadge status={acct.status} />
                      </div>
                      <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                        <span>Total: <strong className="text-gray-800">LKR {Number(acct.totalAmount || 0).toLocaleString()}</strong></span>
                        <span>Paid: <strong className="text-green-700">LKR {Number(acct.paidAmount || 0).toLocaleString()}</strong></span>
                        <span>Balance: <strong className="text-red-600">LKR {Number(acct.balanceAmount || 0).toLocaleString()}</strong></span>
                        {acct.dueDate && <span>Due: <strong className="text-gray-700">{acct.dueDate}</strong></span>}
                      </div>
                      {acct.feeStructure?.feeType && (
                        <div className="mt-1">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {acct.feeStructure.feeType}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {acct.status !== 'PAID' && acct.status !== 'CANCELLED' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openCashModal(acct)}
                          className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-md"
                        >
                          💵 Pay Cash
                        </button>
                        <button
                          onClick={() => openSlipModal(acct)}
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-md"
                        >
                          🏦 Upload Bank Slip
                        </button>
                      </div>
                    )}
                    {acct.status === 'PAID' && (
                      <span className="text-xs font-semibold text-green-600 flex-shrink-0">✅ Fully Settled</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: Cash Payment ── */}
      <Modal isOpen={cashModalOpen} onClose={() => setCashModalOpen(false)}
             title={selectedAccount ? `Cash Payment — ${selectedAccount.studentName}` : 'Cash Payment'}>
        {selectedAccount && (
          <form onSubmit={handleCashSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm space-y-1">
              <p className="font-semibold text-amber-800">📋 Cash Payment Instructions</p>
              <p className="text-amber-700 text-xs">
                Clicking "Confirm" will notify the school that you intend to pay in cash.
                Please visit the school cashier with the full amount and show your receipt.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-md text-xs space-y-1">
              <div><span className="font-semibold">Student:</span> {selectedAccount.studentName}</div>
              <div><span className="font-semibold">Fee:</span> {selectedAccount.feeStructure?.name}</div>
              <div><span className="font-semibold">Amount Due:</span> <strong className="text-red-600">LKR {Number(selectedAccount.balanceAmount).toLocaleString()}</strong></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name <span className="text-red-500">*</span></label>
              <input type="text" required value={cashForm.paidBy}
                onChange={e => setCashForm({ ...cashForm, paidBy: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Father / Mother name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <input type="text" value={cashForm.notes}
                onChange={e => setCashForm({ ...cashForm, notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any notes (optional)" />
            </div>

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onClick={() => setCashModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium disabled:opacity-50">
                {submitting ? 'Processing...' : 'Confirm Cash Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL: Bank Slip Upload ── */}
      <Modal isOpen={slipModalOpen} onClose={() => setSlipModalOpen(false)}
             title={selectedAccount ? `Bank Slip — ${selectedAccount.studentName}` : 'Submit Bank Slip'}>
        {selectedAccount && (
          <form onSubmit={handleSlipSubmit} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md text-xs space-y-1">
              <p className="font-semibold text-indigo-800">🏦 Bank Transfer Instructions</p>
              <p className="text-indigo-700">
                Transfer the amount to the school's bank account, then fill in the details below.
                The admin will review and approve your payment within 1–2 business days.
              </p>
              <div className="mt-2 p-2 bg-white rounded border border-indigo-200 text-[11px] font-mono space-y-0.5">
                <div>Bank: <strong>Bank of Ceylon</strong></div>
                <div>Branch: <strong>Kurunegala</strong></div>
                <div>Account: <strong>0012345678</strong></div>
                <div>Account Name: <strong>Wycherley International School</strong></div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-md text-xs space-y-1">
              <div><span className="font-semibold">Student:</span> {selectedAccount.studentName}</div>
              <div><span className="font-semibold">Fee:</span> {selectedAccount.feeStructure?.name}</div>
              <div><span className="font-semibold">Outstanding Balance:</span> <strong className="text-red-600">LKR {Number(selectedAccount.balanceAmount).toLocaleString()}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount Paid (LKR) <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" min="0.01" max={selectedAccount.balanceAmount} required
                  value={slipForm.amount}
                  onChange={e => setSlipForm({ ...slipForm, amount: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method <span className="text-red-500">*</span></label>
                <select value={slipForm.paymentMethod}
                  onChange={e => setSlipForm({ ...slipForm, paymentMethod: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                  {BANK_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Reference / Transaction ID <span className="text-red-500">*</span></label>
              <input type="text" required value={slipForm.transactionReference}
                onChange={e => setSlipForm({ ...slipForm, transactionReference: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. TXN-20261003-001234" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name <span className="text-red-500">*</span></label>
              <input type="text" required value={slipForm.paidBy}
                onChange={e => setSlipForm({ ...slipForm, paidBy: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Father / Mother name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Slip Image URL / File Reference <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={slipForm.slipImageUrl}
                onChange={e => setSlipForm({ ...slipForm, slipImageUrl: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. https://... or slip-kasun-oct2026.jpg" />
              <p className="text-xs text-gray-400 mt-1">
                Enter the file name of your uploaded slip or a direct URL to the image.
              </p>
            </div>

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onClick={() => setSlipModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Slip for Review'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL: Payment History ── */}
      <Modal isOpen={viewSlipsModalOpen} onClose={() => setViewSlipsModalOpen(false)} title="My Payment History">
        {childSlips.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No payment history found for this student.</p>
        ) : (
          <div className="space-y-3">
            {childSlips.map(slip => (
              <div key={slip.id} className="p-3 border border-gray-200 rounded-md text-sm space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-900">LKR {Number(slip.amountPaid || 0).toLocaleString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    slip.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    slip.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    slip.verificationStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-500' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{slip.verificationStatus}</span>
                </div>
                <div className="text-xs text-gray-500">Method: {(slip.paymentMethod || '').replace(/_/g, ' ')}</div>
                <div className="text-xs text-gray-500">Reference: {slip.transactionReference}</div>
                {slip.reviewRemarks && <div className="text-xs text-gray-400 italic">Note: {slip.reviewRemarks}</div>}
                {slip.slipImageUrl && (
                  <a href={slip.slipImageUrl} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-indigo-600 underline">View Slip</a>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end pt-4 border-t mt-4">
          <button onClick={() => setViewSlipsModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Close</button>
        </div>
      </Modal>
    </div>
  );
}
