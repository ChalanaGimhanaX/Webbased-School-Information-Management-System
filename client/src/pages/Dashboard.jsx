// Group Project Dashboard - Team: IT25100975, IT25102861, IT25101863, IT25103724, IT25101913, IT25103710
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard';
import StudentDashboard from './dashboard/StudentDashboard';

/** Role-aware landing page: students get their personal learning dashboard, everyone else the academic overview. */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return user?.role === 'STUDENT' ? <StudentDashboard /> : <AdminDashboard />;
};

export default Dashboard;
