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
  return <section className="my-6 border-t border-outline-variant/30 pt-5">
    <h3 className="text-lg font-bold text-on-surface mb-3">{title}</h3>
    {error && !record && <p role="alert" className="text-error text-sm mb-3">{error}</p>}
    <DataTable data={rows} columns={[...columns, { header: 'Actions', cell: row => <div className="flex flex-wrap gap-2">
      {onSave && canEdit(row) && <button disabled={busy} onClick={() => edit(row)} className="px-2.5 py-1 rounded bg-primary-fixed/40 text-primary hover:bg-primary-fixed/70 text-xs font-semibold transition-colors">Edit</button>}
      {onDelete && canDelete(row) && <button disabled={busy} onClick={() => remove(row)} className="px-2.5 py-1 rounded bg-error-container/50 text-error hover:bg-error-container text-xs font-semibold transition-colors">{deleteLabel}</button>}
    </div> }]} />
    <Modal isOpen={Boolean(record)} onClose={() => !busy && setRecord(null)} title={`Edit ${title}`}>
      <form onSubmit={save} className="space-y-4">
        {fields.map(f => <label key={f.name} className="block text-sm font-medium text-on-surface">{f.label}
          {f.options ? <select required className="mt-1 block w-full bg-surface-container-low border border-outline-variant/50 rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-primary" value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })}>
            <option value="">Select</option>{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select> : <input required={f.required !== false} type={f.type || 'text'} min={f.min} max={f.max} step={f.step} maxLength={f.maxLength} className="mt-1 block w-full bg-surface-container-low border border-outline-variant/50 rounded-lg p-2.5 text-on-surface focus:outline-none focus:border-primary" value={form[f.name] ?? ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} />}
        </label>)}
        {error && <p role="alert" className="text-error text-sm">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" disabled={busy} onClick={() => setRecord(null)} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low font-medium text-sm transition-colors">Cancel</button>
          <button disabled={busy} className="bg-primary-container hover:bg-primary text-on-primary font-semibold rounded-lg px-4 py-2 text-sm transition-colors shadow-sm">{busy ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  </section>;
}
