// Role-aware navigation shared by the sidebar, header breadcrumb and quick search.
export const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Students', path: '/students', icon: 'school', roles: ['ADMIN', 'HEAD_OF_ACADEMIC'] },
  { name: 'Teachers & Staff', path: '/teachers', icon: 'badge', roles: ['ADMIN', 'HEAD_OF_ACADEMIC'] },
  { name: 'Attendance', path: '/attendance', icon: 'fact_check', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER'] },
  { name: 'Exams & Results', path: '/exams', icon: 'assignment', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Timetable', path: '/timetable', icon: 'calendar_month', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Fees & Payments', path: '/fees', icon: 'payments', roles: ['ADMIN'] }, // Finance restricted to Admin only
  { name: 'Reports', path: '/reports', icon: 'monitoring', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER'] },
  { name: 'AI Study Buddy', path: '/assistant', icon: 'smart_toy', roles: ['STUDENT'], badge: 'AI' },
];

export const roleLabels = {
  ADMIN: 'Administrator',
  HEAD_OF_ACADEMIC: 'Head of Academic',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

export const roleSection = {
  ADMIN: 'Governance',
  HEAD_OF_ACADEMIC: 'Academic Governance',
  TEACHER: 'Teaching',
  STUDENT: 'My Learning',
  PARENT: 'Family Portal',
};

export function visibleNavItems(role) {
  return navItems.filter((item) => !item.roles || item.roles.includes(role));
}

export function pageTitleFor(pathname) {
  if (pathname === '/') return 'Dashboard';
  const match = navItems.find((item) => item.path !== '/' && (pathname === item.path || pathname.startsWith(`${item.path}/`)));
  return match ? match.name : 'Overview';
}

