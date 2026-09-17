import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../api/axios';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);

  // Forms
  const initialRegisterForm = {
    admissionNumber: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'MALE',
    initialClassId: '',
  };
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', dob: '', gender: 'MALE' });

  const [allocatingStudent, setAllocatingStudent] = useState(null);
  const [allocateClassId, setAllocateClassId] = useState('');

  const [classForm, setClassForm] = useState({
    gradeLevel: 10,
    className: '',
    academicYear: new Date().getFullYear(),
    capacity: 35,
  });

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
      setError('Failed to load students from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndClasses();
  }, []);

  const flash = (msg) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 4000);
  };

  // 1. CREATE Student
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        admissionNumber: registerForm.admissionNumber.trim(),
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        dob: registerForm.dob,
        gender: registerForm.gender,
        initialClassId: registerForm.initialClassId ? Number(registerForm.initialClassId) : null,
      };

      await api.post('/students', payload);
      flash(`Student ${payload.firstName} ${payload.lastName} registered successfully!`);
      setIsRegisterOpen(false);
      setRegisterForm(initialRegisterForm);
      fetchStudentsAndClasses();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to register student.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. UPDATE Student details
  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      dob: student.dob || '',
      gender: student.gender || 'MALE',
    });
    setError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        dob: editForm.dob,
        gender: editForm.gender,
      };
      await api.put(`/students/${editingStudent.id}`, payload);
      flash(`Student ${payload.firstName} updated successfully!`);
      setIsEditOpen(false);
      fetchStudentsAndClasses();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update student.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. ALLOCATE / RE-ASSIGN Class
  const openAllocateModal = (student) => {
    setAllocatingStudent(student);
    setAllocateClassId('');
    setError('');
    setIsAllocateModalOpen(true);
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocatingStudent || !allocateClassId) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/students/allocate', {
        studentId: allocatingStudent.id,
        classId: Number(allocateClassId),
        academicYear: new Date().getFullYear(),
      });
      flash(`Class allocation updated for ${allocatingStudent.firstName}!`);
      setIsAllocateModalOpen(false);
      fetchStudentsAndClasses();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to allocate class.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. CREATE Class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        gradeLevel: parseInt(classForm.gradeLevel),
        className: classForm.className.trim(),
        academicYear: parseInt(classForm.academicYear),
        capacity: parseInt(classForm.capacity) || 35,
      };
      await api.post('/students/classes', payload);
      flash(`Class "${payload.className}" created successfully!`);
      setIsClassModalOpen(false);
      setClassForm({ gradeLevel: 10, className: '', academicYear: new Date().getFullYear(), capacity: 35 });
      fetchStudentsAndClasses();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create class.');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. DELETE Student
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"? This will deactivate/remove their records.`)) return;
    try {
      await api.delete(`/students/${id}`);
      flash(`Student "${name}" deleted.`);
      fetchStudentsAndClasses();
    } catch (err) {
      setError('Failed to delete student.');
    }
  };

  // Filter & Search
  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const admission = (s.admissionNumber || '').toLowerCase();
    const className = (s.currentClassName || '').toLowerCase();
    const matchesSearch = fullName.includes(term) || admission.includes(term) || className.includes(term);

    if (selectedGrade === 'ALL') return matchesSearch;
    return matchesSearch && s.currentGrade === Number(selectedGrade);
  });

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Admission #', accessor: 'admissionNumber' },
    {
      header: 'Student Name',
      cell: (r) => (
        <span className="font-semibold text-gray-900">
          {r.firstName} {r.lastName}
        </span>
      ),
    },
    {
      header: 'Gender',
      cell: (r) => (
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
          {r.gender}
        </span>
      ),
    },
    {
      header: 'Enrolled Class',
      cell: (r) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          {r.currentClassName || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'DOB',
      accessor: 'dob',
    },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(r)}
            className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold px-2 py-1 bg-indigo-50 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => openAllocateModal(r)}
            className="text-blue-600 hover:text-blue-900 text-xs font-semibold px-2 py-1 bg-blue-50 rounded"
          >
            Class
          </button>
          <button
            onClick={() => handleDelete(r.id, `${r.firstName} ${r.lastName}`)}
            className="text-red-600 hover:text-red-900 text-xs font-semibold px-2 py-1 bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student & Class Management</h2>
          <p className="text-sm text-gray-500 mt-1">Register students, manage profiles, organize classes, and handle allocations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => { setError(''); setIsClassModalOpen(true); }}
            className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors"
          >
            + Create Class
          </button>
          <button
            onClick={() => { setError(''); setIsRegisterOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors"
          >
            + Register Student
          </button>
        </div>
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

      {/* Class Statistics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-xs font-semibold uppercase text-gray-400">Total Students</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{students.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-xs font-semibold uppercase text-gray-400">Total Classes</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{classes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-xs font-semibold uppercase text-gray-400">Assigned to Class</span>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {students.filter(s => s.currentClassName).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-xs font-semibold uppercase text-gray-400">Unassigned</span>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {students.filter(s => !s.currentClassName).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by student name, admission #, or class..."
              className="w-full sm:w-80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">All Grades</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
              <option value="13">Grade 13</option>
            </select>
          </div>
          <span className="text-xs text-gray-500">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading students from database...</div>
        ) : (
          <DataTable columns={columns} data={filteredStudents} />
        )}
      </div>

      {/* ── MODAL: Register Student ── */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register New Student">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Admission Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. STD010"
              value={registerForm.admissionNumber}
              onChange={(e) => setRegisterForm({ ...registerForm, admissionNumber: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={registerForm.firstName}
                onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={registerForm.lastName}
                onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={registerForm.dob}
                onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
              <select
                value={registerForm.gender}
                onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
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
              value={registerForm.initialClassId}
              onChange={(e) => setRegisterForm({ ...registerForm, initialClassId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Class (Optional) --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Grade {c.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t space-x-3">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Edit Student ── */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Student: ${editingStudent?.admissionNumber}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t space-x-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Class Allocation ── */}
      <Modal isOpen={isAllocateModalOpen} onClose={() => setIsAllocateModalOpen(false)} title={`Assign Class: ${allocatingStudent?.firstName} ${allocatingStudent?.lastName}`}>
        <form onSubmit={handleAllocateSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Current Class: <strong className="text-indigo-600">{allocatingStudent?.currentClassName || 'None'}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select New Class <span className="text-red-500">*</span></label>
            <select
              required
              value={allocateClassId}
              onChange={(e) => setAllocateClassId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Grade {c.gradeLevel})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end pt-4 border-t space-x-3">
            <button
              type="button"
              onClick={() => setIsAllocateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Create Class ── */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Create New Academic Class">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Class Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Grade 10-C"
              value={classForm.className}
              onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade Level <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                max="13"
                required
                value={classForm.gradeLevel}
                onChange={(e) => setClassForm({ ...classForm, gradeLevel: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Year <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                value={classForm.academicYear}
                onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Capacity</label>
            <input
              type="number"
              value={classForm.capacity}
              onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end pt-4 border-t space-x-3">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
