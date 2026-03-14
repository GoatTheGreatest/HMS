import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-teal-700">
          Healthcare Service Platform
        </h2>
        <p className="mt-4 text-gray-600">
          Connecting patients with top medical professionals, securely.
        </p>
        
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/login" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700">
            Sign In
          </Link>
          <Link href="/register" className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
