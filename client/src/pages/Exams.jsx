// Assigned module owner: IT25103724
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import RecordMaintenance from '../components/RecordMaintenance';

// auto-grade logic
const calculateGrade = (marks, maximum = 100) => {
  if (marks === '' || marks === null || marks === undefined) return { grade: '', remarks: '' };
  const m = parseFloat(marks) * 100 / maximum;
  if (isNaN(m)) return { grade: '', remarks: '' };
  if (m >= 90) return { grade: 'A+', remarks: 'Distinction' };
  if (m >= 75) return { grade: 'A', remarks: 'Distinction' };
  if (m >= 65) return { grade: 'B', remarks: 'Very Good' };
  if (m >= 50) return { grade: 'C', remarks: 'Credit' };
  if (m >= 35) return { grade: 'S', remarks: 'Simple Pass' };
  return { grade: 'F', remarks: 'Repeat' };
};

export default function Exams() {
  const [activeTab, setActiveTab] = useState('exams');
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);

  // Tab 1 state
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examForm, setExamForm] = useState({ examName: '', term: '1', academicYear: new Date().getFullYear().toString() });

  // Tab 2 state
  const [marksExamId, setMarksExamId] = useState('');
  const [papers, setPapers] = useState([]);
  const [marksPaperId, setMarksPaperId] = useState('');
  const [marksData, setMarksData] = useState({}); // { studentId: marks }
  const [resultIds, setResultIds] = useState({});
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [paperForm, setPaperForm] = useState({ subjectId: '', gradeLevel: '', maxMarks: 100 });

  // Tab 3 state
  const [reportStudentId, setReportStudentId] = useState('');
  const [reportExamId, setReportExamId] = useState('');
  const [reportData, setReportData] = useState(null);

  // Tab 4 state
  const [analyticsExamId, setAnalyticsExamId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);

  // Initial fetch
  useEffect(() => {
    fetchExams();
    fetchStudents();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/teachers/subjects');
      setSubjects(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Tab 1 Actions ---
  const openExamModal = (exam = null) => {
    setEditingExam(exam);
    setExamForm({ examName: exam?.examName || '', term: String(exam?.term || 1), academicYear: String(exam?.academicYear || new Date().getFullYear()) });
    setError(null);
    setIsExamModalOpen(true);
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Delete this exam, all its papers, and all recorded marks?')) return;
    try {
      await api.delete(`/exams/${id}`);
      if (String(marksExamId) === String(id)) setMarksExamId('');
      if (String(reportExamId) === String(id)) setReportExamId('');
      if (String(analyticsExamId) === String(id)) setAnalyticsExamId('');
      setError(null);
      await fetchExams();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete exam');
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) await api.put(`/exams/${editingExam.id}`, examForm);
      else await api.post('/exams', examForm);
      setError(null);
      setIsExamModalOpen(false);
      fetchExams();
      setExamForm({ examName: '', term: '1', academicYear: new Date().getFullYear().toString() });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save exam');
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.patch(`/exams/${id}/publish`);
      fetchExams();
    } catch (err) {
      setError('Failed to publish exam');
    }
  };

  // --- Tab 2 Actions ---
  useEffect(() => {
    setMarksPaperId('');
    setMarksData({});
    setResultIds({});
    if (marksExamId) {
      fetchPapers(marksExamId);
    } else {
      setPapers([]);
      setMarksPaperId('');
    }
  }, [marksExamId]);

  const fetchPapers = async (examId) => {
    try {
      const res = await api.get(`/exams/${examId}/papers`);
      setPapers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (marksPaperId) {
      fetchExistingResults(marksPaperId);
    } else {
      setMarksData({});
      setResultIds({});
    }
  }, [marksPaperId]);

  const fetchExistingResults = async (paperId) => {
    try {
      const res = await api.get(`/exams/papers/${paperId}/results`);
      const existing = res.data || [];
      const newMarksData = {};
      const ids = {};
      existing.forEach(r => {
        newMarksData[r.studentId] = r.marksObtained;
        ids[r.studentId] = r.id;
      });
      setMarksData(newMarksData);
      setResultIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePaper = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams/papers', {
        examId: marksExamId,
        subjectId: parseInt(paperForm.subjectId),
        gradeLevel: parseInt(paperForm.gradeLevel),
        maxMarks: parseInt(paperForm.maxMarks)
      });
      setIsPaperModalOpen(false);
      fetchPapers(marksExamId);
      setPaperForm({ subjectId: '', gradeLevel: '', maxMarks: 100 });
    } catch (err) {
      setError('Failed to create paper');
    }
  };

  const handleMarksChange = (studentId, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleDeletePaper = async () => {
    if (!window.confirm('Delete this paper and all its recorded marks?')) return;
    try {
      await api.delete(`/exams/papers/${marksPaperId}`);
      setMarksPaperId('');
      setError(null);
      await fetchPapers(marksExamId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete paper');
    }
  };

  const handleDeleteResult = async (studentId) => {
    if (!window.confirm('Delete this student result?')) return;
    try {
      await api.delete(`/exams/results/${resultIds[studentId]}`);
      setError(null);
      await fetchExistingResults(marksPaperId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete result');
    }
  };

  const handleSubmitMarks = async () => {
    try {
      const marksPayload = Object.entries(marksData)
        .filter(([_, marks]) => marks !== '' && marks !== null && marks !== undefined)
        .map(([studentId, marks]) => ({
          studentId: parseInt(studentId),
          marksObtained: parseFloat(marks)
        }));

      if (marksPayload.length === 0) return;

      await api.post('/exams/marks', {
        examPaperId: parseInt(marksPaperId),
        marks: marksPayload
      });
      await fetchExistingResults(marksPaperId);
      alert('Marks submitted successfully!');
    } catch (err) {
      setError('Failed to submit marks');
    }
  };

  // --- Tab 3 Actions ---
  useEffect(() => {
    if (reportStudentId && reportExamId) {
      fetchReportCard();
    } else {
      setReportData(null);
    }
  }, [reportStudentId, reportExamId]);

  const fetchReportCard = async () => {
    try {
      const res = await api.get(`/exams/student/${reportStudentId}/exam/${reportExamId}`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      setReportData(null);
    }
  };

  // --- Tab 4 Actions ---
  useEffect(() => {
    if (analyticsExamId) {
      fetchAnalytics();
    } else {
      setAnalyticsData(null);
    }
  }, [analyticsExamId]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/exams/${analyticsExamId}/analytics`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
      setAnalyticsData(null);
    }
  };

  // --- Render Helpers ---

  const examColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Exam Name', accessor: 'examName' },
    { header: 'Term', accessor: 'term' },
    { header: 'Academic Year', accessor: 'academicYear' },
    { 
      header: 'Status', 
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {row.status || 'DRAFT'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openExamModal(row)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
          <button onClick={() => handleDeleteExam(row.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
          {row.status !== 'PUBLISHED' && (
            <button onClick={() => handlePublish(row.id)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Publish</button>
          )}
          <button 
            onClick={() => { setMarksExamId(row.id.toString()); setActiveTab('marks'); }} 
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            Marks
          </button>
          <button 
            onClick={() => { setAnalyticsExamId(row.id.toString()); setActiveTab('analytics'); }} 
            className="text-purple-600 hover:text-purple-900 text-sm font-medium"
          >
            Analytics
          </button>
        </div>
      )
    }
  ];

  const marksColumns = [
    { header: 'Actions', cell: (r) => resultIds[r.id] ? <button onClick={() => handleDeleteResult(r.id)} className="text-red-600 hover:text-red-900 text-sm">Delete Result</button> : null },
    { header: 'Student ID', accessor: 'id' },
    { header: 'Name', cell: (r) => `${r.firstName || ''} ${r.lastName || ''}` },
    { 
      header: 'Marks',
      cell: (r) => (
        <input 
          type="number" 
          min="0" max={papers.find(p => String(p.id) === String(marksPaperId))?.maxMarks || 100}
          value={marksData[r.id] !== undefined ? marksData[r.id] : ''} 
          onChange={(e) => handleMarksChange(r.id, e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-24 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
        />
      )
    },
    { 
      header: 'Grade', 
      cell: (r) => {
        const { grade } = calculateGrade(marksData[r.id], papers.find(p => String(p.id) === String(marksPaperId))?.maxMarks || 100);
        return <span className={`font-bold ${grade === 'F' ? 'text-red-600' : 'text-gray-800'}`}>{grade}</span>;
      }
    },
    { 
      header: 'Remarks', 
      cell: (r) => {
        const { remarks } = calculateGrade(marksData[r.id], papers.find(p => String(p.id) === String(marksPaperId))?.maxMarks || 100);
        return <span className="text-gray-600 text-sm">{remarks}</span>;
      }
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Exams Management</h1>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 shadow-sm rounded-r">{error}</div>}

      <div className="mb-6 flex space-x-1 border-b border-gray-200">
        {['exams', 'marks', 'report', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-medium text-sm capitalize transition-colors duration-200 ${
              activeTab === tab 
                ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50/50 rounded-t-md' 
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {/* TAB 1: EXAMS */}
        {activeTab === 'exams' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-700">All Exams</h2>
              <button 
                onClick={() => openExamModal()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                + Create Exam
              </button>
            </div>
            <DataTable columns={examColumns} data={exams} />
            
            <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title={editingExam ? 'Edit Exam' : 'Create Exam'}>
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                  <input type="text" required value={examForm.examName} onChange={e => setExamForm({...examForm, examName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Mid Term Exam" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Term</label>
                  <select required value={examForm.term} onChange={e => setExamForm({...examForm, term: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                    <option value="3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input type="text" required value={examForm.academicYear} onChange={e => setExamForm({...examForm, academicYear: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsExamModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">{editingExam ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* TAB 2: MARKS ENTRY */}
        {activeTab === 'marks' && (
          <div>
            {marksExamId && <RecordMaintenance title="Exam papers" rows={papers}
              columns={[{header:'Subject',cell:r => subjects.find(s => s.id === r.subjectId)?.subjectName || r.subjectId},{header:'Grade',accessor:'gradeLevel'},{header:'Maximum marks',accessor:'maxMarks'}]}
              fields={[{name:'subjectId',label:'Subject',type:'number',options:subjects.map(s => ({value:s.id,label:s.subjectName}))},{name:'gradeLevel',label:'Grade',type:'number',min:1,max:13},{name:'maxMarks',label:'Maximum marks',type:'number',min:1,step:'0.01'}]}
              onSave={async (r,values) => { await api.put(`/exams/papers/${r.id}`,{...values,examId:Number(marksExamId)}); await fetchPapers(marksExamId); }} />}
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Batch Marks Entry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                <select value={marksExamId} onChange={e => setMarksExamId(e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="">-- Select Exam --</option>
                  {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examName} ({ex.academicYear})</option>)}
                </select>
              </div>
              
              {marksExamId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Paper (Subject)</label>
                  <div className="flex gap-2">
                    <select value={marksPaperId} onChange={e => setMarksPaperId(e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                      <option value="">-- Select Paper --</option>
                      {papers.map(p => {
                        const sub = subjects.find(s => s.id === p.subjectId);
                        return <option key={p.id} value={p.id}>{sub ? sub.subjectName : `Subject ID ${p.subjectId}`} (Grade {p.gradeLevel})</option>
                      })}
                    </select>
                    <button onClick={() => setIsPaperModalOpen(true)} className="bg-white text-gray-700 px-4 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap shadow-sm font-medium text-sm">
                      + Add Paper
                    </button>
                  </div>
                  {marksPaperId && <button onClick={handleDeletePaper} className="mt-2 text-red-600 hover:text-red-900 text-sm">Delete Paper</button>}
                </div>
              )}
            </div>

            {marksPaperId && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">Student List</h3>
                  <button onClick={handleSubmitMarks} className="bg-indigo-600 text-white px-5 py-2 rounded-md shadow-sm hover:bg-indigo-700 transition-colors font-medium text-sm">
                    Submit All Marks
                  </button>
                </div>
                <div className="p-4">
                  <DataTable columns={marksColumns} data={students} />
                </div>
              </div>
            )}

            <Modal isOpen={isPaperModalOpen} onClose={() => setIsPaperModalOpen(false)} title="Create Exam Paper">
              <form onSubmit={handleCreatePaper} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select required value={paperForm.subjectId} onChange={e => setPaperForm({...paperForm, subjectId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade Level</label>
                  <input type="number" required value={paperForm.gradeLevel} onChange={e => setPaperForm({...paperForm, gradeLevel: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Marks</label>
                  <input type="number" required value={paperForm.maxMarks} onChange={e => setPaperForm({...paperForm, maxMarks: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsPaperModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create</button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* TAB 3: REPORT CARD */}
        {activeTab === 'report' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Student Report Card</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select value={reportStudentId} onChange={e => setReportStudentId(e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                <select value={reportExamId} onChange={e => setReportExamId(e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="">-- Select Exam --</option>
                  {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examName}</option>)}
                </select>
              </div>
            </div>

            {reportData && (
              <div className="border border-gray-200 rounded-xl p-8 max-w-3xl mx-auto shadow-sm bg-white">
                <div className="text-center mb-8 border-b border-gray-200 pb-6">
                  <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Student Report Card</h2>
                  <p className="text-gray-500 mt-2 font-medium">{reportData.examName} - Term {reportData.term} ({reportData.academicYear})</p>
                </div>
                
                <div className="mb-8 flex justify-between bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Student ID</p>
                    <p className="font-bold text-xl text-gray-900">{reportData.studentId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Overall Status</p>
                    <p className={`font-bold text-xl ${reportData.averageMarks >= 35 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.averageMarks >= 35 ? 'PASS' : 'FAIL'}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Subject</th>
                        <th className="p-4 font-semibold text-right">Marks</th>
                        <th className="p-4 font-semibold text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(reportData.subjectResults || []).map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-gray-800">Paper ID: {r.examPaperId}</td>
                          <td className="p-4 font-medium text-right text-gray-900">{r.marksObtained}</td>
                          <td className="p-4 font-bold text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${['A','A+'].includes(r.grade) ? 'bg-green-100 text-green-700' : r.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {r.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-6 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                  <div className="text-center px-4">
                    <p className="text-sm text-indigo-600 uppercase tracking-wider font-semibold mb-1">Total Marks</p>
                    <p className="text-3xl font-black text-indigo-900">{reportData.totalMarks}</p>
                  </div>
                  <div className="w-px bg-indigo-200 mx-2"></div>
                  <div className="text-center px-4">
                    <p className="text-sm text-indigo-600 uppercase tracking-wider font-semibold mb-1">Average</p>
                    <p className="text-3xl font-black text-indigo-900">{parseFloat(reportData.averageMarks).toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Class Analytics</h2>
            <div className="mb-8 max-w-md bg-gray-50 p-4 rounded-lg border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
              <select value={analyticsExamId} onChange={e => setAnalyticsExamId(e.target.value)} className="block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                <option value="">-- Select Exam --</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.examName}</option>)}
              </select>
            </div>

            {analyticsData && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-blue-600 uppercase font-bold tracking-wide">Evaluated</p>
                    <p className="text-3xl font-black text-blue-900 mt-2">{analyticsData.evaluatedCandidates}</p>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-emerald-600 uppercase font-bold tracking-wide">Pass Rate</p>
                    <p className="text-3xl font-black text-emerald-900 mt-2">{analyticsData.passRate}%</p>
                  </div>
                  <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-purple-600 uppercase font-bold tracking-wide">Batch Avg</p>
                    <p className="text-3xl font-black text-purple-900 mt-2">{analyticsData.batchAverage}</p>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-indigo-600 uppercase font-bold tracking-wide">Passed</p>
                    <p className="text-3xl font-black text-indigo-900 mt-2">{analyticsData.passedCount}</p>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-amber-600 uppercase font-bold tracking-wide">Highest</p>
                    <p className="text-3xl font-black text-amber-900 mt-2">{analyticsData.highestAggregate}</p>
                  </div>
                  <div className="bg-pink-50/50 border border-pink-100 p-5 rounded-xl text-center shadow-sm flex flex-col justify-center">
                    <p className="text-xs text-pink-600 uppercase font-bold tracking-wide">Top Subject</p>
                    <p className="text-lg font-bold text-pink-900 mt-2 truncate leading-tight" title={analyticsData.topSubjectName}>{analyticsData.topSubjectName || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Grade Distribution */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6 text-lg">Grade Distribution</h3>
                    <div className="space-y-4">
                      {['A+', 'A', 'B', 'C', 'S', 'F'].map(grade => {
                        const count = (analyticsData.gradeDistribution || {})[grade] || 0;
                        const pct = (analyticsData.gradePercentages || {})[grade] || 0;
                        return (
                          <div key={grade} className="flex items-center group">
                            <span className="w-10 font-bold text-gray-700">{grade}</span>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full mx-3 overflow-hidden relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                  grade === 'F' ? 'bg-red-400' : 
                                  ['A+', 'A'].includes(grade) ? 'bg-emerald-400' : 
                                  grade === 'B' ? 'bg-blue-400' : 
                                  grade === 'C' ? 'bg-indigo-400' : 'bg-amber-400'
                                }`} 
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="w-10 text-right text-sm font-medium text-gray-900">{count}</span>
                            <span className="w-14 text-right text-sm text-gray-500">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Merit List */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
                    <div className="p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                      <h3 className="font-bold text-gray-800 text-lg">Merit List (Top Students)</h3>
                    </div>
                    <div className="overflow-auto flex-1 max-h-[320px]">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white sticky top-0 border-b border-gray-200 shadow-sm">
                          <tr>
                            <th className="p-4 text-gray-500 uppercase tracking-wider font-semibold text-xs">Rank</th>
                            <th className="p-4 text-gray-500 uppercase tracking-wider font-semibold text-xs">Student ID</th>
                            <th className="p-4 text-gray-500 uppercase tracking-wider font-semibold text-xs text-right">Total</th>
                            <th className="p-4 text-gray-500 uppercase tracking-wider font-semibold text-xs text-right">Average</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(analyticsData.meritList || []).map((m, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                {m.rank === 1 && <span className="text-yellow-500 font-bold flex items-center gap-1"><span className="text-lg">🥇</span> 1st</span>}
                                {m.rank === 2 && <span className="text-gray-400 font-bold flex items-center gap-1"><span className="text-lg">🥈</span> 2nd</span>}
                                {m.rank === 3 && <span className="text-amber-700 font-bold flex items-center gap-1"><span className="text-lg">🥉</span> 3rd</span>}
                                {m.rank > 3 && <span className="text-gray-600 font-medium ml-6">{m.rank}th</span>}
                              </td>
                              <td className="p-4 font-medium text-gray-900">{m.studentId}</td>
                              <td className="p-4 text-right font-semibold text-gray-700">{m.totalMarks}</td>
                              <td className="p-4 text-right font-bold text-indigo-600">{m.averageMarks}%</td>
                            </tr>
                          ))}
                          {(!analyticsData.meritList || analyticsData.meritList.length === 0) && (
                            <tr>
                              <td colSpan="4" className="p-8 text-center text-gray-500">No data available for merit list.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
