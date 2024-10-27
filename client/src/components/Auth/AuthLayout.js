import React from 'react';
import BrandText from '../BrandText';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Logo and branding */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <BrandText size="large" />
            </h1>
          </div>

          {/* Auth form content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;