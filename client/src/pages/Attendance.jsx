import React, { useState } from 'react';

const Attendance = () => {
  const students = [
    { id: 1, name: 'John Doe', rollNo: '101' },
    { id: 2, name: 'Jane Smith', rollNo: '102' },
    { id: 3, name: 'Sam Wilson', rollNo: '103' },
  ];

  const [attendance, setAttendance] = useState({});

  const handleMark = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted attendance:', attendance);
    alert('Attendance marked successfully!');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option>10-A</option>
              <option>10-B</option>
              <option>11-A</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md">
              Load Students
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.rollNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-4">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          value="Present"
                          className="text-green-600 focus:ring-green-500"
                          onChange={() => handleMark(student.id, 'Present')}
                        />
                        <span className="text-sm text-gray-700">Present</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          value="Absent"
                          className="text-red-600 focus:ring-red-500"
                          onChange={() => handleMark(student.id, 'Absent')}
                        />
                        <span className="text-sm text-gray-700">Absent</span>
                      </label>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          value="Late"
                          className="text-yellow-600 focus:ring-yellow-500"
                          onChange={() => handleMark(student.id, 'Late')}
                        />
                        <span className="text-sm text-gray-700">Late</span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 flex justify-end">
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md">
              Submit Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Attendance;
