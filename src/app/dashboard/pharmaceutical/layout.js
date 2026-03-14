import DashboardLayout from '@/layouts/DashboardLayout';

export const metadata = { title: 'Pharmaceutical Dashboard — HMS' };

export default function PharmaceuticalLayout({ children }) {
  return <DashboardLayout role="pharmaceutical">{children}</DashboardLayout>;
}
