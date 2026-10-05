import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Icon from './ui/Icon';
import BrandLogo from './ui/BrandLogo';
import { roleLabels, roleSection, visibleNavItems } from '../lib/navigation';
import { initials } from '../lib/schoolCalendar';

const Sidebar = ({ open = false, onClose = () => {} }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const userRole = user?.role || 'ADMIN';
  const items = visibleNavItems(userRole);
  const displayName = user?.username || 'User';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-outline-variant/50 bg-surface-container-lowest transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex min-h-0 flex-col">
          {/* Brand */}
          <div className="relative flex flex-col items-center justify-center border-b border-outline-variant/40 bg-slate-900/95 py-4 px-4 text-white brand-badge">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <Icon name="close" size={20} />
            </button>
            <BrandLogo subtitle="Fee & Payment Management" />
            <div className="text-[10px] text-amber-400 font-mono mt-1 font-semibold text-center">UC-06 · IT25103710 (Weerasekara K.T.J)</div>
          </div>

          {/* Navigation */}
          <div className="thin-scroll overflow-y-auto p-4">
            <div className="px-2 pb-1 text-label-sm uppercase tracking-wider text-outline">
              {roleSection[userRole] || 'Menu'}
            </div>
            <nav className="space-y-1">
              {items.map((item, idx) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  style={{ '--d': `${idx * 40}ms` }}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg py-2 text-body-md transition-all duration-200 animate-slide-in-left stagger ${
                      isActive
                        ? 'border-l-4 border-primary-container bg-surface-container-low pl-3 pr-2 font-semibold text-primary'
                        : 'px-2 text-on-surface-variant hover:translate-x-1 hover:bg-surface-container-low hover:text-on-surface'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        name={item.icon}
                        size={20}
                        filled={isActive}
                        className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? '' : 'text-outline group-hover:text-primary'}`}
                      />
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-gradient-to-r from-primary to-secondary-container px-1.5 py-0.5 text-[10px] font-bold text-on-primary shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Profile footer */}
        <div className="border-t border-outline-variant/40 p-4">
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low/70 p-2 transition-colors hover:bg-surface-container-low">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-primary text-label-md font-bold text-on-primary">
                {initials(displayName)}
              </div>
              <div className="flex flex-col truncate">
                <span className="truncate text-label-lg text-on-surface">{displayName}</span>
                <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-primary-fixed px-1.5 text-[10px] font-semibold uppercase text-on-primary-fixed">
                  {roleLabels[userRole] || userRole}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="rounded p-1 text-outline transition-all hover:bg-error-container hover:text-error"
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
