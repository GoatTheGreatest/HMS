import DashboardLayout from '@/layouts/DashboardLayout';

export const metadata = { title: 'Patient Dashboard — HMS' };

export default function PatientLayout({ children }) {
  return <DashboardLayout role="patient">{children}</DashboardLayout>;
}
