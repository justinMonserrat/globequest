import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your quest</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Sign up
              </Link>
            </p>
            <Link
              to="/"
              className="block mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;

