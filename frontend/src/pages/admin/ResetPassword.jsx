import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmReset = async () => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/api/users/reset-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        toast.success('Password changed successfully');
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Close modal
        setShowConfirmModal(false);
        // Redirect to reset-password page
        navigate('/admin/reset-password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Error changing password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Reset password</h1>
        <button
          onClick={handleSubmit}
          className="px-[40px] py-[16px] text-sm font-medium text-white bg-gray-900 rounded-[999px] hover:bg-gray-800 cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Reset password'}
        </button>
      </div>

      <div className="bg-[#EFEEEB] rounded-lg shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm text-[#777777] mb-1 text-left">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter your current password"
              className="w-full p-2 bg-white border border-[#E0E0E0] rounded-md"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-[#777777] mb-1 text-left">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              className="w-full p-2 bg-white border border-[#E0E0E0] rounded-md"
              required
            />
            <p className="mt-1 text-xs text-[#999999] text-left">Password must be at least 6 characters</p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm text-[#777777] mb-1 text-left">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              className="w-full p-2 bg-white border border-[#E0E0E0] rounded-md"
              required
            />
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-medium mb-4">Confirm Password Reset</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset your password?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword; 