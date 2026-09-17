import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const Fees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const feeStructures = [
    { id: 1, grade: '10', term: 'Term 1', amount: '$500' },
    { id: 2, grade: '11', term: 'Term 1', amount: '$550' },
  ];

  const studentAccounts = [
    { id: 1, name: 'John Doe', grade: '10', status: 'PAID', balance: '$0' },
    { id: 2, name: 'Jane Smith', grade: '10', status: 'PENDING', balance: '$500' },
  ];

  const columnsStruct = [
    { header: 'Grade', accessor: 'grade' },
    { header: 'Term', accessor: 'term' },
    { header: 'Amount', accessor: 'amount' },
  ];

  const columnsAccounts = [
    { header: 'Student Name', accessor: 'name' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Balance', accessor: 'balance' },
    { 
      header: 'Status', 
      cell: (row) => row.status === 'PAID' ? 
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span> : 
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span> 
    },
    {
      header: 'Actions',
      cell: () => (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          Add Payment
        </button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Fee Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Structures</h3>
          <DataTable columns={columnsStruct} data={feeStructures} />
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Student Accounts</h3>
            <input 
              type="text" 
              placeholder="Search student..." 
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
          <DataTable columns={columnsAccounts} data={studentAccounts} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Payment">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
            <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reference / Receipt No</label>
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
              Submit Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;
