import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const Students = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Dummy data
  const students = [
    { id: 1, admissionNo: 'A001', name: 'John Doe', grade: '10', class: '10-A' },
    { id: 2, admissionNo: 'A002', name: 'Jane Smith', grade: '10', class: '10-B' },
    { id: 3, admissionNo: 'A003', name: 'Sam Wilson', grade: '11', class: '11-A' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Admission #', accessor: 'admissionNo' },
    { header: 'Name', accessor: 'name' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Class', accessor: 'class' },
    {
      header: 'Actions',
      cell: () => (
        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Students Directory</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Register Student
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search students..."
            className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DataTable columns={columns} data={students} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Student">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
