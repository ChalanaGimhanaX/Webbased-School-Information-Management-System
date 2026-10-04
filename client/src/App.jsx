import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Timetable from './pages/Timetable';
import Fees from './pages/Fees';
import ParentFees from './pages/ParentFees';
import Reports from './pages/Reports';
import Assistant from './pages/Assistant';

// Renders either the admin Fees page or the parent-specific ParentFees page
function FeesRoute() {
  const { user } = useContext(AuthContext);
  if (user?.role === 'PARENT') return <ParentFees />;
  return <Fees />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="exams" element={<Exams />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="fees" element={<FeesRoute />} />
            <Route path="reports" element={<Reports />} />
            <Route path="assistant" element={<Assistant />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
