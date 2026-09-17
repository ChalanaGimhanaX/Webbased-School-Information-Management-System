import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Students', path: '/students' },
  { name: 'Teachers', path: '/teachers' },
  { name: 'Attendance', path: '/attendance' },
  { name: 'Exams', path: '/exams' },
  { name: 'Timetable', path: '/timetable' },
  { name: 'Fees', path: '/fees' },
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-800">
        School Admin
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-indigo-600' : 'hover:bg-gray-800'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
