import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const Teachers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teachers = [
    { id: 1, empNo: 'T001', name: 'Alice Johnson', qual: 'MSc Mathematics', status: 'ACTIVE' },
    { id: 2, empNo: 'T002', name: 'Bob Brown', qual: 'BSc Science', status: 'ON_LEAVE' },
    { id: 3, empNo: 'T003', name: 'Charlie Davis', qual: 'MA English', status: 'INACTIVE' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'INACTIVE':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>;
      case 'ON_LEAVE':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">On Leave</span>;
      default:
        return null;
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Employee #', accessor: 'empNo' },
    { header: 'Name', accessor: 'name' },
    { header: 'Qualification', accessor: 'qual' },
    { header: 'Status', cell: (row) => getStatusBadge(row.status) },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Teachers Directory</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Register Teacher
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <DataTable columns={columns} data={teachers} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Teacher">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
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

export default Teachers;
