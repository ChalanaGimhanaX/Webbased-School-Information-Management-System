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

  // Navigation tabs for staff: 'class_timetable' | 'teacher_timetable' | 'subjects' | 'time_slots' | 'student_view'
  const [viewMode, setViewMode] = useState(isStudentRole ? 'student_view' : 'class_timetable');

  // Shared / Admin state
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [entries, setEntries] = useState([]);
  const [slots, setSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [classesMap, setClassesMap] = useState({});
  const [subjectsMap, setSubjectsMap] = useState({});
  const [teachersMap, setTeachersMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // Modals for editing period entries
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

  // Teacher Timetable View State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherEntries, setTeacherEntries] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  // Subject Management State (CRUD)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    subjectCode: '',
    subjectName: '',
    gradeLevel: 10,
  });
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectGradeFilter, setSubjectGradeFilter] = useState('');

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
  const fetchDependencies = async () => {
    try {
      const [cRes, sRes, tRes, slotRes] = await Promise.all([
        api.get('/students/classes').catch(() => ({ data: [] })),
        api.get('/timetables/subjects').catch(() => api.get('/teachers/subjects')).catch(() => ({ data: [] })),
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
      if (tl.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(tl[0].id);
      }

      const cMap = {};
      cl.forEach((c) => {
        cMap[c.id] = c.className || c.name || `Class #${c.id}`;
      });
      setClassesMap(cMap);

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

  useEffect(() => {
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
    if (!isStudentRole && selectedClassId && viewMode === 'class_timetable') {
      fetchEditorTimetable(selectedClassId);
    }
  }, [selectedClassId, viewMode, isStudentRole]);

  // Load Teacher Timetable
  const fetchTeacherTimetable = async (teacherId) => {
    if (!teacherId) return;
    try {
      setTeacherLoading(true);
      setTeacherError('');
      const res = await api.get(`/timetables/teacher/${teacherId}`);
      setTeacherEntries(res.data || []);
    } catch (err) {
      console.error('Failed to load teacher timetable:', err);
      setTeacherError('Could not retrieve schedule for this teacher.');
      setTeacherEntries([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  useEffect(() => {
    if (!isStudentRole && selectedTeacherId && viewMode === 'teacher_timetable') {
      fetchTeacherTimetable(selectedTeacherId);
    }
  }, [selectedTeacherId, viewMode, isStudentRole]);

  // Load Student Timetable (either logged-in student or preview for class)
  const fetchStudentTimetableData = async () => {
    try {
      setStudentLoading(true);
      setStudentError('');
      let res;
      if (isStudentRole) {
        res = await api.get('/timetables/my-timetable');
      } else if (selectedClassId) {
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

  // Publish Timetable
  const handlePublishTimetable = async () => {
    if (!currentTimetable) return;
    try {
      setSubmitting(true);
      setError('');
      await api.patch(`/timetables/${currentTimetable.id}/publish`);
      flash('Timetable published successfully! Students can now view this schedule.');
      fetchEditorTimetable(selectedClassId);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to publish timetable.';
      setError(msg);
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

  // 5. SUBJECT CRUD HANDLERS
  const openAddSubjectModal = () => {
    setEditingSubjectId(null);
    setSubjectForm({
      subjectCode: '',
      subjectName: '',
      gradeLevel: 10,
    });
    setModalError('');
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (subj) => {
    setEditingSubjectId(subj.id);
    setSubjectForm({
      subjectCode: subj.subjectCode || '',
      subjectName: subj.subjectName || subj.name || '',
      gradeLevel: subj.gradeLevel || 10,
    });
    setModalError('');
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subjectForm.subjectCode.trim() || !subjectForm.subjectName.trim()) {
      setModalError('Subject Code and Subject Name are required.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');
      const payload = {
        subjectCode: subjectForm.subjectCode.trim().toUpperCase(),
        subjectName: subjectForm.subjectName.trim(),
        gradeLevel: Number(subjectForm.gradeLevel),
      };

      if (editingSubjectId) {
        await api.put(`/timetables/subjects/${editingSubjectId}`, payload).catch(() =>
          api.put(`/teachers/subjects/${editingSubjectId}`, payload)
        );
        flash(`Subject "${payload.subjectName}" updated successfully!`);
      } else {
        await api.post('/timetables/subjects', payload).catch(() =>
          api.post('/teachers/subjects', payload)
        );
        flash(`Subject "${payload.subjectName}" created successfully!`);
      }

      setIsSubjectModalOpen(false);
      await fetchDependencies();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to save subject.';
      setModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subjectId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete "${subjectName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/timetables/subjects/${subjectId}`).catch(() =>
        api.delete(`/teachers/subjects/${subjectId}`)
      );
      flash(`Subject "${subjectName}" deleted successfully.`);
      await fetchDependencies();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Could not delete subject. It may be referenced in schedules or exams.';
      setError(msg);
    }
  };

  // Build lookup index for staff editor: "DAY-PERIOD" -> entry
  const editorScheduleLookup = {};
  entries.forEach((entry) => {
    const key = `${entry.dayOfWeek?.toUpperCase()}-${entry.periodNumber}`;
    editorScheduleLookup[key] = entry;
  });

  // Build lookup index for teacher view: "DAY-PERIOD" -> entry
  const teacherScheduleLookup = {};
  teacherEntries.forEach((entry) => {
    const key = `${entry.dayOfWeek?.toUpperCase()}-${entry.periodNumber}`;
    teacherScheduleLookup[key] = entry;
  });

  // Build lookup index for student view: "DAY-PERIOD" -> student slot
  const studentScheduleLookup = {};
  if (studentTimetable?.entries) {
    studentTimetable.entries.forEach((slot) => {
      const key = `${slot.dayOfWeek?.toUpperCase()}-${slot.periodNumber}`;
      studentScheduleLookup[key] = slot;
    });
  }

  // Filtered Subjects List for Subjects Management Tab
  const filteredSubjects = subjects.filter((s) => {
    const code = (s.subjectCode || '').toLowerCase();
    const name = (s.subjectName || s.name || '').toLowerCase();
    const q = subjectSearch.toLowerCase();
    const matchesSearch = code.includes(q) || name.includes(q);
    const matchesGrade = !subjectGradeFilter || s.gradeLevel === Number(subjectGradeFilter);
    return matchesSearch && matchesGrade;
  });

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
              {isStudentRole ? 'My Class Timetable' : 'Timetable & Academic Scheduling'}
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
              : 'Manage subjects, weekly class schedules, teacher allocations, classrooms, and time slots'}
          </p>
        </div>

        {/* Action Controls for Staff */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Selector when on Class Timetable tab */}
          {!isStudentRole && (viewMode === 'class_timetable' || viewMode === 'student_view') && (
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
          {canEdit && viewMode === 'class_timetable' && currentTimetable && (
            <button
              onClick={() => openAddEntryModal()}
              className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>+ Add Period Entry</span>
            </button>
          )}

          {/* Publish Timetable Button */}
          {canEdit && viewMode === 'class_timetable' && currentTimetable && currentTimetable.status === 'DRAFT' && (
            <button
              onClick={handlePublishTimetable}
              disabled={submitting}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>🚀 Publish Timetable</span>
            </button>
          )}

          {/* Add Subject Button when on Subjects tab */}
          {canEdit && viewMode === 'subjects' && (
            <button
              onClick={openAddSubjectModal}
              className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>+ Add New Subject</span>
            </button>
          )}

          {/* Print Button (Available in Student View or Timetables) */}
          {(isStudentRole || viewMode === 'student_view') && studentTimetable && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface text-sm font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>🖨️ Print Timetable</span>
            </button>
          )}
          {!isStudentRole && viewMode === 'teacher_timetable' && selectedTeacherId && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface text-sm font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>🖨️ Print Teacher Schedule</span>
            </button>
          )}
          {!isStudentRole && viewMode === 'class_timetable' && currentTimetable && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface text-sm font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>🖨️ Print Class Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Staff View Navigation Tabs */}
      {!isStudentRole && (
        <div className="flex bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/40 text-xs font-medium overflow-x-auto gap-1 print:hidden">
          <button
            type="button"
            onClick={() => setViewMode('class_timetable')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'class_timetable'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30 font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            <span>📅 Class Timetables</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('teacher_timetable')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'teacher_timetable'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30 font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            <span>👨‍🏫 Teacher Timetables</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('subjects')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'subjects'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30 font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            <span>📚 Subjects Management</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('time_slots')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'time_slots'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30 font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            <span>⏰ Time Slots</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('student_view')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'student_view'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/30 font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
          >
            <span>👁️ Student View Preview</span>
          </button>
        </div>
      )}

      {error && <div className="p-3 bg-error-container text-on-error-container border border-error/30 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-tertiary-fixed/50 text-on-tertiary-fixed border border-tertiary/30 rounded-lg text-sm">{success}</div>}

      {/* ========================================================================= */}
      {/* ── TAB 1: CLASS TIMETABLES (ADMIN / TEACHERS) ── */}
      {/* ========================================================================= */}
      {!isStudentRole && viewMode === 'class_timetable' && (
        <div className="space-y-4">
          {!currentTimetable && !loading && (
            <div className="bg-surface-container-lowest rounded-xl shadow-xs p-10 text-center border border-outline-variant/40">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-lg font-bold text-on-surface mb-1">No Active Timetable Found</h3>
              <p className="text-on-surface-variant mb-5 text-sm max-w-md mx-auto">
                No active timetable has been created for this class in Academic Year {new Date().getFullYear()}.
              </p>
              {canEdit ? (
                <button
                  onClick={handleCreateTimetable}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  {submitting ? 'Initializing...' : '+ Initialize Class Timetable'}
                </button>
              ) : (
                <p className="text-xs text-on-surface-variant italic">Please contact the Head of Academic to initialize this schedule.</p>
              )}
            </div>
          )}

          {currentTimetable && (
            <div className="space-y-3">
              {/* Class Schedule Meta Banner */}
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-xs text-on-surface-variant font-medium">Class Timetable:</span>
                    <h3 className="text-base font-bold text-on-surface">
                      {classesMap[selectedClassId] || `Class #${selectedClassId}`} • Academic Year {currentTimetable.academicYear} (Term {currentTimetable.term})
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      currentTimetable.status === 'PUBLISHED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-400 text-amber-950'
                    }`}
                  >
                    {currentTimetable.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium">
                  <div>
                    Allocated Periods: <strong className="text-on-surface">{entries.length} / 40</strong>
                  </div>
                  <div>
                    Free Periods: <strong className="text-on-surface">{40 - entries.length}</strong>
                  </div>
                </div>
              </div>

              {/* 5-day x 8-period Timetable Grid */}
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
                                <td key={period} className={`px-2 py-2 border-r ${rowBorder} border-outline-variant/60 dark:border-white/10 last:border-r-0 text-center align-top min-w-[130px] h-[95px] group relative`}>
                                  {entry ? (
                                    <div className={`h-full flex flex-col justify-between p-2 border rounded-lg text-left transition-shadow hover:shadow-md ${getSubjectBadgeColor(subjectName)}`}>
                                      <div>
                                        <div className="font-bold text-xs leading-tight line-clamp-2">
                                          {subjectName}
                                        </div>
                                        <div className="text-[11px] opacity-80 mt-1 truncate">
                                          👤 {teachersMap[entry.teacherId] || `Teacher #${entry.teacherId}`}
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-current/10 text-[10px]">
                                        <span className="font-mono font-semibold opacity-75">📍 {entry.roomNumber || 'Room 101'}</span>
                                        {canEdit && (
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => openEditEntryModal(entry)}
                                              className="font-semibold px-1 text-primary hover:underline"
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
                                        )}
                                      </div>
                                    </div>
                                  ) : canEdit ? (
                                    <button
                                      onClick={() => openAddEntryModal(day, period)}
                                      className="w-full h-full border border-dashed border-outline-variant/80 dark:border-white/10 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:border-primary/50 hover:bg-primary-fixed/20 transition-colors text-xs"
                                    >
                                      + Assign
                                    </button>
                                  ) : (
                                    <div className="w-full h-full border border-dashed border-outline-variant/30 rounded-lg flex items-center justify-center text-outline-variant text-[11px]">
                                      Free
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
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TAB 2: TEACHER TIMETABLES VIEW ── */}
      {/* ========================================================================= */}
      {!isStudentRole && viewMode === 'teacher_timetable' && (
        <div className="space-y-4">
          {/* Teacher Selector & Workload Header */}
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Select Teacher:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-lowest text-on-surface text-sm font-semibold focus:ring-primary focus:border-primary shadow-xs min-w-[240px]"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.employeeNumber})
                  </option>
                ))}
              </select>
            </div>

            {selectedTeacherId && (
              <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium">
                <div>
                  Weekly Teaching Periods: <strong className="text-on-surface">{teacherEntries.length}</strong>
                </div>
                <div>
                  Free Periods: <strong className="text-on-surface">{40 - teacherEntries.length}</strong>
                </div>
              </div>
            )}
          </div>

          {teacherError && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">
              {teacherError}
            </div>
          )}

          {/* Teacher Weekly Schedule Matrix */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs overflow-x-auto thin-scroll border border-outline-variant/60 dark:border-white/10">
            {teacherLoading ? (
              <div className="py-16 text-center text-on-surface-variant">Loading teacher schedule...</div>
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
                          const entry = teacherScheduleLookup[`${day}-${period}`];
                          const subjectName = entry ? (subjectsMap[entry.subjectId] || `Subj #${entry.subjectId}`) : '';
                          const className = entry && entry.classId ? (classesMap[entry.classId] || `Class #${entry.classId}`) : '';

                          return (
                            <td key={period} className={`px-2 py-2 border-r ${rowBorder} border-outline-variant/60 dark:border-white/10 last:border-r-0 text-center align-top min-w-[130px] h-[95px]`}>
                              {entry ? (
                                <div className={`h-full flex flex-col justify-between p-2 border rounded-lg text-left transition-shadow shadow-xs hover:shadow-md ${getSubjectBadgeColor(subjectName)}`}>
                                  <div>
                                    <div className="font-bold text-xs leading-tight line-clamp-2">
                                      {subjectName}
                                    </div>
                                    {className && (
                                      <div className="text-[11px] font-semibold text-primary mt-1">
                                        🏫 {className}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-current/10 text-[10px]">
                                    <span className="font-mono font-semibold opacity-75">📍 {entry.roomNumber || 'Room 101'}</span>
                                    <span className="font-mono text-[9px] opacity-60">
                                      {entry.startTime ? String(entry.startTime).substring(0, 5) : ''}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full border border-dashed border-outline-variant/30 rounded-lg flex flex-col items-center justify-center text-outline-variant text-[11px]">
                                  <span className="opacity-60">Free Period</span>
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
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TAB 3: SUBJECTS & CURRICULUM MANAGEMENT (CRUD) ── */}
      {/* ========================================================================= */}
      {!isStudentRole && viewMode === 'subjects' && (
        <div className="space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-xs">
              <div className="text-xs text-on-surface-variant font-medium">Total Curriculum Subjects</div>
              <div className="text-2xl font-bold text-on-surface mt-1">{subjects.length}</div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-xs">
              <div className="text-xs text-on-surface-variant font-medium">Senior Secondary (Grades 10-13)</div>
              <div className="text-2xl font-bold text-primary mt-1">
                {subjects.filter((s) => s.gradeLevel >= 10).length}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-xs">
              <div className="text-xs text-on-surface-variant font-medium">Junior / Middle (Grades 1-9)</div>
              <div className="text-2xl font-bold text-secondary mt-1">
                {subjects.filter((s) => s.gradeLevel < 10).length}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search subject code or title..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-on-surface focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-on-surface-variant font-medium">Grade:</label>
              <select
                value={subjectGradeFilter}
                onChange={(e) => setSubjectGradeFilter(e.target.value)}
                className="border border-outline-variant rounded-lg px-2.5 py-1 text-xs bg-surface-container-lowest text-on-surface"
              >
                <option value="">All Grades</option>
                {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden border border-outline-variant/40">
            <table className="min-w-full divide-y divide-outline-variant/40">
              <thead className="bg-surface-container-low text-on-surface-variant text-xs font-semibold uppercase tracking-wider text-left">
                <tr>
                  <th className="px-5 py-3.5">Subject Code</th>
                  <th className="px-5 py-3.5">Subject Name</th>
                  <th className="px-5 py-3.5">Grade Level</th>
                  {canEdit && <th className="px-5 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-sm">
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 4 : 3} className="px-5 py-8 text-center text-on-surface-variant">
                      No curriculum subjects found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-primary">
                        {s.subjectCode}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-on-surface">
                        {s.subjectName || s.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface">
                          Grade {s.gradeLevel}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEditSubjectModal(s)}
                            className="px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary-fixed/20 rounded-md transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(s.id, s.subjectName || s.name)}
                            className="px-2.5 py-1 text-xs font-medium text-error hover:bg-error-container rounded-md transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TAB 4: TIME SLOTS & BELL SCHEDULE ── */}
      {/* ========================================================================= */}
      {!isStudentRole && viewMode === 'time_slots' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-xs">
            <h3 className="text-base font-bold text-on-surface mb-2">School Bell Schedule & Academic Time Slots</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Official 8-period daily scheduling structure for Wycherley International School. Each period spans 45 minutes of instructional time, separated by a 20-minute interval break between periods 4 and 5.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {periods.map((p) => (
                <div
                  key={p}
                  className="p-4 rounded-xl border border-outline-variant/50 bg-surface-container-low/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center">
                      {p}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-on-surface">Period {p}</div>
                      <div className="text-xs text-on-surface-variant font-mono">{periodTimings[p]} (45 mins)</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                    {p <= 4 ? 'Morning Session' : p <= 6 ? 'Midday Session' : 'Afternoon Session'}
                  </span>
                </div>
              ))}
            </div>

            {/* Collision Engine Invariant Rules */}
            <div className="mt-6 p-4 rounded-xl bg-primary-fixed/20 border border-primary/20 text-xs text-on-surface space-y-1.5">
              <strong className="block text-sm font-bold text-primary mb-1">
                🛡️ Automatic Scheduling Conflict Prevention Rules (UC-05 Lead Module):
              </strong>
              <div>• <strong>Class Slot Conflict:</strong> A class cannot be assigned more than one subject during the same period.</div>
              <div>• <strong>Teacher Busy Conflict:</strong> A teacher cannot be booked in two different classes during the same period.</div>
              <div>• <strong>Room Occupied Conflict:</strong> A classroom or laboratory cannot host two classes simultaneously during the same period.</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TAB 5 / VIEW 1: DEDICATED STUDENT TIMETABLE TABLE (READ-ONLY) ── */}
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
                        className="p-3 rounded-lg border border-primary/20 bg-primary-fixed/15 hover:bg-primary-fixed/25 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs text-primary font-semibold mb-1">
                          <span>Period {slot.periodNumber}</span>
                          <span className="font-mono text-[11px] text-on-surface-variant">
                            {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                          </span>
                        </div>
                        <div className="font-bold text-on-surface text-sm truncate">{slot.subjectName}</div>
                        <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2 pt-1.5 border-t border-primary/10">
                          <span className="truncate">👤 {slot.teacherName}</span>
                          <span className="font-mono text-on-surface bg-surface-container-lowest px-1.5 py-0.5 rounded border border-outline-variant/60 text-[10px] font-semibold">
                            {slot.roomNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Student Timetable Table */}
              <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/60 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto thin-scroll">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead className="bg-surface-container-low text-on-surface-variant">
                      <tr>
                        <th className="sticky left-0 z-10 bg-surface-container-low px-4 py-3.5 border-b border-r border-outline-variant/60 dark:border-white/10 text-left text-xs font-bold uppercase tracking-wider min-w-[110px]">
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
                        const rowBorder = rowIdx < days.length - 1 ? 'border-b' : '';
                        return (
                          <tr key={day}>
                            <td className={`sticky left-0 z-10 px-4 py-4 border-r ${rowBorder} border-outline-variant/60 dark:border-white/10 font-bold text-on-surface text-xs bg-surface-container-low whitespace-nowrap`}>
                              <div className="flex items-center gap-1.5">
                                <span>{day}</span>
                                {day === todayDayName && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Today"></span>
                                )}
                              </div>
                            </td>

                            {periods.map((period) => {
                              const slot = studentScheduleLookup[`${day}-${period}`];
                              const badgeColor = slot ? getSubjectBadgeColor(slot.subjectName) : '';

                              return (
                                <td
                                  key={period}
                                  className={`px-2 py-2 border-r ${rowBorder} border-outline-variant/60 dark:border-white/10 last:border-r-0 text-center align-top min-w-[135px] h-[100px]`}
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
                                        <div className="text-[11px] opacity-80 mt-1 font-medium truncate flex items-center gap-1">
                                          <span>👤</span>
                                          <span className="truncate">{slot.teacherName}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-current/10 text-[10px]">
                                        <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-surface-container-lowest/80 border border-outline-variant/40">
                                          📍 {slot.roomNumber}
                                        </span>
                                        <span className="font-mono text-[9px] opacity-70">
                                          {slot.startTime?.substring(0, 5)}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full rounded-lg border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-outline-variant">
                                      <span className="text-[11px] font-medium">Free Period</span>
                                      <span className="text-[9px] font-mono opacity-50">—</span>
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
      {/* ── MODAL: Add / Edit Timetable Period Entry (Staff Only) ── */}
      {/* ========================================================================= */}
      {canEdit && (
        <Modal
          isOpen={isEntryModalOpen}
          onClose={() => setIsEntryModalOpen(false)}
          title={editingEntryId ? 'Edit Timetable Period' : 'Assign Timetable Period'}
        >
          <form onSubmit={handleEntrySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Day of Week <span className="text-error">*</span>
                </label>
                <select
                  value={entryForm.dayOfWeek}
                  onChange={(e) => setEntryForm({ ...entryForm, dayOfWeek: e.target.value })}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
                >
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Period Number <span className="text-error">*</span>
                </label>
                <select
                  value={entryForm.periodNumber}
                  onChange={(e) => setEntryForm({ ...entryForm, periodNumber: Number(e.target.value) })}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
                >
                  {periods.map((p) => <option key={p} value={p}>Period {p} ({periodTimings[p]})</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Subject <span className="text-error">*</span>
                </label>
                <button
                  type="button"
                  onClick={openAddSubjectModal}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  + New Subject
                </button>
              </div>
              <select
                required
                value={entryForm.subjectId}
                onChange={(e) => setEntryForm({ ...entryForm, subjectId: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subjectCode} - {s.subjectName || s.name} (Grade {s.gradeLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Teacher <span className="text-error">*</span>
              </label>
              <select
                required
                value={entryForm.teacherId}
                onChange={(e) => setEntryForm({ ...entryForm, teacherId: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
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
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Classroom / Room Number <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Science Lab 1, Room 204"
                value={entryForm.roomNumber}
                onChange={(e) => setEntryForm({ ...entryForm, roomNumber: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
              />
            </div>

            {modalError && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-semibold flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <div className="flex-1">
                  <span className="font-bold block mb-0.5">Scheduling Conflict:</span>
                  <span>{modalError}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-outline-variant/40 space-x-3">
              <button
                type="button"
                onClick={() => setIsEntryModalOpen(false)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingEntryId ? 'Update Period' : 'Assign Period'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* ── MODAL: Add / Edit Curriculum Subject (Staff Only) ── */}
      {/* ========================================================================= */}
      {canEdit && (
        <Modal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          title={editingSubjectId ? 'Edit Curriculum Subject' : 'Add New Curriculum Subject'}
        >
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Subject Code <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MATH-10, ICT-11, SCI-10"
                value={subjectForm.subjectCode}
                onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value.toUpperCase() })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface font-mono uppercase focus:ring-primary focus:border-primary"
              />
              <span className="text-[11px] text-on-surface-variant mt-0.5 block">Unique uppercase identifier for syllabus cataloging</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Subject Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Information & Communication Technology"
                value={subjectForm.subjectName}
                onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Target Grade Level <span className="text-error">*</span>
              </label>
              <select
                value={subjectForm.gradeLevel}
                onChange={(e) => setSubjectForm({ ...subjectForm, gradeLevel: Number(e.target.value) })}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest text-on-surface focus:ring-primary focus:border-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>

            {modalError && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-semibold">
                {modalError}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-outline-variant/40 space-x-3">
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingSubjectId ? 'Update Subject' : 'Create Subject'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Timetable;
