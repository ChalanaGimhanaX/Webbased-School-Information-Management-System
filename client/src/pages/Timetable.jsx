// Assigned module owner: IT25101913
import React, { useState, useEffect, useContext } from 'react';
import Modal from '../components/Modal';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

// Subject colour tones with dark-mode variants (keeps the grid readable in both themes)
const SUBJECT_TONES = {
  blue: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-500/10 dark:text-blue-100 dark:border-blue-400/25',
  emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:border-emerald-400/25',
  amber: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:border-amber-400/25',
  purple: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-500/10 dark:text-purple-100 dark:border-purple-400/25',
  rose: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-500/10 dark:text-rose-100 dark:border-rose-400/25',
  pink: 'bg-pink-50 text-pink-900 border-pink-200 dark:bg-pink-500/10 dark:text-pink-100 dark:border-pink-400/25',
  teal: 'bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-500/10 dark:text-teal-100 dark:border-teal-400/25',
  indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-100 dark:border-indigo-400/25',
};

const Timetable = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;
  const isStudent = role === 'STUDENT';
  const isParent = role === 'PARENT';
  const isStudentRole = isStudent || isParent;
  // Only the Admin and Head of Academic may create / edit timetables (UC-05). Teachers get a read-only class view.
  const canEdit = role === 'ADMIN' || role === 'HEAD_OF_ACADEMIC';

  // View state for staff users: 'editor' | 'student_view'
  const [viewMode, setViewMode] = useState(canEdit ? 'editor' : 'student_view');

  // Shared / Admin state
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

  // Modals for editing
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [entryForm, setEntryForm] = useState({
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    subjectId: '',
    teacherId: '',
    roomNumber: 'Room 101',
  });

  // Dedicated Student Timetable State
  const [studentTimetable, setStudentTimetable] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState('');

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const periodTimings = {
    1: '08:00 - 08:45',
    2: '08:45 - 09:30',
    3: '09:30 - 10:15',
    4: '10:15 - 11:00',
    5: '11:20 - 12:05',
    6: '12:05 - 12:50',
    7: '12:50 - 13:35',
    8: '13:35 - 14:20',
  };

  // Color mapping by subject keyword / ID
  const getSubjectBadgeColor = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('math')) return SUBJECT_TONES.blue;
    if (lower.includes('sci')) return SUBJECT_TONES.emerald;
    if (lower.includes('eng')) return SUBJECT_TONES.amber;
    if (lower.includes('comp') || lower.includes('ict')) return SUBJECT_TONES.purple;
    if (lower.includes('hist')) return SUBJECT_TONES.rose;
    if (lower.includes('art') || lower.includes('music')) return SUBJECT_TONES.pink;
    if (lower.includes('sinhala') || lower.includes('tamil')) return SUBJECT_TONES.teal;
    return SUBJECT_TONES.indigo;
  };

  const flash = (msg) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 4000);
  };

  // Load general dependencies for staff or fallback
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

        if (cl.length > 0 && !selectedClassId) {
          setSelectedClassId(cl[0].id);
        }

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
        console.error('Failed to load timetable dependencies:', err);
      }
    };

    if (!isStudentRole) {
      fetchDependencies();
    }
  }, [isStudentRole]);

  // Load editor timetable for staff
  const fetchEditorTimetable = async (classId) => {
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
    if (!isStudentRole && selectedClassId && viewMode === 'editor') {
      fetchEditorTimetable(selectedClassId);
    }
  }, [selectedClassId, viewMode, isStudentRole]);

  // Load Student Timetable (either logged-in student or preview for class)
  const fetchStudentTimetableData = async () => {
    try {
      setStudentLoading(true);
      setStudentError('');
      let res;
      if (isStudentRole) {
        // Logged-in student fetches their own schedule
        res = await api.get('/timetables/my-timetable');
      } else if (selectedClassId) {
        // Staff previewing student view for a selected class
        res = await api.get(`/timetables/class/${selectedClassId}/student-view`);
      }
      if (res && res.data) {
        setStudentTimetable(res.data);
      }
    } catch (err) {
      console.error('Failed to load student timetable:', err);
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Could not load student timetable schedule.';
      setStudentError(msg);
      setStudentTimetable(null);
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    if (isStudentRole || viewMode === 'student_view') {
      fetchStudentTimetableData();
    }
  }, [isStudentRole, viewMode, selectedClassId]);

  // 1. CREATE Timetable if not initialized (Staff only)
  const handleCreateTimetable = async () => {
    try {
      setSubmitting(true);
      setError('');
      await api.post('/timetables', {
        classId: Number(selectedClassId),
        academicYear: new Date().getFullYear(),
        term: 1,
      });
      flash('Timetable initialized successfully!');
      fetchEditorTimetable(selectedClassId);
    } catch (err) {
      setError('Failed to initialize timetable.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. OPEN ADD/EDIT ENTRY MODAL (Staff only)
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
    setEntryForm({
      dayOfWeek: entry.dayOfWeek,
      periodNumber: entry.periodNumber,
      subjectId: entry.subjectId,
      teacherId: entry.teacherId,
      roomNumber: entry.roomNumber || '',
    });
    setError('');
    setModalError('');
    setIsEntryModalOpen(true);
  };

  // 3. SAVE ENTRY (Staff only)
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    if (!currentTimetable) return;

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
      if (editingEntryId) {
        await api.put(`/timetables/${currentTimetable.id}/entries/${editingEntryId}`, payload);
      } else {
        await api.post(`/timetables/${currentTimetable.id}/entries`, payload);
      }
      flash(`Period ${entryForm.periodNumber} ${editingEntryId ? 'updated' : 'assigned'} successfully!`);
      setIsEntryModalOpen(false);
      fetchEditorTimetable(selectedClassId);
    } catch (err) {
      const conflictMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error || 'Failed to add schedule entry.';
      setModalError(conflictMsg);
      setError(conflictMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. DELETE ENTRY (Staff only)
  const handleDeleteEntry = async (entryId, day, period) => {
    if (!currentTimetable) return;
    if (!window.confirm(`Delete entry for ${day} Period ${period}?`)) return;
    try {
      await api.delete(`/timetables/${currentTimetable.id}/entries/${entryId}`);
      flash(`Entry removed.`);
      fetchEditorTimetable(selectedClassId);
    } catch (err) {
      setError('Failed to delete schedule entry.');
    }
  };

  // Build lookup index for staff editor: "DAY-PERIOD" -> entry
  const editorScheduleLookup = {};
  entries.forEach((entry) => {
    const key = `${entry.dayOfWeek?.toUpperCase()}-${entry.periodNumber}`;
    editorScheduleLookup[key] = entry;
  });

  // Build lookup index for student view: "DAY-PERIOD" -> student slot
  const studentScheduleLookup = {};
  if (studentTimetable?.entries) {
    studentTimetable.entries.forEach((slot) => {
      const key = `${slot.dayOfWeek?.toUpperCase()}-${slot.periodNumber}`;
      studentScheduleLookup[key] = slot;
    });
  }

  // Today's schedule calculation for student
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDayName = dayNames[new Date().getDay()];
  const isWeekend = todayDayName === 'SUNDAY' || todayDayName === 'SATURDAY';

  const todayEntries = (studentTimetable?.entries || [])
    .filter((slot) => slot.dayOfWeek?.toUpperCase() === todayDayName)
    .sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-outline-variant/40 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              {isStudentRole ? 'My Class Timetable' : canEdit ? 'Timetable & Academic Scheduling' : 'Class Timetables'}
            </h2>
            {(isStudentRole || !canEdit) && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                {isStudentRole ? 'Student View' : 'Read only'}
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {isStudentRole
              ? 'View your weekly class schedule, subject periods, assigned teachers, and classroom locations'
              : canEdit
                ? 'Manage weekly periods, rooms, teacher assignments, and schedule entries'
                : 'View the weekly schedule of any class. Timetables are managed by the Head of Academic.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Editor / preview switcher (Admin + Head of Academic only) */}
          {canEdit && (
            <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'editor'
                    ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30 font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
                }`}
              >
                Class Timetable Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode('student_view')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'student_view'
                    ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30 font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
                }`}
              >
                Student View Preview
              </button>
            </div>
          )}

          {/* Staff Class Selector */}
          {!isStudentRole && (
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-on-surface-variant">Class:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-outline-variant rounded-lg px-3 py-1.5 bg-surface-container-lowest text-on-surface text-sm focus:ring-primary focus:border-primary shadow-xs"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} (Grade {c.gradeLevel})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add Period Entry Button (Editor only) */}
          {canEdit && viewMode === 'editor' && currentTimetable && (
            <button
              onClick={() => openAddEntryModal()}
              className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              + Add Period Entry
            </button>
          )}

          {/* Print Button (Available in Student View for all) */}
          {(isStudentRole || viewMode === 'student_view') && studentTimetable && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface text-sm font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>🖨️ Print Timetable</span>
            </button>
          )}
        </div>
      </div>

      {error && <div className="p-3 bg-error-container text-on-error-container border border-error/30 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-tertiary-fixed/50 text-on-tertiary-fixed border border-tertiary/30 rounded-lg text-sm">{success}</div>}


      {/* ========================================================================= */}
      {/* ── VIEW 1: STUDENT TIMETABLE TABLE (FOR STUDENTS OR PREVIEW) ── */}
      {/* ========================================================================= */}
      {(isStudentRole || viewMode === 'student_view') && (
        <div className="space-y-6">
          {studentLoading && (
            <div className="bg-surface-container-lowest rounded-xl p-12 text-center text-on-surface-variant shadow-xs border border-outline-variant/40">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <div>Loading student timetable...</div>
            </div>
          )}

          {studentError && !studentLoading && (
            <div className="bg-surface-container-lowest rounded-xl p-8 text-center shadow-xs border border-error/30">
              <p className="text-error font-medium mb-2">{studentError}</p>
              <p className="text-on-surface-variant text-sm">Please contact the academic administration office if your class timetable has not yet been assigned.</p>
            </div>
          )}

          {studentTimetable && !studentLoading && (
            <>
              {/* Student & Class Particulars Card */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                      Wycherley International School • Academic Schedule
                    </div>
                    <h3 className="text-2xl font-bold mt-1">
                      {studentTimetable.studentName ? studentTimetable.studentName : studentTimetable.className}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {studentTimetable.admissionNumber && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-700/60 text-indigo-100 border border-indigo-500/40">
                          Adm No: {studentTimetable.admissionNumber}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-700/60 text-indigo-100 border border-indigo-500/40">
                        Class: {studentTimetable.className}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-700/60 text-indigo-100 border border-indigo-500/40">
                        Grade {studentTimetable.gradeLevel}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-700/60 text-indigo-100 border border-indigo-500/40">
                        Year {studentTimetable.academicYear} • Term {studentTimetable.term}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        studentTimetable.status === 'PUBLISHED'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-400 text-amber-950'
                      }`}
                    >
                      {studentTimetable.status}
                    </span>
                    <span className="text-[11px] text-indigo-300">
                      Total Allocated Slots: {studentTimetable.entries?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Schedule Highlight Widget */}
              <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/40 p-5 print:hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <h4 className="font-bold text-on-surface text-sm uppercase tracking-wide">
                      Today's Schedule ({todayDayName})
                    </h4>
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {isWeekend ? (
                  <div className="p-4 bg-surface-container-low rounded-lg text-center text-sm text-on-surface-variant">
                    🎉 It's the weekend! No classes are scheduled for today. Review the weekly schedule below.
                  </div>
                ) : todayEntries.length === 0 ? (
                  <div className="p-4 bg-surface-container-low rounded-lg text-center text-sm text-on-surface-variant">
                    No classes scheduled for today.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {todayEntries.map((slot) => (
                      <div
                        key={slot.entryId}
                        className={`p-3 rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-sm ${getSubjectBadgeColor(slot.subjectName)}`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span>Period {slot.periodNumber}</span>
                          <span className="font-mono text-[11px] opacity-70">
                            {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                          </span>
                        </div>
                        <div className="font-bold text-sm truncate">{slot.subjectName}</div>
                        <div className="flex items-center justify-between text-xs mt-2 pt-1.5 border-t border-current/10">
                          <span className="truncate opacity-80">👤 {slot.teacherName}</span>
                          <span className="font-mono px-1.5 py-0.5 rounded border border-current/20 text-[10px] font-semibold">
                            {slot.roomNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* The Dedicated Student Timetable Table (Read-Only) */}
              <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/60 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto thin-scroll">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="sticky left-0 z-10 bg-surface-container-low px-4 py-3.5 border-b border-r border-outline-variant/60 dark:border-white/10 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant min-w-[120px]">
                          Day / Period
                        </th>
                        {periods.map((p) => (
                          <th key={p} className="px-3 py-3 border-b border-r border-outline-variant/60 dark:border-white/10 last:border-r-0 text-center min-w-[135px]">
                            <div className="text-xs font-bold uppercase text-on-surface">Period {p}</div>
                            <div className="text-[10px] font-normal text-on-surface-variant font-mono mt-0.5">
                              {periodTimings[p] || ''}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day, rowIdx) => {
                        const isToday = day === todayDayName;
                        const rowBorder = rowIdx < days.length - 1 ? 'border-b' : '';
                        return (
                          <tr key={day} className="group/row">
                            {/* Day Row Header */}
                            <td className={`sticky left-0 z-10 px-4 py-4 border-r ${rowBorder} border-outline-variant/60 dark:border-white/10 font-bold text-xs whitespace-nowrap ${isToday ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-low text-on-surface'}`}>
                              <div className="flex items-center gap-1.5">
                                <span>{day}</span>
                                {isToday && (
                                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" title="Today"></span>
                                )}
                              </div>
                            </td>

                            {/* 8 Periods */}
                            {periods.map((period) => {
                              const slot = studentScheduleLookup[`${day}-${period}`];
                              const badgeColor = slot ? getSubjectBadgeColor(slot.subjectName) : '';

                              return (
                                <td
                                  key={period}
                                  className={`px-2 py-2 border-r ${rowBorder} border-outline-variant/60 dark:border-white/10 last:border-r-0 text-center align-top min-w-[135px] h-[100px] ${isToday ? 'bg-primary-fixed/10' : ''}`}
                                >
                                  {slot ? (
                                    <div
                                      className={`h-full flex flex-col justify-between p-2 rounded-lg border text-left transition-all shadow-xs hover:-translate-y-0.5 hover:shadow-md ${badgeColor}`}
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="font-bold text-xs leading-tight line-clamp-2">
                                            {slot.subjectName}
                                          </span>
                                        </div>
                                        {slot.subjectCode && (
                                          <div className="text-[10px] opacity-70 font-mono mt-0.5">
                                            {slot.subjectCode}
                                          </div>
                                        )}
                                        <div className="text-[11px] opacity-80 mt-1 font-medium truncate flex items-center gap-1">
                                          <span>👤</span>
                                          <span className="truncate">{slot.teacherName}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-current/10 text-[10px]">
                                        <span className="font-mono font-semibold px-1.5 py-0.5 rounded border border-current/20">
                                          📍 {slot.roomNumber}
                                        </span>
                                        <span className="font-mono opacity-70 text-[9px]">
                                          {slot.startTime?.substring(0, 5)}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full rounded-lg border border-dashed border-outline-variant/70 flex flex-col items-center justify-center bg-surface-container-low/30">
                                      <span className="text-[11px] font-medium text-outline">Free Period</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── VIEW 2: CLASS TIMETABLE EDITOR (ADMIN / HEAD OF ACADEMIC ONLY) ── */}
      {/* ========================================================================= */}
      {canEdit && viewMode === 'editor' && (
        <div className="space-y-4">
          {!currentTimetable && !loading && (
            <div className="bg-surface-container-lowest rounded-xl shadow-xs p-8 text-center border border-outline-variant/40">
              <p className="text-on-surface-variant mb-4">No active timetable found for this class in Academic Year {new Date().getFullYear()}.</p>
              <button
                onClick={handleCreateTimetable}
                disabled={submitting}
                className="px-6 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                {submitting ? 'Initializing...' : '+ Initialize Class Timetable'}
              </button>
            </div>
          )}

          {currentTimetable && (
            <div className="bg-surface-container-lowest rounded-xl shadow-xs overflow-x-auto thin-scroll border border-outline-variant/60 dark:border-white/10">
              {loading ? (
                <div className="py-16 text-center text-on-surface-variant">Loading schedule...</div>
              ) : (
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="sticky left-0 z-10 bg-surface-container-low px-4 py-3 border-b border-r border-outline-variant/60 dark:border-white/10 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Day / Period
                      </th>
                      {periods.map((p) => (
                        <th key={p} className="px-3 py-3 border-b border-r border-outline-variant/60 dark:border-white/10 last:border-r-0 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                          Period {p}
                          <div className="text-[10px] font-normal normal-case font-mono mt-0.5 opacity-80">{periodTimings[p]}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, rowIdx) => {
                      const rowBorder = rowIdx < days.length - 1 ? 'border-b' : '';
                      return (
                        <tr key={day}>
                          <td className={`sticky left-0 z-10 px-4 py-3 border-r ${rowBorder} border-outline-variant/60 dark:border-white/10 font-semibold text-on-surface text-xs bg-surface-container-low whitespace-nowrap`}>
                            {day}
                          </td>
                          {periods.map((period) => {
                            const entry = editorScheduleLookup[`${day}-${period}`];
                            const subjectName = entry ? (subjectsMap[entry.subjectId] || `Subj #${entry.subjectId}`) : '';
                            return (
                              <td key={period} className={`px-2 py-2 border-r ${rowBorder} border-outline-variant/60 dark:border-white/10 last:border-r-0 text-center align-top min-w-[130px] h-[90px] group relative`}>
                                {entry ? (
                                  <div className={`h-full flex flex-col justify-between p-1.5 border rounded-lg text-left transition-shadow hover:shadow-md ${getSubjectBadgeColor(subjectName)}`}>
                                    <div>
                                      <div className="font-semibold text-xs leading-tight">
                                        {subjectName}
                                      </div>
                                      <div className="text-[11px] opacity-80 mt-1">
                                        {teachersMap[entry.teacherId] || `Teacher #${entry.teacherId}`}
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-current/10 text-[10px]">
                                      <span className="font-mono opacity-70">{entry.roomNumber || 'Room 101'}</span>
                                      <button
                                        onClick={() => openEditEntryModal(entry)}
                                        className="font-semibold px-1 hover:underline"
                                        title="Edit Entry"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEntry(entry.id, day, period)}
                                        className="text-error hover:opacity-80 font-bold px-1"
                                        title="Delete Entry"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => openAddEntryModal(day, period)}
                                    className="w-full h-full border border-dashed border-outline-variant/80 dark:border-white/10 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:border-primary/50 hover:bg-primary-fixed/20 transition-colors text-xs"
                                  >
                                    + Assign
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: Add / Edit Schedule Entry (Admin / Head of Academic only) ── */}
      {canEdit && (
        <Modal
          isOpen={isEntryModalOpen}
          onClose={() => setIsEntryModalOpen(false)}
          title={editingEntryId ? 'Edit Timetable Period' : 'Assign Timetable Period'}
        >
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Day of Week <span className="text-red-500">*</span></label>
                <select
                  value={entryForm.dayOfWeek}
                  onChange={(e) => setEntryForm({ ...entryForm, dayOfWeek: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Period Number <span className="text-red-500">*</span></label>
                <select
                  value={entryForm.periodNumber}
                  onChange={(e) => setEntryForm({ ...entryForm, periodNumber: Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {periods.map((p) => <option key={p} value={p}>Period {p}</option>)}
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
                {subjects.map((s) => (
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
                {teachers.map((t) => (
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
      )}
    </div>
  );
};

export default Timetable;
