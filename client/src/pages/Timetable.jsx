import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [entries, setEntries] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [teachersMap, setTeachersMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, sRes, tRes] = await Promise.all([
          api.get('/students/classes').catch(() => ({ data: [] })),
          api.get('/teachers/subjects').catch(() => ({ data: [] })),
          api.get('/teachers').catch(() => ({ data: [] })),
        ]);

        const cl = cRes.data || [];
        setClasses(cl);
        if (cl.length > 0) {
          setSelectedClassId(cl[0].id);
        }

        const sMap = {};
        (sRes.data || []).forEach((s) => {
          sMap[s.id] = s.subjectName || s.name || `Subject #${s.id}`;
        });
        setSubjectsMap(sMap);

        const tMap = {};
        (tRes.data || []).forEach((t) => {
          tMap[t.id] = `${t.firstName} ${t.lastName}`;
        });
        setTeachersMap(tMap);
      } catch (err) {
        console.error('Failed to load initial timetable dependencies:', err);
      }
    };

    fetchDropdowns();
  }, []);

  const fetchTimetable = async (classId) => {
    if (!classId) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/timetables/class/${classId}`);
      const timetableList = res.data || [];
      if (timetableList.length > 0) {
        setEntries(timetableList[0].entries || []);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error('Failed to load timetable for class:', err);
      setError('Could not retrieve timetable for this class.');
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

  // Build lookup index: "DAY-PERIOD" -> entry
  const scheduleLookup = {};
  entries.forEach((entry) => {
    const key = `${entry.dayOfWeek?.toUpperCase()}-${entry.periodNumber}`;
    scheduleLookup[key] = entry;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Timetable</h2>
          <p className="text-sm text-gray-500 mt-1">Weekly schedule of periods, rooms, and subject allocations</p>
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
                {c.name} (Grade {c.gradeLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

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
                  <th key={p} className="px-3 py-3 border text-center text-xs font-semibold text-gray-600 uppercase">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {days.map((day) => (
                <tr key={day}>
                  <td className="px-4 py-3 border text-xs font-bold text-gray-900 bg-gray-50 uppercase">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const cell = scheduleLookup[`${day}-${p}`];
                    return (
                      <td key={p} className="px-2 py-2 border text-center min-w-[130px] align-top">
                        {cell ? (
                          <div className="p-2 bg-indigo-50 rounded border border-indigo-100 text-left">
                            <div className="font-bold text-indigo-800 text-xs truncate">
                              {subjectsMap[cell.subjectId] || `Subject #${cell.subjectId}`}
                            </div>
                            <div className="text-gray-600 text-[11px] truncate mt-0.5">
                              {teachersMap[cell.teacherId] || `Teacher #${cell.teacherId}`}
                            </div>
                            <div className="text-gray-400 text-[10px] mt-0.5">
                              Room {cell.roomNumber || 'TBD'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">-</span>
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
    </div>
  );
};

export default Timetable;
