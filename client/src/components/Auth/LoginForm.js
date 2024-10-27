import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Mail, Loader2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import PasswordInput from './PasswordInput';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password, rememberMe);
    if (!result.success) {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <div className="text-center space-y-2 mb-6">
        <p className="text-gray-500">Track your daily progress and build momentum</p>
      </div>

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

        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          label="Password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </Link>
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
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              New to Mōmentum?
            </span>
          </div>
        </div>

        <Link
          to="/register"
          className="w-full flex justify-center px-4 py-2 text-sm font-medium
                    text-indigo-600 bg-indigo-50 rounded-lg
                    hover:bg-indigo-100 transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create an account
        </Link>
      </form>
    </AuthLayout>
  );
};