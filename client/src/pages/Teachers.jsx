import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../api/axios';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialForm = {
    employeeNumber: '',
    firstName: '',
    lastName: '',
    qualification: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/teachers');
      setTeachers(res.data || []);
    } catch (err) {
      console.error('Failed to load teachers:', err);
      setError('Failed to load teachers from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        employeeNumber: formData.employeeNumber.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        qualification: formData.qualification.trim(),
        phone: formData.phone.trim(),
        hireDate: formData.hireDate || null,
      };

      await api.post('/teachers', payload);
      setSuccess(`Teacher ${formData.firstName} ${formData.lastName} registered successfully!`);
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchTeachers();
    } catch (err) {
      console.error('Failed to register teacher:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to register teacher.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${name}"?`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      setSuccess('Teacher deleted successfully.');
      fetchTeachers();
    } catch (err) {
      console.error('Failed to delete teacher:', err);
      setError('Failed to delete teacher.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'INACTIVE':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>;
      case 'ON_LEAVE':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">On Leave</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const term = search.toLowerCase();
    const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
    const empNo = (t.employeeNumber || '').toLowerCase();
    const qual = (t.qualification || '').toLowerCase();
    return fullName.includes(term) || empNo.includes(term) || qual.includes(term);
  });

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Employee #', accessor: 'employeeNumber' },
    {
      header: 'Name',
      cell: (row) => (
        <span className="font-medium text-gray-900">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    { header: 'Qualification', accessor: 'qualification' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Status', cell: (row) => getStatusBadge(row.status) },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => handleDelete(row.id, `${row.firstName} ${row.lastName}`)}
          className="text-red-600 hover:text-red-900 text-sm font-medium"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Teachers Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage academic faculty and teaching staff</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors font-medium text-sm flex items-center"
        >
          + Register Teacher
        </button>
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

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by name, employee #, or qualification..."
            className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-xs text-gray-500">
            Total: {filteredTeachers.length} {filteredTeachers.length === 1 ? 'teacher' : 'teachers'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading teachers from database...</div>
        ) : (
          <DataTable columns={columns} data={filteredTeachers} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Teacher">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employee Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employeeNumber"
              required
              placeholder="e.g. EMP007"
              value={formData.employeeNumber}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="e.g. Nimal"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                required
                placeholder="e.g. Fernando"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <input
              type="text"
              name="qualification"
              placeholder="e.g. BSc Mathematics, PGDE"
              value={formData.qualification}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 0771234567"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hire Date</label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Teacher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;
