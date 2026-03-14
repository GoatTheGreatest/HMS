'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_CONFIG = {
  patient: {
    color: 'teal',
    gradient: 'from-teal-600 to-teal-700',
    items: [
      { href: '/dashboard/patient', label: 'Dashboard', icon: '🏠' },
      { href: '/dashboard/patient/find-doctors', label: 'Find Doctors', icon: '🔍' },
      { href: '/dashboard/patient/book-appointment', label: 'Book Appointment', icon: '📅' },
      { href: '/dashboard/patient/medical-history', label: 'Medical History', icon: '📋' },
      { href: '/dashboard/patient/documents', label: 'Documents', icon: '📁' },
      { href: '/dashboard/patient/messages', label: 'Messages', icon: '💬' },
      { href: '/dashboard/patient/profile', label: 'Profile', icon: '👤' },
    ],
  },
  doctor: {
    color: 'blue',
    gradient: 'from-blue-600 to-blue-700',
    items: [
      { href: '/dashboard/doctor', label: 'Dashboard', icon: '🏠' },
      { href: '/dashboard/doctor/patients', label: 'My Patients', icon: '👥' },
      { href: '/dashboard/doctor/appointments', label: 'Appointments', icon: '📅' },
      { href: '/dashboard/doctor/prescriptions', label: 'Prescriptions', icon: '💊' },
      { href: '/dashboard/doctor/messages', label: 'Messages', icon: '💬' },
      { href: '/dashboard/doctor/analytics', label: 'Analytics', icon: '📊' },
      { href: '/dashboard/doctor/profile', label: 'Profile', icon: '👤' },
    ],
  },
  nurse: {
    color: 'pink',
    gradient: 'from-pink-600 to-rose-600',
    items: [
      { href: '/dashboard/nurse', label: 'Dashboard', icon: '🏠' },
      { href: '/dashboard/nurse/home-visits', label: 'Home Visit Requests', icon: '🏡' },
      { href: '/dashboard/nurse/schedule', label: 'Schedule', icon: '🗓️' },
      { href: '/dashboard/nurse/patients', label: 'Patients', icon: '👥' },
      { href: '/dashboard/nurse/messages', label: 'Messages', icon: '💬' },
      { href: '/dashboard/nurse/profile', label: 'Profile', icon: '👤' },
    ],
  },
  pharmacy: {
    color: 'purple',
    gradient: 'from-purple-600 to-violet-700',
    items: [
      { href: '/dashboard/pharmaceutical', label: 'Dashboard', icon: '🏠' },
      { href: '/dashboard/pharmaceutical/inventory', label: 'Drug Inventory', icon: '🧪' },
      { href: '/dashboard/pharmaceutical/expired', label: 'Expired Medicines', icon: '⚠️' },
      { href: '/dashboard/pharmaceutical/supply-requests', label: 'Supply Requests', icon: '📦' },
      { href: '/dashboard/pharmaceutical/orders', label: 'Orders', icon: '🛒' },
      { href: '/dashboard/pharmaceutical/analytics', label: 'Analytics', icon: '📊' },
      { href: '/dashboard/pharmaceutical/profile', label: 'Profile', icon: '👤' },
    ],
  },
  admin: {
    color: 'gray',
    gradient: 'from-slate-700 to-slate-800',
    items: [
      { href: '/dashboard/admin', label: 'Dashboard', icon: '🏠' },
      { href: '/dashboard/admin/verify', label: 'Verify Doctors/Nurses', icon: '✅' },
      { href: '/dashboard/admin/users', label: 'User Management', icon: '👤' },
      { href: '/dashboard/admin/reports', label: 'Reports', icon: '📄' },
      { href: '/dashboard/admin/logs', label: 'System Logs', icon: '🖥️' },
      { href: '/dashboard/admin/profile', label: 'Profile', icon: '👤' },
    ],
  },
};

const ROLE_LABELS = {
  patient: 'Patient Portal',
  doctor: 'Doctor Portal',
  nurse: 'Nurse Portal',
  pharmacy: 'Pharma Portal',
  admin: 'Admin Portal',
};

export default function Sidebar({ role: rawRole, collapsed, onToggle, mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const role = (rawRole || 'patient').toLowerCase() === 'pharmaceutical' ? 'pharmacy' : (rawRole || 'patient').toLowerCase();
  const config = NAV_CONFIG[role] || NAV_CONFIG.patient;

  const navItems = config.items;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out shadow-xl',
          'bg-linear-to-b from-sidebar-from to-sidebar-to',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-2xl">🏥</span>
              <div className="leading-tight text-white">
                <p className="font-bold text-sm whitespace-nowrap">HMS Portal</p>
                <p className="text-white/60 text-xs whitespace-nowrap">{ROLE_LABELS[role]}</p>
              </div>
            </div>
          )}
          {collapsed && <span className="text-2xl mx-auto">🏥</span>}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-white/20 text-white shadow'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                  collapsed ? 'justify-center' : '',
                ].join(' ')}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom - Role badge */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold uppercase">
                {role[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-medium capitalize truncate">{role}</p>
                <p className="text-white/50 text-xs">Signed in</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
