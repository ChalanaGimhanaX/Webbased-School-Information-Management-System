// Assigned module owner: IT25102861
import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../api/axios';
import RecordMaintenance from '../components/RecordMaintenance';
import TeacherAssignments from '../components/TeacherAssignments';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Forms
  const initialRegisterForm = {
    employeeNumber: '',
    firstName: '',
    lastName: '',
    qualification: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
  };
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    qualification: '',
    phone: '',
    hireDate: '',
  });

  const [assignTeacher, setAssignTeacher] = useState(null);
  const [assignForm, setAssignForm] = useState({
    subjectId: '',
    classId: '',
    academicYear: new Date().getFullYear(),
  });

  const [subjectForm, setSubjectForm] = useState({
    subjectCode: '',
    subjectName: '',
    gradeLevel: 10,
  });

  const fetchDependencies = async () => {
    try {
      setLoading(true);
      setError('');
      const [teachersRes, subjectsRes, classesRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/teachers/subjects').catch(() => ({ data: [] })),
        api.get('/students/classes').catch(() => ({ data: [] })),
      ]);
      setTeachers(teachersRes.data || []);
      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
    } catch (err) {
      console.error('Failed to load teachers:', err);
      setError('Failed to load teachers from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  const flash = (msg) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 4000);
  };

  // 1. CREATE Teacher
  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        employeeNumber: registerForm.employeeNumber.trim(),
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        qualification: registerForm.qualification.trim() || null,
        phone: registerForm.phone.trim() || null,
        hireDate: registerForm.hireDate,
      };
      await api.post('/teachers', payload);
      flash(`Teacher ${payload.firstName} ${payload.lastName} registered successfully!`);
      setIsRegisterOpen(false);
      setRegisterForm(initialRegisterForm);
      fetchDependencies();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to register teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. UPDATE Teacher
  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setEditForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      qualification: teacher.qualification || '',
      phone: teacher.phone || '',
      hireDate: teacher.hireDate || '',
    });
    setError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        qualification: editForm.qualification.trim() || null,
        phone: editForm.phone.trim() || null,
        hireDate: editForm.hireDate || null,
      };
      await api.put(`/teachers/${editingTeacher.id}`, payload);
      flash(`Teacher ${payload.firstName} updated successfully!`);
      setIsEditOpen(false);
      fetchDependencies();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. CHANGE STATUS (Active / On Leave / Inactive)
  const handleStatusChange = async (teacherId, newStatus) => {
    try {
      await api.patch(`/teachers/${teacherId}/status?status=${newStatus}`);
      flash(`Teacher status updated to ${newStatus}.`);
      fetchDependencies();
    } catch (err) {
      setError('Failed to update teacher status.');
    }
  };

  // 4. ASSIGN SUBJECT & CLASS
  const openAssignModal = (teacher) => {
    setAssignTeacher(teacher);
    setAssignForm({
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      classId: classes.length > 0 ? classes[0].id : '',
      academicYear: new Date().getFullYear(),
    });
    setError('');
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignTeacher || !assignForm.subjectId || !assignForm.classId) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/teachers/assign-subject', {
        teacherId: assignTeacher.id,
        subjectId: Number(assignForm.subjectId),
        classId: Number(assignForm.classId),
        academicYear: Number(assignForm.academicYear),
      });
      flash(`Assigned subject to ${assignTeacher.firstName} successfully!`);
      setIsAssignOpen(false);
      fetchDependencies();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to assign subject.');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. CREATE SUBJECT
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        subjectCode: subjectForm.subjectCode.trim(),
        subjectName: subjectForm.subjectName.trim(),
        gradeLevel: parseInt(subjectForm.gradeLevel),
      };
      await api.post('/teachers/subjects', payload);
      flash(`Subject "${payload.subjectName}" created!`);
      setIsSubjectModalOpen(false);
      setSubjectForm({ subjectCode: '', subjectName: '', gradeLevel: 10 });
      fetchDependencies();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create subject.');
    } finally {
      setSubmitting(false);
    }
  };

  // 6. DELETE Teacher
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete teacher "${name}"?`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      flash(`Teacher "${name}" removed.`);
      fetchDependencies();
    } catch (err) {
      setError('Failed to delete teacher.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 font-medium">Active</span>;
      case 'INACTIVE':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 font-medium">Inactive</span>;
      case 'ON_LEAVE':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">On Leave</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">{status}</span>;
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const term = search.toLowerCase();
    const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
    const empNo = (t.employeeNumber || '').toLowerCase();
    const qual = (t.qualification || '').toLowerCase();
    const matchesSearch = fullName.includes(term) || empNo.includes(term) || qual.includes(term);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Employee #', accessor: 'employeeNumber' },
    {
      header: 'Name',
      cell: (r) => (
        <span className="font-semibold text-gray-900">
          {r.firstName} {r.lastName}
        </span>
      ),
    },
    { header: 'Qualification', accessor: 'qualification' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Status',
      cell: (r) => (
        <div className="flex items-center space-x-2">
          {getStatusBadge(r.status)}
          <select
            value={r.status}
            onChange={(e) => handleStatusChange(r.id, e.target.value)}
            className="text-[11px] border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-600 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ACTIVE">Set Active</option>
            <option value="ON_LEAVE">Set On Leave</option>
            <option value="INACTIVE">Set Inactive</option>
          </select>
        </div>
      ),
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
            onClick={() => openAssignModal(r)}
            className="text-blue-600 hover:text-blue-900 text-xs font-semibold px-2 py-1 bg-blue-50 rounded"
          >
            Assign
          </button>
          <button
            onClick={() => handleDelete(r.id, `${r.firstName} ${r.lastName}`)}
            className="text-red-600 hover:text-red-900 text-xs font-semibold px-2 py-1 bg-red-50 rounded"
          >
            Deactivate
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <TeacherAssignments teachers={teachers} subjects={subjects} classes={classes} />
      <RecordMaintenance title="Subjects" rows={subjects}
        columns={[{header:'Code',accessor:'subjectCode'},{header:'Subject',accessor:'subjectName'},{header:'Grade',accessor:'gradeLevel'}]}
        fields={[{name:'subjectCode',label:'Code'},{name:'subjectName',label:'Subject name'},{name:'gradeLevel',label:'Grade',type:'number',min:1,max:13}]}
        onSave={async (r,values) => { await api.put(`/teachers/subjects/${r.id}`,values); await fetchDependencies(); }} />
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Teacher & Staff Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage staff profiles, subject allocations, qualifications, and operational statuses</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => { setError(''); setIsSubjectModalOpen(true); }}
            className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors"
          >
            + Create Subject
          </button>
          <button
            onClick={() => { setError(''); setIsRegisterOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors"
          >
            + Register Teacher
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{success}</div>}

      {/* Staff Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-xs font-semibold uppercase text-gray-400">Total Teachers</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{teachers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-xs font-semibold uppercase text-gray-400">Active Staff</span>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {teachers.filter(t => t.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-xs font-semibold uppercase text-gray-400">On Leave</span>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {teachers.filter(t => t.status === 'ON_LEAVE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <span className="text-xs font-semibold uppercase text-gray-400">Curriculum Subjects</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{subjects.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, emp #, or qualification..."
              className="w-full sm:w-80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <span className="text-xs text-gray-500">
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading teachers from database...</div>
        ) : (
          <DataTable columns={columns} data={filteredTeachers} />
        )}
      </div>

      {/* ── MODAL: Register Teacher ── */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register New Teacher">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. EMP-2026-005"
              value={registerForm.employeeNumber}
              onChange={(e) => setRegisterForm({ ...registerForm, employeeNumber: e.target.value })}
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <input
              type="text"
              placeholder="e.g. B.Sc. Mathematics, PGDE"
              value={registerForm.qualification}
              onChange={(e) => setRegisterForm({ ...registerForm, qualification: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                placeholder="0771234567"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hire Date</label>
              <input
                type="date"
                value={registerForm.hireDate}
                onChange={(e) => setRegisterForm({ ...registerForm, hireDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
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
              {submitting ? 'Registering...' : 'Register Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Edit Teacher ── */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Teacher: ${editingTeacher?.employeeNumber}`}>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Qualification</label>
            <input
              type="text"
              value={editForm.qualification}
              onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hire Date</label>
              <input
                type="date"
                value={editForm.hireDate}
                onChange={(e) => setEditForm({ ...editForm, hireDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
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
              {submitting ? 'Updating...' : 'Update Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Assign Subject & Class ── */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title={`Assign Subject to: ${assignTeacher?.firstName} ${assignTeacher?.lastName}`}>
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject <span className="text-red-500">*</span></label>
            <select
              required
              value={assignForm.subjectId}
              onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectCode} - {s.subjectName} (Grade {s.gradeLevel})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Class <span className="text-red-500">*</span></label>
            <select
              required
              value={assignForm.classId}
              onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className} (Grade {c.gradeLevel})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Academic Year</label>
            <input
              type="number"
              value={assignForm.academicYear}
              onChange={(e) => setAssignForm({ ...assignForm, academicYear: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end pt-4 border-t space-x-3">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Create Subject ── */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Create New Curriculum Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Code <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. MAT-10"
              value={subjectForm.subjectCode}
              onChange={(e) => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Pure Mathematics"
              value={subjectForm.subjectName}
              onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade Level <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1"
              max="13"
              required
              value={subjectForm.gradeLevel}
              onChange={(e) => setSubjectForm({ ...subjectForm, gradeLevel: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end pt-4 border-t space-x-3">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;
