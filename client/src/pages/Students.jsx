import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../api/axios';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialForm = {
    admissionNumber: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'MALE',
    initialClassId: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchStudentsAndClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsRes, classesRes] = await Promise.all([
        api.get('/students'),
        api.get('/students/classes').catch(() => ({ data: [] })),
      ]);
      setStudents(studentsRes.data || []);
      setClasses(classesRes.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Failed to load students from server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndClasses();
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
        admissionNumber: formData.admissionNumber.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dob: formData.dob,
        gender: formData.gender,
        initialClassId: formData.initialClassId ? Number(formData.initialClassId) : null,
      };

      await api.post('/students', payload);
      setSuccess(`Student ${formData.firstName} ${formData.lastName} registered successfully!`);
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchStudentsAndClasses();
    } catch (err) {
      console.error('Failed to register student:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to register student. Please check the inputs.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"?`)) return;
    try {
      await api.delete(`/students/${id}`);
      setSuccess('Student deleted successfully.');
      fetchStudentsAndClasses();
    } catch (err) {
      console.error('Failed to delete student:', err);
      setError('Failed to delete student.');
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const admission = (s.admissionNumber || '').toLowerCase();
    const className = (s.currentClassName || '').toLowerCase();
    return fullName.includes(term) || admission.includes(term) || className.includes(term);
  });

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Admission #', accessor: 'admissionNumber' },
    {
      header: 'Name',
      cell: (row) => (
        <span className="font-medium text-gray-900">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      header: 'Gender',
      cell: (row) => (
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
          {row.gender}
        </span>
      ),
    },
    {
      header: 'Class',
      cell: (row) => (
        <span className="text-indigo-600 font-medium">
          {row.currentClassName || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Date of Birth',
      accessor: 'dob',
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-3">
          <button
            onClick={() => handleDelete(row.id, `${row.firstName} ${row.lastName}`)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Students Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and register enrolled students</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors font-medium text-sm flex items-center"
        >
          + Register Student
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
            placeholder="Search by name, admission #, or class..."
            className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-xs text-gray-500">
            Total: {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading students from database...</div>
        ) : (
          <DataTable columns={columns} data={filteredStudents} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Student">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Admission Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="admissionNumber"
              required
              placeholder="e.g. STD009"
              value={formData.admissionNumber}
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
                placeholder="e.g. Kasun"
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
                placeholder="e.g. Perera"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Initial Class Allocation</label>
            <select
              name="initialClassId"
              value={formData.initialClassId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Class (Optional) --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Grade {c.gradeLevel} - {c.stream || 'General'})
                </option>
              ))}
            </select>
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
              {submitting ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
