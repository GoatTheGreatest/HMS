// This root dashboard layout is intentionally minimal.
// Each role-specific subfolder (patient, doctor, etc.) has its own layout.js
// that wraps content with the sidebar + navbar for that role.
export default function DashboardRootLayout({ children }) {
  return <>{children}</>;
}
