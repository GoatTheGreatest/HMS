import DashboardLayout from '@/layouts/DashboardLayout';

export const metadata = { title: 'Nurse Dashboard — HMS' };

export default function NurseLayout({ children }) {
  return <DashboardLayout role="nurse">{children}</DashboardLayout>;
}
