import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SignUp = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    full_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    full_name: false,
    username: false,
    email: false,
    password: false
  });
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.trim().length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers and underscore';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email must be a valid email';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const formErrors = {
      full_name: validateField('full_name', formData.full_name),
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };
    
    setErrors(formErrors);
    setTouched({
      full_name: true,
      username: true,
      email: true,
      password: true
    });
    
    // Check if there are any errors
    if (Object.values(formErrors).some(error => error)) {
      return;
    }
    
    const result = await register(formData);
    
    if (result.success) {
      navigate('/registration-success');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#faf9f7] px-4 sm:px-0">
      <div className="w-full max-w-[360px] sm:max-w-md p-5 sm:p-8 bg-[#EFEEEB] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign up</h2>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border ${errors.full_name && touched.full_name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white`}
              placeholder="Full name"
            />
            {errors.full_name && touched.full_name && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.full_name}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border ${errors.username && touched.username ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white`}
              placeholder="Username"
            />
            {errors.username && touched.username && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.username}</p>
            )}
          </div>
          
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
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white`}
              placeholder="Email"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.email}</p>
            )}
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
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white`}
              placeholder="Password"
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-500 text-left">{errors.password}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full sm:w-32 mx-auto block bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 