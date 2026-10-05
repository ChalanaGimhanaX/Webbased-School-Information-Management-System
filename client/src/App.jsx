import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import { canAccessPath } from './lib/navigation';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import MyResults from './pages/MyResults';
import Timetable from './pages/Timetable';
import Fees from './pages/Fees';
import ParentFees from './pages/ParentFees';
import ParentExams from './pages/ParentExams';
import Reports from './pages/Reports';
import Assistant from './pages/Assistant';

// Blocks direct URL access to pages outside the user's role (same matrix as the sidebar in lib/navigation.js)
function RoleRoute({ children }) {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();
  if (user && !canAccessPath(user.role, pathname)) return <Navigate to="/" replace />;
  return children;
}

// Renders either the admin Fees page or the parent-specific ParentFees page
function FeesRoute() {
  const { user } = useContext(AuthContext);
  if (user?.role === 'PARENT') return <ParentFees />;
  return <Fees />;
}

// Staff get exam management / marks entry; students get their own read-only report cards; parents get their children's reports
function ExamsRoute() {
  const { user } = useContext(AuthContext);
  if (user?.role === 'STUDENT') return <MyResults />;
  if (user?.role === 'PARENT') return <ParentExams />;
  return <Exams />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<RoleRoute><Students /></RoleRoute>} />
            <Route path="teachers" element={<RoleRoute><Teachers /></RoleRoute>} />
            <Route path="attendance" element={<RoleRoute><Attendance /></RoleRoute>} />
            <Route path="exams" element={<RoleRoute><ExamsRoute /></RoleRoute>} />
            <Route path="timetable" element={<RoleRoute><Timetable /></RoleRoute>} />
            <Route path="fees" element={<RoleRoute><FeesRoute /></RoleRoute>} />
            <Route path="reports" element={<RoleRoute><Reports /></RoleRoute>} />
            <Route path="assistant" element={<RoleRoute><Assistant /></RoleRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
