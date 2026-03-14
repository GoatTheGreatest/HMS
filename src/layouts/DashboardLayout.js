'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';
import ThemeProvider from '@/components/ThemeProvider';

export default function DashboardLayout({ children, role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ThemeProvider role={role}>
      <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <Navbar
          role={role}
          collapsed={collapsed}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        {/* Main content — offset for sidebar and navbar */}
        <main
          className={[
            'transition-all duration-300 pt-16 min-h-screen',
            collapsed ? 'lg:ml-16' : 'lg:ml-64',
          ].join(' ')}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
    </ThemeProvider>
  );
}
