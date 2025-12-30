import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ResetPasswordByToken = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.new_password) {
      newErrors.new_password = 'Please enter a new password';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: formData.new_password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error resetting password');
      }

      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error(err.message || 'Error resetting password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#faf9f7] px-4 sm:px-0">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 text-left mb-1">
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.new_password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400`}
              placeholder="Enter new password"
            />
            {errors.new_password && (
              <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 text-left">Password must be at least 8 characters</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 text-left mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400`}
              placeholder="Confirm new password"
            />
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordByToken;