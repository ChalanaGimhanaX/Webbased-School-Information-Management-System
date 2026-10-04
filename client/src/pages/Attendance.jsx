// Assigned module owner: IT25101863
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet' | 'reports'

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // Attendance Sheet state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [isRecordLocked, setIsRecordLocked] = useState(false);
  const [sheetSummary, setSheetSummary] = useState(null);

  // Reports state
  const [reportClassId, setReportClassId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [classReport, setClassReport] = useState(null);
  const [reportStudentId, setReportStudentId] = useState('');
  const [studentReport, setStudentReport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setStudents([]);
    setAttendance({});
    setCurrentRecordId(null);
    setIsExistingRecord(false);
    setIsRecordLocked(false);
    setSheetSummary(null);
  }, [selectedClassId, attendanceDate]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [cRes, tRes, sRes] = await Promise.all([
          api.get('/students/classes').catch(() => ({ data: [] })),
          api.get('/teachers').catch(() => ({ data: [] })),
          api.get('/students').catch(() => ({ data: [] })),
        ]);
        const cl = cRes.data || [];
        const tl = tRes.data || [];
        const sl = sRes.data || [];
        setClasses(cl);
        setTeachers(tl);
        setAllStudents(sl);
        if (cl.length > 0) {
          setSelectedClassId(cl[0].id);
          setReportClassId(cl[0].id);
        }
        if (tl.length > 0) setSelectedTeacherId(tl[0].id);
        if (sl.length > 0) setReportStudentId(sl[0].id);
      } catch (err) {
        console.error('Failed to init attendance dropdowns:', err);
      }
    };
    initData();
  }, []);

  // 1. Load attendance sheet (Checks if record already exists or loads fresh students)
  const loadAttendanceSheet = async () => {
    if (!selectedClassId) {
      setError('Please select a class first.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setIsExistingRecord(false);
      setCurrentRecordId(null);
      setIsRecordLocked(false);
      setSheetSummary(null);

      // 1. Fetch class students
      const studRes = await api.get(`/students/class/${selectedClassId}`);
      const studentList = studRes.data || [];
      setStudents(studentList);

      // 2. Check if attendance already marked for this class & date
      let existingRecord = null;
      try {
        const existRes = await api.get(`/attendance/class/${selectedClassId}?date=${attendanceDate}`);
        if (existRes.data?.id) {
          existingRecord = existRes.data;
        }
      } catch (e) {
        // No record exists yet
      }

      const initialMap = {};
      const initialRemarks = {};
      if (existingRecord) {
        setIsExistingRecord(true);
        setCurrentRecordId(existingRecord.id);
        setIsRecordLocked(Boolean(existingRecord.isLocked));
        existingRecord.entries.forEach((e) => {
          initialMap[e.studentId] = e.status;
          initialRemarks[e.studentId] = e.remarks || '';
        });
        setSuccess(`Loaded existing attendance record for ${attendanceDate} (Editing mode).`);
      } else {
        // Default everyone to PRESENT
        studentList.forEach((s) => {
          initialMap[s.id] = 'PRESENT';
        });
      }
      setAttendance(initialMap);
      setRemarks(initialRemarks);

      // Fetch summary if exists
      try {
        const sumRes = await api.get(`/attendance/class/${selectedClassId}/summary?date=${attendanceDate}`);
        setSheetSummary(sumRes.data);
      } catch {
        // Ignored
      }
    } catch (err) {
      console.error('Failed to load students for class:', err);
      setError('Could not load students for the selected class.');
    } finally {
      setLoading(false);
    }
  };

  const handleMark = (id, status) => {
    if (isRecordLocked) return;
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleDeleteAttendance = async () => {
    if (!currentRecordId || isRecordLocked) return;
    if (!window.confirm(`Delete attendance record for ${attendanceDate}?`)) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      await api.delete(`/attendance/${currentRecordId}`);
      setStudents([]);
      setAttendance({});
      setSheetSummary(null);
      setIsExistingRecord(false);
      setCurrentRecordId(null);
      setIsRecordLocked(false);
      setSuccess(`Attendance record for ${attendanceDate} was deleted.`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete attendance record.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRecordLocked) return;
    if (!selectedClassId || !selectedTeacherId || students.length === 0) {
      setError('Ensure class, teacher, and students are loaded.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const entries = students.filter(s => attendance[s.id]).map((s) => ({
        studentId: s.id,
        status: attendance[s.id] || 'PRESENT',
        remarks: remarks[s.id] || '',
      }));

      const payload = {
        classId: Number(selectedClassId),
        teacherId: Number(selectedTeacherId),
        attendanceDate: attendanceDate,
        academicYear: new Date(attendanceDate).getFullYear(),
        entries: entries,
      };

      await api.post('/attendance', payload);
      setSuccess(`Attendance successfully saved for ${students.length} students on ${attendanceDate}!`);
      loadAttendanceSheet();
    } catch (err) {
      console.error('Failed to submit attendance:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit attendance.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Fetch Class Attendance Report
  const fetchClassReport = async () => {
    if (!reportClassId) return;
    try {
      setError('');
      const res = await api.get(`/attendance/class/${reportClassId}/summary?date=${reportDate}`);
      setClassReport(res.data);
    } catch (err) {
      setError('No attendance record found for this class and date.');
      setClassReport(null);
    }
  };

  // 3. Fetch Student Attendance Report
  const fetchStudentReport = async () => {
    if (!reportStudentId) return;
    try {
      setError('');
      const res = await api.get(`/attendance/student/${reportStudentId}/summary`);
      setStudentReport(res.data);
    } catch (err) {
      setError('Could not fetch student attendance summary.');
      setStudentReport(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      if (reportClassId) fetchClassReport();
      if (reportStudentId) fetchStudentReport();
    }
  }, [activeTab]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Attendance Management</h2>
          <p className="text-sm text-gray-500 mt-1">Digitally record daily class attendance, correct past entries, and generate reports</p>
        </div>
        <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('sheet'); setError(''); setSuccess(''); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'sheet' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily Sheet
          </button>
          <button
            onClick={() => { setActiveTab('reports'); setError(''); setSuccess(''); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Attendance Reports
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{success}</div>}

      {/* ── TAB 1: Daily Sheet ── */}
      {activeTab === 'sheet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} (Grade {c.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Supervising Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Attendance Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={loadAttendanceSheet}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load Attendance Sheet'}
                </button>
              </div>
            </div>
          </div>

          {isExistingRecord && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-xs flex justify-between items-center">
              <span>
                ℹ️ Attendance for this class on <strong>{attendanceDate}</strong> is already recorded. You can modify any student's status below and submit to save corrections.
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold px-2 py-0.5 bg-blue-200 text-blue-900 rounded">
                  {isRecordLocked ? 'Locked' : 'Edit Mode'}
                </span>
                {!isRecordLocked && (
                  <button
                    type="button"
                    onClick={handleDeleteAttendance}
                    disabled={submitting}
                    className="px-2 py-1 bg-white border border-red-200 text-red-600 rounded text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete Record
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
            <form onSubmit={handleSubmit}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason / Correction</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {student.admissionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-wrap justify-center gap-3">
                          <label className="flex items-center gap-1"><input type="radio" name={`status-${student.id}`} checked={attendance[student.id] === 'EXCUSED'} disabled={isRecordLocked || submitting} onChange={() => handleMark(student.id, 'EXCUSED')} /><span className="text-xs">Excused</span></label>
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`status-${student.id}`}
                              value="PRESENT"
                              checked={attendance[student.id] === 'PRESENT'}
                              className="text-green-600 focus:ring-green-500"
                              disabled={isRecordLocked || submitting}
                              onChange={() => handleMark(student.id, 'PRESENT')}
                            />
                            <span className="text-xs font-semibold text-green-700">Present</span>
                          </label>
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`status-${student.id}`}
                              value="ABSENT"
                              checked={attendance[student.id] === 'ABSENT'}
                              className="text-red-600 focus:ring-red-500"
                              disabled={isRecordLocked || submitting}
                              onChange={() => handleMark(student.id, 'ABSENT')}
                            />
                            <span className="text-xs font-semibold text-red-700">Absent</span>
                          </label>
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`status-${student.id}`}
                              value="LATE"
                              checked={attendance[student.id] === 'LATE'}
                              className="text-yellow-600 focus:ring-yellow-500"
                              disabled={isRecordLocked || submitting}
                              onChange={() => handleMark(student.id, 'LATE')}
                            />
                            <span className="text-xs font-semibold text-yellow-700">Late</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <input aria-label={`Absence reason for ${student.firstName}`} maxLength={255} className="border rounded px-2 py-1 w-40" value={remarks[student.id] || ''} disabled={isRecordLocked || submitting} onChange={e => setRemarks({...remarks,[student.id]:e.target.value})} />
                        {currentRecordId && attendance[student.id] && !isRecordLocked && <button type="button" disabled={submitting} className="block text-red-700 text-xs mt-2" onClick={async () => {
                          if (!window.confirm('Remove this student attendance entry?')) return;
                          try { await api.delete(`/attendance/${currentRecordId}/students/${student.id}`); await loadAttendanceSheet(); }
                          catch (err) { setError(err.response?.data?.detail || 'Could not remove attendance entry'); }
                        }}>Remove Entry</button>}
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                        Select a class and click "Load Attendance Sheet" to record or edit daily attendance.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {students.length > 0 && (
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Students: <strong>{students.length}</strong> | 
                    Present: <strong className="text-green-600">{Object.values(attendance).filter(s => s === 'PRESENT').length}</strong> | 
                    Absent: <strong className="text-red-600">{Object.values(attendance).filter(s => s === 'ABSENT').length}</strong> | 
                    Late: <strong className="text-yellow-600">{Object.values(attendance).filter(s => s === 'LATE').length}</strong>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? 'Saving...' : isExistingRecord ? 'Update Attendance Sheet' : 'Submit Attendance Sheet'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 2: Attendance Reports ── */}
      {activeTab === 'reports' && (
        <div className="space-y-8">
          {/* Class Daily Report */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Class Attendance Daily Summary</h3>
            <div className="flex flex-wrap items-end gap-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Class</label>
                <select
                  value={reportClassId}
                  onChange={(e) => setReportClassId(e.target.value)}
                  className="mt-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.className} (Grade {c.gradeLevel})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Date</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="mt-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
              </div>
              <button
                onClick={fetchClassReport}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
              >
                Generate Summary
              </button>
            </div>

            {classReport ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="bg-white p-3 rounded shadow-xs">
                  <span className="text-xs text-gray-400 font-semibold">Total Students</span>
                  <p className="text-xl font-bold text-gray-800">{classReport.totalStudents}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-xs">
                  <span className="text-xs text-gray-400 font-semibold">Present Count</span>
                  <p className="text-xl font-bold text-green-600">{classReport.presentCount}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-xs">
                  <span className="text-xs text-gray-400 font-semibold">Absent Count</span>
                  <p className="text-xl font-bold text-red-600">{classReport.absentCount}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-xs">
                  <span className="text-xs text-gray-400 font-semibold">Attendance Rate</span>
                  <p className="text-xl font-bold text-indigo-600">
                    {classReport.totalStudents > 0 ? Math.round((classReport.presentCount / classReport.totalStudents) * 100) : 0}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Select a class and date to view the official daily summary.</p>
            )}
          </div>

          {/* Student Longitudinal Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Individual Student Attendance Profile</h3>
            <div className="flex flex-wrap items-end gap-3 mb-6">
              <div className="w-80">
                <label className="block text-xs font-semibold text-gray-600 uppercase">Select Student</label>
                <select
                  value={reportStudentId}
                  onChange={(e) => setReportStudentId(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                >
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.admissionNumber} — {s.firstName} {s.lastName} ({s.currentClassName || 'No Class'})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={fetchStudentReport}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium"
              >
                View Profile
              </button>
            </div>

            {studentReport ? (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold">Total Days Recorded</span>
                    <p className="text-xl font-bold text-gray-800">{studentReport.totalDays}</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold">Days Present</span>
                    <p className="text-xl font-bold text-green-600">{studentReport.presentDays}</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold">Days Absent</span>
                    <p className="text-xl font-bold text-red-600">{studentReport.absentDays}</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold">Attendance Rate</span>
                    <p className="text-xl font-bold text-indigo-600">{studentReport.attendancePercentage}%</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Performance Rating:</span>
                    <span className="font-semibold text-green-700">
                      {studentReport.attendancePercentage >= 80 ? 'Satisfactory Attendance' : 'Attendance Warning'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${studentReport.attendancePercentage >= 80 ? 'bg-green-600' : 'bg-red-500'}`}
                      style={{ width: `${studentReport.attendancePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Select a student to view their cumulative attendance profile.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
