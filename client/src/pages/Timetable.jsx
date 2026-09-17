import React from 'react';

const Timetable = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const dummySchedule = {
    'Monday-1': { subject: 'Math', teacher: 'T001', room: '101' },
    'Monday-2': { subject: 'Science', teacher: 'T002', room: '102' },
    'Tuesday-1': { subject: 'English', teacher: 'T003', room: '103' },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Class Timetable</h2>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
            <option>10-A</option>
            <option>10-B</option>
            <option>11-A</option>
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            View
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase">Day / Period</th>
              {periods.map((p) => (
                <th key={p} className="px-4 py-3 border text-center text-xs font-medium text-gray-500 uppercase">
                  Period {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {days.map((day) => (
              <tr key={day}>
                <td className="px-4 py-4 border text-sm font-medium text-gray-900 bg-gray-50">
                  {day}
                </td>
                {periods.map((p) => {
                  const cell = dummySchedule[`${day}-${p}`];
                  return (
                    <td key={p} className="px-2 py-2 border text-center min-w-[120px]">
                      {cell ? (
                        <div className="p-2 bg-indigo-50 rounded-md text-xs">
                          <div className="font-bold text-indigo-700">{cell.subject}</div>
                          <div className="text-gray-600">{cell.teacher}</div>
                          <div className="text-gray-500">Room {cell.room}</div>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
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
  );
};

export default Timetable;
