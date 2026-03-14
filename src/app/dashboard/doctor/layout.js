import DashboardLayout from '@/layouts/DashboardLayout';

export const metadata = { title: 'Doctor Dashboard — HMS' };

export default function DoctorLayout({ children }) {
  return <DashboardLayout role="doctor">{children}</DashboardLayout>;
}
