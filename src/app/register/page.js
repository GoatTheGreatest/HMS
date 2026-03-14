'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'PATIENT'
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      // Handle HTML error pages gracefully
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          throw new Error(data.error || 'Registration failed');
        } else {
          throw new Error('Server returned an unexpected error. Ensure MongoDB is running or MONGODB_URI is correctly configured.');
        }
      }

      const data = await res.json();
      router.push('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-700">Create Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Join the Healthcare Service Platform</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md border border-red-200">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">I am a...</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-black">
              <option value="PATIENT" className='text-black'>Patient (Looking for care)</option>
              <option value="DOCTOR" className='text-black'>Doctor</option>
              <option value="NURSE" className='text-black'>Nurse</option>
              <option value="PHARMACEUTICAL" className='text-black'>Pharmaceutical Rep/Vendor</option>
            </select>
          </div>

          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
              Sign Up
            </button>
          </div>
          <div className="text-sm text-center">
            <span className="text-gray-500">Already have an account? </span>
            <Link href="/login" className="font-medium text-teal-600 hover:text-teal-500">Sign in instead</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
