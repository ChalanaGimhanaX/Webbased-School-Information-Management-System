import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          api.get('/students/classes').catch(() => ({ data: [] })),
          api.get('/teachers').catch(() => ({ data: [] })),
        ]);
        setClasses(cRes.data || []);
        setTeachers(tRes.data || []);
        if (cRes.data?.length > 0) setSelectedClassId(cRes.data[0].id);
        if (tRes.data?.length > 0) setSelectedTeacherId(tRes.data[0].id);
      } catch (err) {
        console.error('Failed to init attendance dropdowns:', err);
      }
    };
    initData();
  }, []);

  const loadStudents = async () => {
    if (!selectedClassId) {
      setError('Please select a class first.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await api.get(`/students/class/${selectedClassId}`);
      const list = res.data || [];
      setStudents(list);

      // Default all loaded students to PRESENT
      const initialMap = {};
      list.forEach((s) => {
        initialMap[s.id] = 'PRESENT';
      });
      setAttendance(initialMap);
    } catch (err) {
      console.error('Failed to load students for class:', err);
      setError('Could not load students for the selected class.');
    } finally {
      setLoading(false);
    }
  };

  const handleMark = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedTeacherId || students.length === 0) {
      setError('Ensure class, teacher, and students are loaded.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const entries = students.map((s) => ({
        studentId: s.id,
        status: attendance[s.id] || 'PRESENT',
        remarks: '',
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
    } catch (err) {
      console.error('Failed to submit attendance:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit attendance.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Attendance</h2>
        <p className="text-sm text-gray-500 mt-1">Record daily attendance sheets for academic classes</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
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
                  {c.name} (Grade {c.gradeLevel})
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
              onClick={loadStudents}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Students'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <form onSubmit={handleSubmit}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
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
                    <div className="flex justify-center space-x-6">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          value="PRESENT"
                          checked={attendance[student.id] === 'PRESENT'}
                          className="text-green-600 focus:ring-green-500"
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
                          onChange={() => handleMark(student.id, 'LATE')}
                        />
                        <span className="text-xs font-semibold text-yellow-700">Late</span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">
                    Select a class and click "Load Students" above to record attendance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {students.length > 0 && (
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Saving...' : 'Submit Attendance Sheet'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Attendance;
