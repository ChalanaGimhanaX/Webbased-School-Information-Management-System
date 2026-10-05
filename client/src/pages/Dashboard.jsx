// Group Project Dashboard - Team: IT25100975, IT25102861, IT25101863, IT25103724, IT25101913, IT25103710
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard';
import StudentDashboard from './dashboard/StudentDashboard';
import ParentDashboard from './dashboard/ParentDashboard';

/** Role-aware landing page: students get their learning dashboard, parents their family portal, staff the academic overview. */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  if (user?.role === 'STUDENT') return <StudentDashboard />;
  if (user?.role === 'PARENT') return <ParentDashboard />;
  return <AdminDashboard />;
};

export default Dashboard;
