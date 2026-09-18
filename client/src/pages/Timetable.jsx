// Assigned module owner: IT25101913
import React, { useState, useEffect, useContext } from 'react';
import Modal from '../components/Modal';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Timetable = () => {
  const { user } = useContext(AuthContext);
  const isStudent = user?.role === 'STUDENT';
  const isParent = user?.role === 'PARENT';
  const isStudentRole = isStudent || isParent;

  // View state for non-student users: 'editor' | 'student_view'
  const [viewMode, setViewMode] = useState(isStudentRole ? 'student_view' : 'editor');

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
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');

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
    if (lower.includes('math')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (lower.includes('sci')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (lower.includes('eng')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (lower.includes('comp') || lower.includes('ict')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (lower.includes('hist')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (lower.includes('art') || lower.includes('music')) return 'bg-pink-50 text-pink-800 border-pink-200';
    if (lower.includes('sinhala') || lower.includes('tamil')) return 'bg-teal-50 text-teal-800 border-teal-200';
    return 'bg-indigo-50 text-indigo-800 border-indigo-200';
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

  // Filtered days for student table
  const displayedDays = selectedDayFilter === 'ALL' ? days : [selectedDayFilter];

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {isStudentRole ? 'My Class Timetable' : 'Timetable & Academic Scheduling'}
            </h2>
            {isStudentRole && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Student View
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isStudentRole
              ? 'View your weekly class schedule, subject periods, assigned teachers, and classroom locations'
              : 'Manage weekly periods, rooms, teacher assignments, and schedule entries'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Staff View Switcher Tabs */}
          {!isStudentRole && (
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'editor'
                    ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Class Timetable Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode('student_view')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'student_view'
                    ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Student View Preview
              </button>
            </div>
          )}

          {/* Staff Class Selector */}
          {!isStudentRole && (
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-700">Class:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} (Grade {c.gradeLevel})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add Period Entry Button (Staff Editor Only) */}
          {!isStudentRole && viewMode === 'editor' && currentTimetable && (
            <button
              onClick={() => openAddEntryModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              + Add Period Entry
            </button>
          )}

          {/* Print Button (Available in Student View for all) */}
          {(isStudentRole || viewMode === 'student_view') && studentTimetable && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span>🖨️ Print Timetable</span>
            </button>
          )}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{success}</div>}

      {/* ========================================================================= */}
      {/* ── VIEW 1: STUDENT TIMETABLE TABLE (FOR STUDENTS OR PREVIEW) ── */}
      {/* ========================================================================= */}
      {(isStudentRole || viewMode === 'student_view') && (
        <div className="space-y-6">
          {studentLoading && (
            <div className="bg-white rounded-lg p-12 text-center text-gray-500 shadow-sm border border-gray-100">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
              <div>Loading student timetable...</div>
            </div>
          )}

          {studentError && !studentLoading && (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-red-100">
              <p className="text-red-600 font-medium mb-2">{studentError}</p>
              <p className="text-gray-500 text-sm">Please contact the academic administration office if your class timetable has not yet been assigned.</p>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 print:hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      Today's Schedule ({todayDayName})
                    </h4>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {isWeekend ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    🎉 It's the weekend! No classes are scheduled for today. Review the weekly schedule below.
                  </div>
                ) : todayEntries.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    No classes scheduled for today.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {todayEntries.map((slot) => (
                      <div
                        key={slot.entryId}
                        className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold mb-1">
                          <span>Period {slot.periodNumber}</span>
                          <span className="font-mono text-[11px] text-gray-500">
                            {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                          </span>
                        </div>
                        <div className="font-bold text-gray-900 text-sm truncate">{slot.subjectName}</div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mt-2 pt-1.5 border-t border-indigo-100">
                          <span className="truncate">👤 {slot.teacherName}</span>
                          <span className="font-mono text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-[10px] font-semibold">
                            {slot.roomNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Day Filters */}
              <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase mr-1">Filter Day:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDayFilter('ALL')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedDayFilter === 'ALL'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Full Week
                  </button>
                  {days.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDayFilter(d)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedDayFilter === d
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Dedicated Student Timetable Table (Read-Only) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border-collapse">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-3.5 border-b border-r text-left text-xs font-bold uppercase tracking-wider min-w-[110px]">
                          Day / Period
                        </th>
                        {periods.map((p) => (
                          <th key={p} className="px-3 py-3 border-b border-r text-center min-w-[135px]">
                            <div className="text-xs font-bold uppercase text-gray-800">Period {p}</div>
                            <div className="text-[10px] font-normal text-gray-500 font-mono mt-0.5">
                              {periodTimings[p] || ''}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedDays.map((day) => (
                        <tr key={day} className="hover:bg-gray-50/50">
                          {/* Day Row Header */}
                          <td className="px-4 py-4 border-r font-bold text-gray-800 text-xs bg-gray-50/80 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{day}</span>
                              {day === todayDayName && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Today"></span>
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
                                className="px-2 py-2 border-r text-center align-top min-w-[135px] h-[100px]"
                              >
                                {slot ? (
                                  <div
                                    className={`h-full flex flex-col justify-between p-2 rounded-lg border text-left transition-shadow shadow-xs hover:shadow-sm ${badgeColor}`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-bold text-xs leading-tight line-clamp-2">
                                          {slot.subjectName}
                                        </span>
                                      </div>
                                      {slot.subjectCode && (
                                        <div className="text-[10px] opacity-75 font-mono mt-0.5">
                                          {slot.subjectCode}
                                        </div>
                                      )}
                                      <div className="text-[11px] text-gray-600 mt-1 font-medium truncate flex items-center gap-1">
                                        <span>👤</span>
                                        <span className="truncate">{slot.teacherName}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-black/5 text-[10px]">
                                      <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-white/80 border border-black/10 text-gray-700">
                                        📍 {slot.roomNumber}
                                      </span>
                                      <span className="font-mono text-gray-500 text-[9px]">
                                        {slot.startTime?.substring(0, 5)}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-full rounded-lg border border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                                    <span className="text-[11px] font-medium text-gray-400">Free Period</span>
                                    <span className="text-[9px] text-gray-300 font-mono">—</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── VIEW 2: STAFF CLASS TIMETABLE EDITOR (ADMIN / TEACHERS ONLY) ── */}
      {/* ========================================================================= */}
      {!isStudentRole && viewMode === 'editor' && (
        <div className="space-y-4">
          {!currentTimetable && !loading && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
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
                          const entry = editorScheduleLookup[`${day}-${period}`];
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
                                    <button
                                      onClick={() => openEditEntryModal(entry)}
                                      className="text-indigo-600 hover:text-indigo-900 px-1"
                                      title="Edit Entry"
                                    >
                                      Edit
                                    </button>
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
        </div>
      )}

      {/* ── MODAL: Add / Edit Schedule Entry (Staff Only) ── */}
      {!isStudentRole && (
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
