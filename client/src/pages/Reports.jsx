import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('financial'); // 'financial' | 'exam' | 'attendance'

  // Data states
  const [financialSummary, setFinancialSummary] = useState(null);
  const [overdueAccounts, setOverdueAccounts] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examAnalytics, setExamAnalytics] = useState(null);

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [classAttendance, setClassAttendance] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [sumRes, ovRes, exRes, clRes] = await Promise.all([
          api.get('/fees/reports/summary').catch(() => ({ data: null })),
          api.get('/fees/reports/overdue').catch(() => ({ data: [] })),
          api.get('/exams').catch(() => ({ data: [] })),
          api.get('/students/classes').catch(() => ({ data: [] })),
        ]);
        setFinancialSummary(sumRes.data);
        setOverdueAccounts(ovRes.data || []);
        const exList = exRes.data || [];
        setExams(exList);
        if (exList.length > 0) {
          setSelectedExamId(exList[0].id);
        }
        const clList = clRes.data || [];
        setClasses(clList);
        if (clList.length > 0) {
          setSelectedClassId(clList[0].id);
        }
      } catch (err) {
        console.error('Failed to load reports dependencies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Exam Analytics when selectedExamId changes
  useEffect(() => {
    if (selectedExamId) {
      api.get(`/exams/${selectedExamId}/analytics`)
        .then(res => setExamAnalytics(res.data))
        .catch(() => setExamAnalytics(null));
    }
  }, [selectedExamId]);

  // Fetch Class Attendance Report
  const fetchAttendanceReport = async () => {
    if (!selectedClassId) return;
    try {
      const res = await api.get(`/attendance/class/${selectedClassId}/summary?date=${reportDate}`);
      setClassAttendance(res.data);
    } catch {
      setClassAttendance(null);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchAttendanceReport();
    }
  }, [selectedClassId, reportDate]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Executive Reports & Decision Support</h2>
          <p className="text-sm text-gray-500 mt-1">Consolidated reports for academic performance, attendance trends, and school financial recovery</p>
        </div>
        <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'financial' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Financial Reports
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'exam' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Exam Analytics
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'attendance' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Attendance Reports
          </button>
        </div>
      </div>

      {/* ── TAB 1: FINANCIAL REPORTS ── */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {financialSummary ? (
            <>
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs font-semibold uppercase text-gray-400">Total Billed</span>
                  <p className="text-2xl font-bold text-gray-800 mt-1">LKR {Number(financialSummary.totalInvoiced).toLocaleString()}</p>
                  <span className="text-xs text-gray-400 mt-1 block">{financialSummary.totalFeeAccounts} registered student accounts</span>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs font-semibold uppercase text-gray-400">Total Collected</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">LKR {Number(financialSummary.totalCollected).toLocaleString()}</p>
                  <span className="text-xs text-green-600 font-medium mt-1 block">{financialSummary.paidAccountsCount} fully paid</span>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs font-semibold uppercase text-gray-400">Total Outstanding</span>
                  <p className="text-2xl font-bold text-red-600 mt-1">LKR {Number(financialSummary.totalOutstanding).toLocaleString()}</p>
                  <span className="text-xs text-yellow-600 font-medium mt-1 block">{financialSummary.partialAccountsCount} partially settled</span>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs font-semibold uppercase text-gray-400">Overall Recovery Rate</span>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{financialSummary.collectionRatePercentage}%</p>
                  <span className="text-xs text-indigo-600 font-medium mt-1 block">Target: 85%</span>
                </div>
              </div>

              {/* Breakdown Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-800 mb-4">Collection by Fee Structure</h3>
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                        <th className="py-2">Type</th>
                        <th className="py-2 text-right">Invoiced</th>
                        <th className="py-2 text-right">Collected</th>
                        <th className="py-2 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(financialSummary.feeTypeBreakdowns || []).map(b => (
                        <tr key={b.feeType}>
                          <td className="py-2 font-semibold text-gray-800">{b.feeType}</td>
                          <td className="py-2 text-right text-gray-600">LKR {Number(b.totalInvoiced).toLocaleString()}</td>
                          <td className="py-2 text-right text-green-600 font-medium">LKR {Number(b.totalCollected).toLocaleString()}</td>
                          <td className="py-2 text-right font-bold text-indigo-600">{b.collectionPercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-800 mb-4">Grade-Level Recovery Summary</h3>
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                        <th className="py-2">Grade</th>
                        <th className="py-2 text-center">Accounts</th>
                        <th className="py-2 text-right">Outstanding</th>
                        <th className="py-2 text-right">Recovery %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(financialSummary.gradeBreakdowns || []).map(g => (
                        <tr key={g.gradeLevel}>
                          <td className="py-2 font-semibold text-indigo-700">Grade {g.gradeLevel}</td>
                          <td className="py-2 text-center text-gray-600">{g.totalAccounts}</td>
                          <td className="py-2 text-right text-red-600 font-medium">LKR {Number(g.totalOutstanding).toLocaleString()}</td>
                          <td className="py-2 text-right font-bold text-indigo-600">{g.collectionPercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overdue Accounts */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-gray-800">Accounts in Arrears / Pending Payment</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                    {overdueAccounts.length} Account(s)
                  </span>
                </div>
                {overdueAccounts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Student</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Admission #</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Fee Purpose</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Balance (LKR)</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {overdueAccounts.map(a => (
                          <tr key={a.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-900">{a.studentName}</td>
                            <td className="px-4 py-2 font-mono text-gray-600">{a.studentAdmissionNumber}</td>
                            <td className="px-4 py-2 text-gray-700">{a.feeStructure?.name || 'Standard Fee'}</td>
                            <td className="px-4 py-2 text-right font-bold text-red-600">{Number(a.balanceAmount).toLocaleString()}</td>
                            <td className="px-4 py-2 text-center">
                              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No accounts are currently in overdue status.</p>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">Loading financial reports...</div>
          )}
        </div>
      )}

      {/* ── TAB 2: EXAM ANALYTICS ── */}
      {activeTab === 'exam' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-gray-700">Select Examination:</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white font-medium text-gray-900"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.examName} (Term {e.term} - {e.academicYear})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 text-xs font-semibold border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
            >
              Print Report
            </button>
          </div>

          {examAnalytics ? (
            <>
              {/* Analytics KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs font-semibold uppercase text-gray-400">Evaluated Candidates</span>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{examAnalytics.evaluatedCandidates}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs font-semibold uppercase text-gray-400">Batch Average</span>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{Math.round(examAnalytics.batchAverage * 10) / 10}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs font-semibold uppercase text-gray-400">Pass Rate</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">{Math.round(examAnalytics.passRate * 10) / 10}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs font-semibold uppercase text-gray-400">Top Aggregate Score</span>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{examAnalytics.highestAggregate}</p>
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-4">Letter Grade Distribution (A+ to F)</h3>
                <div className="grid grid-cols-6 gap-2 text-center">
                  {['A+', 'A', 'B', 'C', 'S', 'F'].map(grade => {
                    const count = examAnalytics.gradeDistribution?.[grade] || 0;
                    const pct = Math.round((examAnalytics.gradePercentages?.[grade] || 0) * 10) / 10;
                    return (
                      <div key={grade} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                        <span className="text-xs font-bold text-indigo-700">{grade}</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">{count}</p>
                        <span className="text-[11px] text-gray-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Merit Ranking */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-4">Class Merit Ranking</h3>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Rank</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Student ID</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Aggregate Total</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Average</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(examAnalytics.meritList || []).map((m) => (
                      <tr key={m.studentId} className={m.rank === 1 ? 'bg-yellow-50/60 font-semibold' : ''}>
                        <td className="px-4 py-2 text-center">
                          {m.rank === 1 ? '🥇 #1' : m.rank === 2 ? '🥈 #2' : m.rank === 3 ? '🥉 #3' : `#${m.rank}`}
                        </td>
                        <td className="px-4 py-2 text-gray-900">Student #{m.studentId}</td>
                        <td className="px-4 py-2 text-right text-gray-800">{m.totalMarks}</td>
                        <td className="px-4 py-2 text-right text-indigo-600 font-bold">{Math.round(m.averageMarks * 10) / 10}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No analytics data available for this examination.</p>
          )}
        </div>
      )}

      {/* ── TAB 3: ATTENDANCE REPORTS ── */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="mt-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} (Grade {c.gradeLevel})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Report Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="mt-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {classAttendance ? (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4">Official Daily Attendance Rate</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-white p-4 rounded shadow-xs">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Total Enrolled</span>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{classAttendance.totalStudents}</p>
                </div>
                <div className="bg-white p-4 rounded shadow-xs">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Present</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">{classAttendance.presentCount}</p>
                </div>
                <div className="bg-white p-4 rounded shadow-xs">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Absent</span>
                  <p className="text-2xl font-bold text-red-600 mt-1">{classAttendance.absentCount}</p>
                </div>
                <div className="bg-white p-4 rounded shadow-xs">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Attendance Rate</span>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {classAttendance.totalStudents > 0 ? Math.round((classAttendance.presentCount / classAttendance.totalStudents) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No attendance records submitted for this class on {reportDate}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

