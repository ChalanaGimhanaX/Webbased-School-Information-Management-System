// Assigned module owner: IT25102861
import { useEffect, useState } from 'react';
import api from '../api/axios';
import RecordMaintenance from './RecordMaintenance';

export default function TeacherAssignments({ teachers, subjects, classes }) {
  const [teacherId, setTeacherId] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    setRows([]);
    if (teacherId) api.get(`/teachers/${teacherId}/assignments`).then(r => { if (!cancelled) setRows(r.data); }).catch(() => { if (!cancelled) setError('Could not load assignments'); });
    return () => { cancelled = true; };
  }, [teacherId, teachers]);
  const refresh = async () => setRows((await api.get(`/teachers/${teacherId}/assignments`)).data);
  return <section className="mt-6">
    <label className="text-sm font-medium">Teacher assignments
      <select className="block border rounded p-2 mt-2 w-full sm:w-80" value={teacherId} onChange={e => { setTeacherId(e.target.value); setError(''); }}>
        <option value="">Select teacher</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
      </select>
    </label>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {teacherId && <RecordMaintenance title="Assignments" rows={rows}
      columns={[{ header: 'Subject', accessor: 'subjectName' }, { header: 'Class', cell: r => classes.find(c => c.id === r.classId)?.className || r.classId }, { header: 'Year', accessor: 'academicYear' }]}
      fields={[{ name: 'subjectId', label: 'Subject', type: 'number', options: subjects.map(s => ({value: s.id, label: s.subjectName})) }, { name: 'classId', label: 'Class', type: 'number', options: classes.map(c => ({value:c.id, label:c.className})) }, { name:'academicYear', label:'Academic year', type:'number', min:2000 }]}
      onSave={async (r, values) => { await api.put(`/teachers/${teacherId}/assignments/${r.id}`, { ...values, teacherId: Number(teacherId) }); await refresh(); }}
      onDelete={async r => { await api.delete(`/teachers/${teacherId}/assignments/${r.id}`); await refresh(); }} />}
  </section>;
}
