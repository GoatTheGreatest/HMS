import DashboardLayout from '@/layouts/DashboardLayout';

export const metadata = { title: 'Admin Dashboard — HMS' };

export default function AdminLayout({ children }) {
  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}
