import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Mail, Loader2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import PasswordInput from './PasswordInput';
import { auth, googleProvider, signInWithRedirect, getRedirectResult } from '../../config/firebase';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, forgotPassword } = useAuth();

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Google sign-in successful!', result.user);
        }
      } catch (error) {
        console.error('Google sign-in error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          setError('This domain is not authorized for Google sign-in. Please contact support.');
        } else {
          setError('Failed to complete Google sign-in. Please try again.');
        }
      }
    };

    handleRedirectResult();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await login(email, password);
      // No need to check success, Firebase will throw on error
    } catch (error) {
      console.log('Login error code:', error.code); // Debug log
      setError(getFirebaseErrorMessage(error.code || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      await forgotPassword(email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.log('Password reset error:', error.code, error.message); // Debug log
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        setError('No account exists with this email. Please sign up first.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      console.log('Starting Google sign-in...');
      await signInWithRedirect(auth, googleProvider);
      // The page will redirect to Google sign-in
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to start Google sign-in. Please try again.');
    }
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid email';
      case 'auth/user-disabled':
        return 'Account disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'User not registered... would you like to sign up?';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Forgot your password? Click reset password below.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        console.error('Firebase auth error:', errorCode);
        return 'Something went wrong. Please try again.';
    }
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
        
        {successMessage && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm">
            {successMessage}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot your password?
          </button>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>
        </div>

        <div className="text-sm text-center">
          <span className="text-gray-500">Don't have an account? </span>
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn}
          className="google-sign-in-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google"
              className="google-icon"
            />
          )}
          Sign in with Google
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginForm;