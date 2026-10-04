// Assigned module owner: IT25100975
import { useState } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';

export default function RecordMaintenance({ title, rows, fields, columns, onSave, onDelete, canEdit = () => true, canDelete = () => true, deleteLabel = 'Remove' }) {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const edit = (row) => {
    setRecord(row);
    setForm(Object.fromEntries(fields.map(f => [f.name, row[f.name] ?? ''])));
    setError('');
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const values = Object.fromEntries(fields.map(f => [f.name, f.type === 'number' ? Number(form[f.name]) : form[f.name]]));
      await onSave(record, values);
      setRecord(null);
    } catch (err) { setError(err.response?.data?.detail || 'Could not save record.'); }
    finally { setBusy(false); }
  };
  const remove = async (row) => {
    if (!window.confirm(`${deleteLabel} record #${row.id}?`)) return;
    setBusy(true);
    setError('');
    try { await onDelete(row); }
    catch (err) { setError(err.response?.data?.detail || 'Could not remove record.'); }
    finally { setBusy(false); }
  };
  return <section className="my-6 border-t border-gray-200 pt-5">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    {error && !record && <p role="alert" className="text-red-700 mb-3">{error}</p>}
    <DataTable data={rows} columns={[...columns, { header: 'Actions', cell: row => <div className="flex flex-wrap gap-3">
      {onSave && canEdit(row) && <button disabled={busy} onClick={() => edit(row)} className="text-indigo-700">Edit</button>}
      {onDelete && canDelete(row) && <button disabled={busy} onClick={() => remove(row)} className="text-red-700">{deleteLabel}</button>}
    </div> }]} />
    <Modal isOpen={Boolean(record)} onClose={() => !busy && setRecord(null)} title={`Edit ${title}`}>
      <form onSubmit={save} className="space-y-4">
        {fields.map(f => <label key={f.name} className="block text-sm font-medium">{f.label}
          {f.options ? <select required className="mt-1 block w-full border rounded p-2" value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })}>
            <option value="">Select</option>{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select> : <input required={f.required !== false} type={f.type || 'text'} min={f.min} max={f.max} step={f.step} maxLength={f.maxLength} className="mt-1 block w-full border rounded p-2" value={form[f.name] ?? ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} />}
        </label>)}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => setRecord(null)}>Cancel</button><button disabled={busy} className="bg-indigo-600 text-white rounded px-4 py-2">{busy ? 'Saving...' : 'Save'}</button></div>
      </form>
    </Modal>
  </section>;
}
