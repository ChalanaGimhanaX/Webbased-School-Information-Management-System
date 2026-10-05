import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Icon from '../components/ui/Icon';
import Crest from '../components/ui/Crest';
import ChatWidget from '../components/assistant/ChatWidget';
import { AuthContext } from '../context/AuthContext';
import { pageTitleFor, visibleNavItems } from '../lib/navigation';
import { getTermInfo, initials } from '../lib/schoolCalendar';

const quickActionsByRole = {
  ADMIN: [
    { label: 'Register student', icon: 'person_add', to: '/students' },
    { label: 'Mark attendance', icon: 'fact_check', to: '/attendance' },
    { label: 'Manage exams', icon: 'edit_note', to: '/exams' },
    { label: 'Edit timetable', icon: 'calendar_month', to: '/timetable' },
    { label: 'Record fee payment', icon: 'payments', to: '/fees' },
  ],
  HEAD_OF_ACADEMIC: [
    { label: 'Register student', icon: 'person_add', to: '/students' },
    { label: 'Mark attendance', icon: 'fact_check', to: '/attendance' },
    { label: 'Manage exams', icon: 'edit_note', to: '/exams' },
    { label: 'Edit timetable', icon: 'calendar_month', to: '/timetable' },
  ],
  TEACHER: [
    { label: 'Mark attendance', icon: 'fact_check', to: '/attendance' },
    { label: 'Enter exam marks', icon: 'edit_note', to: '/exams' },
    { label: 'View class timetables', icon: 'calendar_month', to: '/timetable' },
  ],
  STUDENT: [
    { label: 'Ask Study Buddy', icon: 'smart_toy', to: '/assistant' },
    { label: 'My timetable', icon: 'calendar_month', to: '/timetable' },
    { label: 'My results', icon: 'assignment', to: '/exams' },
  ],
  PARENT: [
    { label: 'View & pay fees', icon: 'payments', to: '/fees' },
  ],
};

const notices = [
  { icon: 'campaign', tone: 'text-primary', title: 'Academic Year in session', body: 'Class allocations, subject assignments and fee schedules are synchronised.' },
  { icon: 'assignment', tone: 'text-tertiary', title: 'Examinations', body: 'Exam schedules are published. Marks entry is open for teaching staff.' },
];

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

const DashboardLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menu, setMenu] = useState(null); // 'notifications' | 'quick' | null
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchBoxRef = useRef(null);
  const menuRef = useRef(null);

  const closeMenu = React.useCallback(() => setMenu(null), []);
  const closeSearch = React.useCallback(() => setSearchOpen(false), []);
  useOutsideClose(menuRef, closeMenu);
  useOutsideClose(searchBoxRef, closeSearch);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('sims.theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sims.theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sims.theme', 'light');
    }
  }, [isDark]);

  const role = user?.role || 'ADMIN';
  const term = getTermInfo();
  const pageTitle = pageTitleFor(location.pathname, role);
  const navResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = visibleNavItems(role);
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  }, [query, role]);

  // ⌘K / Ctrl+K focuses the quick search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close transient UI on navigation (state adjusted during render, not in an effect)
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setSidebarOpen(false);
    setMenu(null);
    setSearchOpen(false);
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const go = (to) => {
    setQuery('');
    navigate(to);
  };

  const showChatWidget = role === 'STUDENT' && location.pathname !== '/assistant';

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/40 bg-surface-container-lowest/90 px-4 backdrop-blur-md sm:px-6 lg:left-64">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface lg:hidden"
              aria-label="Open navigation"
            >
              <Icon name="menu" size={22} />
            </button>
            <Crest className="hidden h-8 w-8 shrink-0 sm:block lg:hidden" />
            <nav className="hidden items-center gap-1 text-label-md text-outline sm:flex" aria-label="Breadcrumb">
              <span className="text-on-surface-variant">Overview</span>
              <Icon name="chevron_right" size={14} />
              <span key={pageTitle} className="animate-fade-in font-medium text-primary">{pageTitle}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick search */}
            <div ref={searchBoxRef} className="relative hidden items-center lg:flex">
              <Icon name="search" size={18} className="pointer-events-none absolute left-3 text-outline" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && navResults[0]) go(navResults[0].path);
                  if (e.key === 'Escape') { setSearchOpen(false); e.currentTarget.blur(); }
                }}
                placeholder="Jump to a module…"
                aria-label="Quick search modules"
                className="h-9 w-72 rounded-lg border border-outline-variant/50 bg-surface-container-low/60 pl-9 pr-12 text-body-sm text-on-surface transition-all duration-300 placeholder:text-outline focus:w-80 focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/30"
              />
              <kbd className="pointer-events-none absolute right-2.5 rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold text-outline">⌘K</kbd>
              {searchOpen && (
                <div className="absolute right-0 top-11 w-80 animate-scale-in overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-1 shadow-xl">
                  {navResults.length === 0 ? (
                    <div className="px-3 py-4 text-center text-body-sm text-outline">No matching module</div>
                  ) : (
                    navResults.map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => go(item.path)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                      >
                        <Icon name={item.icon} size={18} />
                        {item.name}
                        <Icon name="north_east" size={14} className="ml-auto text-outline" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Term chip */}
            <div className="hidden h-9 items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-low/60 px-3 text-label-md text-on-surface-variant md:flex" title={`Week ${term.week} · ${term.daysLeft} days left in term`}>
              <Icon name="calendar_today" size={16} className="text-outline" />
              <span>{term.label}</span>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-low/60 px-3 text-label-md text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={18} className={isDark ? 'text-amber-400' : 'text-outline'} />
              <span className="hidden sm:inline font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <div ref={menuRef} className="relative flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={menu === 'notifications'}
                onClick={() => setMenu(menu === 'notifications' ? null : 'notifications')}
                className="group relative rounded-lg p-2 text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface"
              >
                <Icon name="notifications" size={20} className="group-hover:animate-wiggle" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-ping-slow rounded-full bg-error" />
              </button>

              {/* Quick action */}
              <button
                type="button"
                aria-expanded={menu === 'quick'}
                onClick={() => setMenu(menu === 'quick' ? null : 'quick')}
                className="hidden h-9 items-center gap-1.5 rounded-lg bg-primary-container px-3.5 text-label-lg text-on-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-md active:translate-y-0 sm:inline-flex"
              >
                <Icon name="add" size={18} className={`transition-transform duration-300 ${menu === 'quick' ? 'rotate-45' : ''}`} />
                <span>Quick Action</span>
              </button>

              <div className="ml-1 flex items-center border-l border-outline-variant/40 pl-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-primary text-label-md font-bold text-on-primary ring-2 ring-transparent transition-all hover:ring-primary-fixed"
                  title={user.username}
                >
                  {initials(user.username)}
                </div>
              </div>

              {menu === 'notifications' && (
                <div className="absolute right-0 top-12 w-80 animate-scale-in rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-2 shadow-xl">
                  <div className="px-2 pb-2 pt-1 text-label-sm uppercase tracking-wider text-outline">Notice board</div>
                  {notices.map((n) => (
                    <div key={n.title} className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-surface-container-low">
                      <Icon name={n.icon} size={20} className={n.tone} />
                      <div>
                        <p className="text-label-lg font-semibold text-on-surface">{n.title}</p>
                        <p className="text-body-sm text-on-surface-variant">{n.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {menu === 'quick' && (
                <div className="absolute right-0 top-12 w-60 animate-scale-in rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-1 shadow-xl">
                  {(quickActionsByRole[role] || []).map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => go(a.to)}
                      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                    >
                      <Icon name={a.icon} size={18} className="transition-transform group-hover:scale-110" />
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main key={location.pathname} className="w-full flex-1 animate-fade-in px-4 pb-6 pt-22 sm:px-6">
          <Outlet />
        </main>
      </div>

      {showChatWidget && <ChatWidget />}
    </div>
  );
};

export default DashboardLayout;
