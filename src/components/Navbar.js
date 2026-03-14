'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const ROLE_TITLES = {
  patient:        { label: 'Patient Portal',  color: 'text-teal-700',  bg: 'bg-teal-50',  border: 'border-teal-200' },
  doctor:         { label: 'Doctor Portal',   color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-200' },
  nurse:          { label: 'Nurse Portal',    color: 'text-pink-700',  bg: 'bg-pink-50',  border: 'border-pink-200' },
  pharmaceutical: { label: 'Pharma Portal',   color: 'text-purple-700',bg: 'bg-purple-50',border: 'border-purple-200' },
  admin:          { label: 'Admin Portal',    color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
};

function getPageTitle(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 2) return 'Dashboard';
  const last = segments[segments.length - 1];
  return last.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function Navbar({ role, collapsed, onMobileMenuOpen }) {
  const router   = useRouter();
  const pathname = usePathname();
  const config   = ROLE_TITLES[role] || ROLE_TITLES.patient;
  const pageTitle = getPageTitle(pathname);

  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user) {
          const name = `${d.user.firstName} ${d.user.lastName}`.trim();
          setUserName(name || d.user.email || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  return (
    <header
      className={[
        'fixed top-0 right-0 z-10 bg-white border-b border-gray-200 transition-all duration-300',
        'left-0',
        collapsed !== undefined
          ? (collapsed ? 'lg:left-16' : 'lg:left-64')
          : 'lg:left-64',
      ].join(' ')}
      id="dashboard-navbar"
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-gray-900 font-semibold text-base">{pageTitle}</h1>
            <p className={`text-xs font-medium ${config.color} hidden sm:block`}>{config.label}</p>
          </div>
        </div>

        {/* Right: user name + role badge + logout */}
        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-[140px]">
              {userName}
            </span>
          )}
          <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border} capitalize`}>
            {role}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
