import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fees from './pages/Fees';
import ParentFees from './pages/ParentFees';

// Admin manages fee accounts & structures; Parents access their child payment portal
function FeesRoute() {
  const { user } = useContext(AuthContext);
  if (user?.role === 'PARENT') return <ParentFees />;
  return <Fees />;
}

// UC-06: Fee & Payment Management
// Assigned Member: IT25103710 - Weerasekara K.T.J
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="fees" element={<FeesRoute />} />
            <Route path="*" element={<Navigate to="/fees" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
