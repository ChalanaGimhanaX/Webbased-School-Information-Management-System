import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Students', path: '/students', roles: ['ADMIN', 'HEAD_OF_ACADEMIC'] },
  { name: 'Teachers', path: '/teachers', roles: ['ADMIN', 'HEAD_OF_ACADEMIC'] },
  { name: 'Attendance', path: '/attendance', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER'] },
  { name: 'Exams', path: '/exams', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Timetable', path: '/timetable', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Fees', path: '/fees', roles: ['ADMIN'] }, // Finance restricted to Admin only
  { name: 'Reports', path: '/reports', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER'] },
];

const roleLabels = {
  ADMIN: 'Administrator',
  HEAD_OF_ACADEMIC: 'Head of Academic',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const userRole = user?.role || 'ADMIN';

  const visibleItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="p-4 border-b border-gray-800">
          <div className="text-xl font-bold tracking-wide">SIMS Portal</div>
          {user && (
            <div className="mt-2 text-xs">
              <span className="font-semibold text-gray-300">@{user.username}</span>
              <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-200 border border-indigo-700 text-[10px] font-medium">
                {roleLabels[userRole] || userRole}
              </div>
            </div>
          )}
        </div>
        <nav className="p-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-md transition-colors text-left flex items-center gap-2"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
