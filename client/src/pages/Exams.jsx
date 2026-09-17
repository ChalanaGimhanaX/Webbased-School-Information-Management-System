import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import api from '../api/axios';

const Exams = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialForm = {
    examName: '',
    term: 1,
    academicYear: new Date().getFullYear(),
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/exams');
      setExams(res.data || []);
    } catch (err) {
      console.error('Failed to load exams:', err);
      setError('Failed to load examinations from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        examName: formData.examName.trim(),
        term: parseInt(formData.term),
        academicYear: parseInt(formData.academicYear),
      };

      await api.post('/exams', payload);
      setSuccess(`Examination "${formData.examName}" created successfully!`);
      setFormData(initialForm);
      setActiveTab('list');
      fetchExams();
    } catch (err) {
      console.error('Failed to create exam:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create exam.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id, name) => {
    try {
      await api.patch(`/exams/${id}/publish`);
      setSuccess(`Examination "${name}" published successfully!`);
      fetchExams();
    } catch (err) {
      console.error('Failed to publish exam:', err);
      setError('Failed to publish exam results.');
    }
  };

  const getStatusBadge = (status) => {
    return status === 'PUBLISHED' ? (
      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Published</span>
    ) : (
      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">Draft</span>
    );
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Exam Name',
      cell: (row) => <span className="font-semibold text-gray-900">{row.examName}</span>,
    },
    {
      header: 'Term',
      cell: (row) => `Term ${row.term}`,
    },
    { header: 'Academic Year', accessor: 'academicYear' },
    { header: 'Status', cell: (row) => getStatusBadge(row.status) },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-3">
          {row.status === 'DRAFT' && (
            <button
              onClick={() => handlePublish(row.id, row.examName)}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Publish
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Examinations & Assessments</h2>
          <p className="text-sm text-gray-500 mt-1">Schedule exams, configure papers, and publish grade reports</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setActiveTab(activeTab === 'list' ? 'create' : 'list');
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors font-medium text-sm"
        >
          {activeTab === 'list' ? '+ Create New Exam' : '← Back to Exam List'}
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

      {activeTab === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading examinations from database...</div>
          ) : (
            <DataTable columns={columns} data={exams} />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-xl border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Examination</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Exam Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="examName"
                required
                placeholder="e.g. Mid Term Assessment 2026"
                value={formData.examName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Term <span className="text-red-500">*</span></label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={1}>Term 1</option>
                  <option value={2}>Term 2</option>
                  <option value={3}>Term 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Year <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="academicYear"
                  min="2024"
                  max="2030"
                  required
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Save & Draft Exam'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Exams;
