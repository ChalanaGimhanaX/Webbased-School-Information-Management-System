import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exams from './pages/Exams';
import MyResults from './pages/MyResults';

// Staff get exam management / batch marks entry; students get their own read-only report cards
function ExamsRoute() {
  const { user } = useContext(AuthContext);
  if (user?.role === 'STUDENT') return <MyResults />;
  return <Exams />;
}

// UC-04: Examination & Academic Performance
// Assigned Member: IT25103724 - Pemadasa J.M.C.D
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="exams" element={<ExamsRoute />} />
            <Route path="*" element={<Navigate to="/exams" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
