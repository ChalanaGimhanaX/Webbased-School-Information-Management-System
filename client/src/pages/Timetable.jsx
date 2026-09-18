// Assigned module owner: IT25101913
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import api from '../api/axios';

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [entries, setEntries] = useState([]);
  const [slots, setSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [subjectsMap, setSubjectsMap] = useState({});
  const [teachersMap, setTeachersMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [entryForm, setEntryForm] = useState({
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    subjectId: '',
    teacherId: '',
    roomNumber: 'Room 101',
  });

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const flash = (msg) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 4000);
  };

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [cRes, sRes, tRes, slotRes] = await Promise.all([
          api.get('/students/classes').catch(() => ({ data: [] })),
          api.get('/teachers/subjects').catch(() => ({ data: [] })),
          api.get('/teachers').catch(() => ({ data: [] })),
          api.get('/timetables/slots').catch(() => ({ data: [] })),
        ]);

        const cl = cRes.data || [];
        const sl = sRes.data || [];
        const tl = tRes.data || [];
        const slotList = slotRes.data || [];

        setClasses(cl);
        setSubjects(sl);
        setTeachers(tl);
        setSlots(slotList);

        if (cl.length > 0) setSelectedClassId(cl[0].id);

        const sMap = {};
        sl.forEach((s) => {
          sMap[s.id] = s.subjectName || s.name || `Subject #${s.id}`;
        });
        setSubjectsMap(sMap);

        const tMap = {};
        tl.forEach((t) => {
          tMap[t.id] = `${t.firstName} ${t.lastName}`;
        });
        setTeachersMap(tMap);
      } catch (err) {
        console.error('Failed to load initial timetable dependencies:', err);
      }
    };

    fetchDependencies();
  }, []);

  const fetchTimetable = async (classId) => {
    if (!classId) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/timetables/class/${classId}`);
      const timetableList = res.data || [];
      if (timetableList.length > 0) {
        setCurrentTimetable(timetableList[0]);
        setEntries(timetableList[0].entries || []);
      } else {
        setCurrentTimetable(null);
        setEntries([]);
      }
    } catch (err) {
      console.error('Failed to load timetable for class:', err);
      setError('Could not retrieve timetable for this class.');
      setCurrentTimetable(null);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchTimetable(selectedClassId);
    }
  }, [selectedClassId]);

  // 1. CREATE Timetable if not initialized
  const handleCreateTimetable = async () => {
    try {
      setSubmitting(true);
      setError('');
      const res = await api.post('/timetables', {
        classId: Number(selectedClassId),
        academicYear: new Date().getFullYear(),
        term: 1,
      });
      flash('Timetable initialized successfully!');
      fetchTimetable(selectedClassId);
    } catch (err) {
      setError('Failed to initialize timetable.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. OPEN ADD ENTRY MODAL
  const openAddEntryModal = (day = 'MONDAY', period = 1) => {
    setEditingEntryId(null);
    if (!currentTimetable) {
      setError('Please initialize a timetable for this class first.');
      return;
    }
    setEntryForm({
      dayOfWeek: day,
      periodNumber: period,
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      teacherId: teachers.length > 0 ? teachers[0].id : '',
      roomNumber: 'Room 101',
    });
    setError('');
    setModalError('');
    setIsEntryModalOpen(true);
  };

  const openEditEntryModal = (entry) => {
    setEditingEntryId(entry.id);
    setEntryForm({ dayOfWeek: entry.dayOfWeek, periodNumber: entry.periodNumber, subjectId: entry.subjectId, teacherId: entry.teacherId, roomNumber: entry.roomNumber || '' });
    setError('');
    setModalError('');
    setIsEntryModalOpen(true);
  };

  // 3. SAVE ENTRY
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    if (!currentTimetable) return;

    // Find corresponding timeSlotId from slots
    const targetSlot = slots.find(
      (s) => s.dayOfWeek === entryForm.dayOfWeek && s.periodNumber === Number(entryForm.periodNumber)
    );

    if (!targetSlot) {
      setModalError(`Slot definition not found for ${entryForm.dayOfWeek} Period ${entryForm.periodNumber}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setModalError('');
      const payload = {
        timeSlotId: targetSlot.id,
        subjectId: Number(entryForm.subjectId),
        teacherId: Number(entryForm.teacherId),
        roomNumber: entryForm.roomNumber.trim() || 'Room 101',
      };
      if (editingEntryId) await api.put(`/timetables/${currentTimetable.id}/entries/${editingEntryId}`, payload);
      else await api.post(`/timetables/${currentTimetable.id}/entries`, payload);
      flash(`Period ${entryForm.periodNumber} ${editingEntryId ? 'updated' : 'assigned'} successfully!`);
      setIsEntryModalOpen(false);
      fetchTimetable(selectedClassId);
    } catch (err) {
      const conflictMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error || 'Failed to add schedule entry.';
      setModalError(conflictMsg);
      setError(conflictMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. DELETE ENTRY (DELETE)
  const handleDeleteEntry = async (entryId, day, period) => {
    if (!currentTimetable) return;
    if (!window.confirm(`Delete entry for ${day} Period ${period}?`)) return;
    try {
      await api.delete(`/timetables/${currentTimetable.id}/entries/${entryId}`);
      flash(`Entry removed.`);
      fetchTimetable(selectedClassId);
    } catch (err) {
      setError('Failed to delete schedule entry.');
    }
  };

  // Build lookup index: "DAY-PERIOD" -> entry
  const scheduleLookup = {};
  entries.forEach((entry) => {
    const key = `${entry.dayOfWeek?.toUpperCase()}-${entry.periodNumber}`;
    scheduleLookup[key] = entry;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Timetable & Academic Scheduling</h2>
          <p className="text-sm text-gray-500 mt-1">Manage weekly periods, rooms, teacher assignments, and schedule entries</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className} (Grade {c.gradeLevel})
              </option>
            ))}
          </select>
          {currentTimetable && (
            <button
              onClick={() => openAddEntryModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              + Add Period Entry
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{success}</div>}

      {!currentTimetable && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100 mb-6">
          <p className="text-gray-600 mb-4">No active timetable found for this class in Academic Year 2026.</p>
          <button
            onClick={handleCreateTimetable}
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium shadow-sm"
          >
            {submitting ? 'Initializing...' : '+ Initialize Class Timetable'}
          </button>
        </div>
      )}

      {currentTimetable && (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Loading schedule...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 border text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Day / Period
                  </th>
                  {periods.map((p) => (
                    <th key={p} className="px-3 py-3 border text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 border font-semibold text-gray-700 text-xs bg-gray-50 whitespace-nowrap">
                      {day}
                    </td>
                    {periods.map((period) => {
                      const entry = scheduleLookup[`${day}-${period}`];
                      return (
                        <td key={period} className="px-2 py-2 border text-center align-top min-w-[130px] h-[90px] group relative">
                          {entry ? (
                            <div className="h-full flex flex-col justify-between p-1.5 bg-indigo-50 border border-indigo-100 rounded text-left">
                              <div>
                                <div className="font-semibold text-indigo-900 text-xs leading-tight">
                                  {subjectsMap[entry.subjectId] || `Subj #${entry.subjectId}`}
                                </div>
                                <div className="text-[11px] text-gray-600 mt-1">
                                  {teachersMap[entry.teacherId] || `Teacher #${entry.teacherId}`}
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-2 pt-1 border-t border-indigo-200/50 text-[10px]">
                                <span className="font-mono text-gray-500">{entry.roomNumber || 'Room 101'}</span>
                                <button onClick={() => openEditEntryModal(entry)} className="text-indigo-600 hover:text-indigo-900 px-1" title="Edit Entry">Edit</button>
                                <button
                                  onClick={() => handleDeleteEntry(entry.id, day, period)}
                                  className="text-red-500 hover:text-red-700 font-bold px-1"
                                  title="Delete Entry"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => openAddEntryModal(day, period)}
                              className="w-full h-full border border-dashed border-gray-200 rounded flex items-center justify-center text-gray-300 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors text-xs"
                            >
                              + Assign
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── MODAL: Add Schedule Entry ── */}
      <Modal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} title={editingEntryId ? 'Edit Timetable Period' : 'Assign Timetable Period'}>
        <form onSubmit={handleEntrySubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Day of Week <span className="text-red-500">*</span></label>
              <select
                value={entryForm.dayOfWeek}
                onChange={(e) => setEntryForm({ ...entryForm, dayOfWeek: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Period Number <span className="text-red-500">*</span></label>
              <select
                value={entryForm.periodNumber}
                onChange={(e) => setEntryForm({ ...entryForm, periodNumber: Number(e.target.value) })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {periods.map(p => <option key={p} value={p}>Period {p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject <span className="text-red-500">*</span></label>
            <select
              required
              value={entryForm.subjectId}
              onChange={(e) => setEntryForm({ ...entryForm, subjectId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.subjectCode} - {s.subjectName} (Grade {s.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teacher <span className="text-red-500">*</span></label>
            <select
              required
              value={entryForm.teacherId}
              onChange={(e) => setEntryForm({ ...entryForm, teacherId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.employeeNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Room Number</label>
            <input
              type="text"
              placeholder="e.g. Science Lab 2"
              value={entryForm.roomNumber}
              onChange={(e) => setEntryForm({ ...entryForm, roomNumber: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-semibold flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <div className="flex-1">
                <span className="font-bold block mb-0.5">Scheduling Conflict:</span>
                <span>{modalError}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t space-x-3">
            <button
              type="button"
              onClick={() => setIsEntryModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingEntryId ? 'Update Period' : 'Assign Period'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Timetable;
