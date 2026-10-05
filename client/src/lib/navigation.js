// UC-01: Student & Class Management (IT25100975 - Dissanayake D.M.R.S)
export const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard', roles: ['ADMIN', 'HEAD_OF_ACADEMIC', 'TEACHER', 'STUDENT', 'PARENT'] },
  { name: 'Student & Class Management', path: '/students', icon: 'school', roles: ['ADMIN', 'HEAD_OF_ACADEMIC'] },
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

export function canAccessPath(role, pathname) {
  const match = matchItem(pathname);
  return !match || !match.roles || match.roles.includes(role);
}

export function pageTitleFor(pathname, role) {
  const match = matchItem(pathname);
  return match ? withRoleLabel(match, role).name : 'Overview';
}
