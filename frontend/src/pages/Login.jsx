import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData);
    
    if (result.success) {
      toast.success('Login successful');
      navigate('/');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#faf9f7] px-4 sm:px-0">
      <div className="w-full max-w-[360px] sm:max-w-md p-5 sm:p-8 bg-[#EFEEEB] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Log in</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              placeholder="Enter your password"
              required
            />
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full sm:w-32 mx-auto block bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 