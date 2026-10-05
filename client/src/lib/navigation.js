// Role-aware navigation shared by the sidebar, header breadcrumb, quick search and route guards.
// `roles` decides who can SEE and OPEN a page (App.jsx RoleRoute reuses it); `labels` renames a page per role.
export const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Students', path: '/students', icon: 'school', roles: ['ADMIN', 'HEAD_OF_ACADEMIC'] },
  { name: 'Teachers & Staff', path: '/teachers', icon: 'badge', roles: ['ADMIN', 'HEAD_OF_ACADEMIC'] },
  { name: 'Attendance', path: '/attendance', icon: 'fact_check', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER'] },
  { name: 'Exams & Results', path: '/exams', icon: 'assignment', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'], labels: { STUDENT: 'My Results', TEACHER: 'Exams & Marks', PARENT: "Children's Reports" } },
  { name: 'Timetable', path: '/timetable', icon: 'calendar_month', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'], labels: { STUDENT: 'My Timetable', PARENT: "Children's Timetable" } },
  { name: 'Fees & Payments', path: '/fees', icon: 'payments', roles: ['ADMIN', 'PARENT'], labels: { PARENT: 'My Fees' } }, // Finance: Admin manages, Parent pays own children's fees
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

const withRoleLabel = (item, role) => (item.labels?.[role] ? { ...item, name: item.labels[role] } : item);

export function visibleNavItems(role) {
  return navItems
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => withRoleLabel(item, role));
}

function matchItem(pathname) {
  if (pathname === '/') return navItems[0];
  return navItems.find((item) => item.path !== '/' && (pathname === item.path || pathname.startsWith(`${item.path}/`)));
}

/** True when `role` may open the page at `pathname` (unknown paths are allowed and handled by the router). */
export function canAccessPath(role, pathname) {
  const match = matchItem(pathname);
  return !match || !match.roles || match.roles.includes(role);
}

export function pageTitleFor(pathname, role) {
  const match = matchItem(pathname);
  return match ? withRoleLabel(match, role).name : 'Overview';
}
