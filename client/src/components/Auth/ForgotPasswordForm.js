import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import axios from 'axios';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, {
        email
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="text-gray-500">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm">
            Password reset functionality will be coming soon . for not keep guessing! :)
          </div>
          <Link
            to="/login"
            className="block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                          text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium
                      text-white bg-gradient-to-r from-indigo-600 to-purple-600
                      rounded-lg hover:from-indigo-700 hover:to-purple-700
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Sending reset link...
              </div>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordForm;