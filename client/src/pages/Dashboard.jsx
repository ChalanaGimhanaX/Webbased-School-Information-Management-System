// Group Project Dashboard - Team: IT25100975, IT25102861, IT25101863, IT25103724, IT25101913, IT25103710
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    exams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sRes, tRes, cRes, eRes] = await Promise.all([
          api.get('/students').catch(() => ({ data: [] })),
          api.get('/teachers').catch(() => ({ data: [] })),
          api.get('/students/classes').catch(() => ({ data: [] })),
          api.get('/exams').catch(() => ({ data: [] })),
        ]);

        setStats({
          students: (sRes.data || []).length,
          teachers: (tRes.data || []).length,
          classes: (cRes.data || []).length,
          exams: (eRes.data || []).length,
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.students, color: 'bg-blue-500', subtitle: 'Enrolled in database' },
    { title: 'Total Teachers', value: stats.teachers, color: 'bg-green-500', subtitle: 'Active faculty members' },
    { title: 'Classes', value: stats.classes, color: 'bg-amber-500', subtitle: 'Academic sections' },
    { title: 'Examinations', value: stats.exams, color: 'bg-purple-500', subtitle: 'Scheduled exams' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Live metrics and operations from the School Information Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 flex items-center border border-gray-100">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0 mr-4 shadow-sm`}>
              {loading ? '...' : stat.value}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notice Board & Announcements</h3>
          <ul className="space-y-4">
            <li className="border-l-4 border-indigo-500 pl-4 py-1">
              <p className="text-sm font-semibold text-gray-900">Academic Year 2026 In Session</p>
              <p className="text-sm text-gray-500">All student class allocations, subject assignments, and fee schedules are synchronized.</p>
            </li>
            <li className="border-l-4 border-green-500 pl-4 py-1">
              <p className="text-sm font-semibold text-gray-900">Term 1 Examinations</p>
              <p className="text-sm text-gray-500">Examination schedules published. Marks entry portal open for teaching staff.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
