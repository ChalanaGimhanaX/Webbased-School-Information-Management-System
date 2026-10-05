import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';

const BANK_METHODS = ['BANK_TRANSFER', 'ONLINE_BANKING', 'CDM_DEPOSIT', 'CHEQUE'];

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

  // View-slip modal state
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
        // Fallback for demo seed
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
      PAID: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
      PARTIAL: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30',
      PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
      OVERDUE: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30',
      CANCELLED: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30',
    };
    return (
      <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${map[status] || 'bg-surface-container-high text-on-surface-variant'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">My Children's Fee Accounts</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          View assigned fees for your children. You can pay by cash at the office or upload a bank transfer slip for online review.
        </p>
      </div>

      {error && <div className="p-4 bg-error-container text-on-error-container border border-error/30 rounded-xl text-sm font-medium">{error}</div>}
      {success && <div className="p-4 bg-tertiary-fixed/60 text-on-tertiary-fixed border border-tertiary/30 rounded-xl text-sm font-medium">{success}</div>}

      {loading ? (
        <div className="py-16 text-center text-on-surface-variant text-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <div>Loading your children's fee records...</div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-14 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs">
          <p className="font-bold text-on-surface text-base">No fee accounts found</p>
          <p className="text-sm mt-1">Your children have no fees assigned yet. Please contact the school office.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([studentName, { admNo, fees }]) => (
            <div key={studentName} className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/40 overflow-hidden">
              {/* Student Header */}
              <div className="px-6 py-4 bg-primary-fixed/25 dark:bg-slate-800/90 border-b border-outline-variant/40 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-on-surface">{studentName}</div>
                  <div className="text-xs text-primary dark:text-indigo-300 font-semibold mt-0.5">Admission No: {admNo}</div>
                </div>
                <button
                  type="button"
                  onClick={() => viewMySlips(fees[0]?.studentId)}
                  className="text-xs font-semibold px-3 py-1.5 bg-surface-container-lowest dark:bg-slate-700 text-primary dark:text-indigo-200 hover:text-primary-container dark:hover:text-white rounded-lg border border-outline-variant/60 dark:border-white/20 shadow-xs transition-colors"
                >
                  View Payment History
                </button>
              </div>

              {/* Fee Rows */}
              <div className="divide-y divide-outline-variant/20">
                {fees.map(acct => (
                  <div key={acct.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-surface-container-low/40 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-on-surface text-sm">
                          {acct.feeStructure?.name || `Fee #${acct.id}`}
                        </span>
                        <StatusBadge status={acct.status} />
                      </div>
                      <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-on-surface-variant">
                        <span>Total: <strong className="text-on-surface font-semibold">LKR {Number(acct.totalAmount || 0).toLocaleString()}</strong></span>
                        <span>Paid: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">LKR {Number(acct.paidAmount || 0).toLocaleString()}</strong></span>
                        <span>Balance: <strong className="text-rose-600 dark:text-rose-400 font-semibold">LKR {Number(acct.balanceAmount || 0).toLocaleString()}</strong></span>
                        {acct.dueDate && <span>Due: <strong className="text-on-surface font-semibold">{acct.dueDate}</strong></span>}
                      </div>
                      {acct.feeStructure?.feeType && (
                        <div className="mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
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
                          className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-300/40 rounded-lg transition-colors"
                        >
                          💵 Pay Cash
                        </button>
                        <button
                          onClick={() => openSlipModal(acct)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-primary-fixed/30 dark:bg-primary-fixed/20 text-primary dark:text-indigo-300 hover:bg-primary-fixed/50 border border-primary/20 rounded-lg transition-colors"
                        >
                          🏦 Upload Bank Slip
                        </button>
                      </div>
                    )}
                    {acct.status === 'PAID' && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0">✅ Fully Settled</span>
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
            <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-lg text-sm space-y-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300">📋 Cash Payment Instructions</p>
              <p className="text-amber-700 dark:text-amber-200/90 text-xs">
                Clicking &quot;Confirm&quot; will notify the school that you intend to pay in cash.
                Please visit the school cashier with the full amount to receive your official printed receipt.
              </p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
              <div><span className="font-semibold text-on-surface">Student:</span> <span className="text-on-surface-variant">{selectedAccount.studentName}</span></div>
              <div><span className="font-semibold text-on-surface">Fee:</span> <span className="text-on-surface-variant">{selectedAccount.feeStructure?.name}</span></div>
              <div><span className="font-semibold text-on-surface">Amount Due:</span> <strong className="text-rose-600 dark:text-rose-400">LKR {Number(selectedAccount.balanceAmount).toLocaleString()}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Your Name <span className="text-error">*</span>
              </label>
              <input type="text" required value={cashForm.paidBy}
                onChange={e => setCashForm({ ...cashForm, paidBy: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
                placeholder="Father / Mother name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Notes
              </label>
              <input type="text" value={cashForm.notes}
                onChange={e => setCashForm({ ...cashForm, notes: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
                placeholder="Any notes (optional)" />
            </div>

            {error && <p className="text-error text-xs font-medium">{error}</p>}

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
              <button type="button" onClick={() => setCashModalOpen(false)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container text-sm font-medium">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium disabled:opacity-50">
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
            <div className="p-3 bg-primary-fixed/20 border border-primary/30 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-primary dark:text-indigo-300">🏦 Bank Transfer Instructions</p>
              <p className="text-on-surface-variant">
                Transfer the amount to the school&apos;s bank account, then submit your transaction details below.
                Academic finance administration will review and confirm your payment within 1–2 business days.
              </p>
              <div className="mt-2 p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/40 text-[11px] font-mono space-y-0.5 text-on-surface">
                <div>Bank: <strong>Bank of Ceylon</strong></div>
                <div>Branch: <strong>Gampaha Metro</strong></div>
                <div>Account: <strong>00891015099</strong></div>
                <div>Account Name: <strong>Wycherley International School</strong></div>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
              <div><span className="font-semibold text-on-surface">Student:</span> <span className="text-on-surface-variant">{selectedAccount.studentName}</span></div>
              <div><span className="font-semibold text-on-surface">Fee:</span> <span className="text-on-surface-variant">{selectedAccount.feeStructure?.name}</span></div>
              <div><span className="font-semibold text-on-surface">Outstanding Balance:</span> <strong className="text-rose-600 dark:text-rose-400">LKR {Number(selectedAccount.balanceAmount).toLocaleString()}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Amount Paid (LKR) <span className="text-error">*</span>
                </label>
                <input type="number" step="0.01" min="0.01" max={selectedAccount.balanceAmount} required
                  value={slipForm.amount}
                  onChange={e => setSlipForm({ ...slipForm, amount: e.target.value })}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Payment Method <span className="text-error">*</span>
                </label>
                <select value={slipForm.paymentMethod}
                  onChange={e => setSlipForm({ ...slipForm, paymentMethod: e.target.value })}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary">
                  {BANK_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Bank Reference / Transaction ID <span className="text-error">*</span>
              </label>
              <input type="text" required value={slipForm.transactionReference}
                onChange={e => setSlipForm({ ...slipForm, transactionReference: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
                placeholder="e.g. TXN-20261003-001234" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Your Name <span className="text-error">*</span>
              </label>
              <input type="text" required value={slipForm.paidBy}
                onChange={e => setSlipForm({ ...slipForm, paidBy: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
                placeholder="Father / Mother name" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Payment Slip Image URL / File Reference <span className="text-error">*</span>
              </label>
              <input type="text" required value={slipForm.slipImageUrl}
                onChange={e => setSlipForm({ ...slipForm, slipImageUrl: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
                placeholder="e.g. https://... or slip-kasun-oct2026.jpg" />
              <p className="text-[11px] text-on-surface-variant mt-1">
                Enter the file name of your uploaded slip or a direct URL to the deposit receipt.
              </p>
            </div>

            {error && <p className="text-error text-xs font-medium">{error}</p>}

            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
              <button type="button" onClick={() => setSlipModalOpen(false)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container text-sm font-medium">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-5 py-2 bg-primary-container text-on-primary rounded-lg hover:bg-primary text-sm font-medium disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Slip for Review'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL: Payment History ── */}
      <Modal isOpen={viewSlipsModalOpen} onClose={() => setViewSlipsModalOpen(false)} title="My Payment History">
        {childSlips.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">No payment history found for this student.</p>
        ) : (
          <div className="space-y-3">
            {childSlips.map(slip => (
              <div key={slip.id} className="p-3.5 border border-outline-variant/40 bg-surface-container-low/40 rounded-xl text-sm space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-on-surface">LKR {Number(slip.amountPaid || 0).toLocaleString()}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    slip.verificationStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                    slip.verificationStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300' :
                    slip.verificationStatus === 'CANCELLED' ? 'bg-surface-container-high text-on-surface-variant' :
                    'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}>{slip.verificationStatus}</span>
                </div>
                <div className="text-xs text-on-surface-variant">Method: {(slip.paymentMethod || '').replace(/_/g, ' ')}</div>
                <div className="text-xs text-on-surface-variant font-mono">Reference: {slip.transactionReference}</div>
                {slip.reviewRemarks && <div className="text-xs text-on-surface-variant italic">Note: {slip.reviewRemarks}</div>}
                {slip.slipImageUrl && (
                  <a href={slip.slipImageUrl} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-primary font-semibold underline inline-block mt-1">View Slip Image</a>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end pt-4 border-t border-outline-variant/30 mt-4">
          <button onClick={() => setViewSlipsModalOpen(false)}
            className="px-5 py-2 bg-primary-container text-on-primary rounded-lg text-sm font-medium hover:bg-primary transition-colors">Close</button>
        </div>
      </Modal>
    </div>
  );
}
