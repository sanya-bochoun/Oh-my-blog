import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // ใช้รูปโลโก้ default เป็นค่าเริ่มต้น
  const defaultImage = '/src/assets/default-logo.png';

  // ใช้ useEffect เพื่อให้มั่นใจว่าเราอัพเดทข้อมูลเมื่อ user โหลดเสร็จ
  useEffect(() => {
    if (user) {
      setProfileImage(user.avatar_url || defaultImage);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // ลบข้อความแจ้งเตือนเมื่อผู้ใช้เริ่มแก้ไข
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.current_password) {
      newErrors.current_password = 'Please enter your current password';
    }
    
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

    setShowConfirmModal(true);
  };

  const handleConfirmReset = async () => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.current_password,
          newPassword: formData.new_password,
          confirmPassword: formData.confirm_password
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully');
        setShowConfirmModal(false);
        navigate('/');
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error(err.message || 'Failed to change password. Please try again');
      
      if (err.message.includes('current password is incorrect')) {
        setErrors(prev => ({
          ...prev,
          current_password: 'Current password is incorrect'
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen pt-8 md:pt-28 ">
      <div className="max-w-5xl mx-auto px-4">
        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="bg-[#F9F9F9] mb-4">
            <div className="flex items-center space-x-6 p-4">
              <Link to="/profile" className="flex items-center space-x-2 text-gray-500">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profile</span>
              </Link>
              <Link to="/reset-password" className="flex items-center space-x-2 text-gray-900">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Reset password</span>
              </Link>
            </div>
          </div>

          {/* Profile Header with Image */}
          <div className="bg-[#F9F9F9] p-4 mb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img 
                src={profileImage || defaultImage}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
              />
            </div>
            <div className="flex items-center">
              <span className="text-[#4A4A4A] text-lg">{user?.username || 'User'}</span>
              <span className="mx-2 text-[#4A4A4A]">|</span>
              <span className="text-[#4A4A4A]">Reset Password</span>
            </div>
          </div>

          <div className="bg-[#EFEEEB] p-6 rounded-lg mt-4">
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img 
                  src={profileImage || defaultImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1 text-left">Current Password</label>
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  className={`bg-white w-full p-3 border ${errors.current_password ? 'border-red-500' : 'border-gray-200'} rounded-lg`}
                  placeholder="Enter your current password"
                />
                {errors.current_password && (
                  <p className="mt-1 text-sm text-red-500">{errors.current_password}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-600 mb-1 text-left">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className={`bg-white w-full p-3 border ${errors.new_password ? 'border-red-500' : 'border-gray-200'} rounded-lg`}
                  placeholder="Enter your new password"
                />
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
                )}
                <p className="mt-1 text-xs text-[#999999]">Password must be at least 8 characters</p>
              </div>
              
              <div>
                <label className="block text-gray-600 mb-1 text-left">Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`bg-white w-full p-3 border ${errors.confirm_password ? 'border-red-500' : 'border-gray-200'} rounded-lg`}
                  placeholder="Confirm your new password"
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
                )}
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full h-[48px] bg-[#26231E] text-white rounded-[999px] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Desktop View - ไม่มีการเปลี่ยนแปลง */}
        <div className="hidden md:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#777777]">
              <img 
                src={profileImage || defaultImage} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl"><span className="text-gray-500">{user?.username || user?.full_name || 'ผู้ใช้'}</span> <span className="text-gray-500">|</span> <span className="font-medium">Reset Password</span></h1>
          </div>

          <div className="flex">
            {/* Left Menu */}
            <div className="w-60 pr-6">
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/profile" 
                  className="flex items-center py-3 px-4 text-gray-700"
                >
                  <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </Link>
                
                <Link 
                  to="/reset-password" 
                  className="flex items-center py-3 px-4 text-gray-900 font-medium"
                >
                  <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Reset password
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 pl-10">
              <div className="bg-[#EFEEEB] rounded-lg shadow-sm p-8 max-w-2xl ml-auto mr-10">
                <div className="flex items-center justify-start gap-6 mb-6">
                  <div className="w-24 h-24 overflow-hidden rounded-full bg-[#777777]">
                    <img 
                      src={profileImage || defaultImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-lg font-medium">Reset Password</h2>
                </div>
                
                <div className="border-t border-gray-200 my-4"></div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm text-[#777777] mb-1 text-left">Current Password</label>
                    <input
                      type="password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleChange}
                      className={`w-full p-2 bg-white border ${errors.current_password ? 'border-red-500' : 'border-[#E0E0E0]'} rounded-md`}
                      placeholder="Enter your current password"
                    />
                    {errors.current_password && (
                      <p className="mt-1 text-sm text-red-500">{errors.current_password}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm text-[#777777] mb-1 text-left">New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      className={`w-full p-2 bg-white border ${errors.new_password ? 'border-red-500' : 'border-[#E0E0E0]'} rounded-md`}
                      placeholder="Enter your new password"
                    />
                    {errors.new_password && (
                      <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
                    )}
                    <p className="mt-1 text-xs text-[#999999] text-left">Password must be at least 8 characters</p>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-sm text-[#777777] mb-1 text-left">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className={`w-full p-2 bg-white border ${errors.confirm_password ? 'border-red-500' : 'border-[#E0E0E0]'} rounded-md`}
                      placeholder="Confirm your new password"
                    />
                    {errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-start mt-6">
                    <button
                      type="submit"
                      className="px[40px] py-[12px] bg-[#26231E] text-white rounded-[999px] hover:bg-gray-800 disabled:opacity-50"
                      style={{ padding: '12px 40px' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Reset password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-medium text-center mb-4">Reset password</h2>
            <p className="text-center text-gray-600 mb-6">Do you want to reset your password?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50/80 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={isSubmitting}
                className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors duration-200"
              >
                {isSubmitting ? 'Processing...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword; 