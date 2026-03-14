import ProfileForm from '@/components/profile/ProfileForm';

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your administrator account settings.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
