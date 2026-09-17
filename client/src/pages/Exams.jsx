import React, { useState } from 'react';
import DataTable from '../components/DataTable';

const Exams = () => {
  const [activeTab, setActiveTab] = useState('list');

  const exams = [
    { id: 1, title: 'Mid Term 2024', grade: '10', date: '2024-05-10', status: 'PUBLISHED' },
    { id: 2, title: 'Final Term 2024', grade: '11', date: '2024-11-20', status: 'DRAFT' },
  ];

  const getStatusBadge = (status) => {
    return status === 'PUBLISHED' ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Published</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>
    );
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Date', accessor: 'date' },
    { header: 'Status', cell: (row) => getStatusBadge(row.status) },
    {
      header: 'Actions',
      cell: () => (
        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-3">Manage</button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Examinations</h2>
        <button
          onClick={() => setActiveTab(activeTab === 'list' ? 'create' : 'list')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          {activeTab === 'list' ? 'Create Exam' : 'Back to List'}
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable columns={columns} data={exams} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Exam</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Title</label>
              <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Grade</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>10</option>
                  <option>11</option>
                  <option>12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
                Create & Draft
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Exams;
