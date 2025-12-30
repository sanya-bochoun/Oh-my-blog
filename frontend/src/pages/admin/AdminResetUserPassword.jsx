import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminResetUserPassword = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // ดึงข้อมูลผู้ใช้
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to fetch user information');
        navigate('/admin/user-management');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetClick = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmReset = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${API_URL}/api/admin/users/${userId}/reset-password`,
        { newPassword: formData.newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Password reset successfully');
      navigate('/admin/user-management');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Reset user password</h1>
        <button
          onClick={handleResetClick}
          className="px-[40px] py-[16px] text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 cursor-pointer"
        >
          Reset password
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        <h2 className="text-sm font-medium text-gray-700 mb-4">User Information</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Name:</span> {user.username}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email:</span> {user.email}
          </p>
        </div>
      </div>

      <form onSubmit={handleResetClick} className="space-y-6">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            New password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="New password"
            className="bg-white w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
            required
          />
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Confirm new password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm new password"
            className="bg-white w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
            required
          />
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-xl">
            <h2 className="text-xl font-medium mb-4">Confirm Password Reset</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset the password for user "{user.username}"?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[999px] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-[999px] hover:bg-gray-800"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResetUserPassword; 