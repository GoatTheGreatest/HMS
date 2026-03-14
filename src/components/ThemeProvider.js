'use client';

import { useEffect } from 'react';

/**
 * ThemeProvider component to handle role-based theming.
 * It sets the data-role attribute on the document element.
 * 
 * @param {string} role - The user role (admin, pharmacy, doctor, patient, nurse).
 * @param {React.ReactNode} children - The child components.
 */
export default function ThemeProvider({ role, children }) {
  useEffect(() => {
    // Standardize role to lowercase for CSS attribute selection
    // Also handling PHARMACEUTICAL -> pharmacy mapping
    const normalizedRole = (role || 'patient').toLowerCase();
    const mappedRole = normalizedRole === 'pharmaceutical' ? 'pharmacy' : normalizedRole;
    
    document.documentElement.setAttribute('data-role', mappedRole);
    
    // Cleanup if necessary (though usually not for root components)
    return () => {
      // document.documentElement.removeAttribute('data-role');
    };
  }, [role]);

  return (
    <>
      {children}
      
      {/* Dev Helper - Role Switcher */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-1 bg-white p-2 border border-gray-200 rounded-full shadow-lg opacity-40 hover:opacity-100 transition-opacity">
          {['admin', 'doctor', 'pharmaceutical', 'patient', 'nurse'].map((r) => (
            <button
              key={r}
              onClick={() => document.documentElement.setAttribute('data-role', r === 'pharmaceutical' ? 'pharmacy' : r)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase border border-gray-100 hover:bg-gray-50 cursor-pointer"
              title={r}
            >
              {r[0]}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
