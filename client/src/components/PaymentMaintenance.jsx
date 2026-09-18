// Assigned module owner: IT25103710
import { useEffect, useState } from 'react';
import api from '../api/axios';
import RecordMaintenance from './RecordMaintenance';

export default function PaymentMaintenance({ accounts, refreshAccounts }) {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    let cancelled = false;
    api.get('/fees/payments').then(r => { if (!cancelled) setPayments(r.data); }).catch(() => { if (!cancelled) setError('Could not load payment history'); });
    return () => { cancelled = true; };
  }, [accounts]);
  const reload = async () => { setPayments((await api.get('/fees/payments')).data); await refreshAccounts(); };
  return <>
    <RecordMaintenance title="Fee account details" rows={accounts} canEdit={r => r.status !== 'CANCELLED'}
      columns={[{header:'Student',accessor:'studentName'}, {header:'Total',accessor:'totalAmount'}, {header:'Due date',accessor:'dueDate'}]}
      fields={[{name:'totalAmount',label:'Total amount',type:'number',min:0,step:'0.01'}, {name:'dueDate',label:'Due date',type:'date'}, {name:'remarks',label:'Remarks',required:false}]}
      onSave={async (r, values) => { await api.put(`/fees/accounts/${r.id}`,values); await refreshAccounts(); }} />
    <label className="text-sm font-medium">Payment search<input className="block border rounded p-2 mt-1 w-full sm:w-80" value={search} onChange={e => setSearch(e.target.value)} /></label>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <RecordMaintenance title="Payment history" rows={payments.filter(p => `${p.studentId} ${p.paidBy} ${p.transactionReference} ${p.verificationStatus}`.toLowerCase().includes(search.toLowerCase()))}
      columns={[{header:'ID',accessor:'id'}, {header:'Student',accessor:'studentId'}, {header:'Paid by',accessor:'paidBy'}, {header:'Amount',accessor:'amountPaid'}, {header:'Status',accessor:'verificationStatus'}]}
      fields={[{name:'amountPaid',label:'Amount',type:'number',min:0.01,step:'0.01'}, {name:'paymentMethod',label:'Method',options:['CASH','BANK_TRANSFER','BANK_DEPOSIT','CHEQUE'].map(v => ({value:v,label:v.replaceAll('_',' ')}))}, {name:'paidBy',label:'Paid by',maxLength:150}, {name:'transactionReference',label:'Reference',required:false,maxLength:100}]}
      canEdit={r => r.verificationStatus === 'PENDING'} canDelete={r => r.verificationStatus !== 'CANCELLED'} deleteLabel="Cancel Payment"
      onSave={async (r,values) => { await api.put(`/fees/payments/${r.id}`,values); await reload(); }}
      onDelete={async r => { const reason = window.prompt('Reason for cancelling this payment'); if (!reason?.trim()) return; await api.post(`/fees/payments/${r.id}/cancel`, null, {params:{reason}}); await reload(); }} />
  </>;
}
