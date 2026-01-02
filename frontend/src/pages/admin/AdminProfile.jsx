import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

const AdminProfile = () => {
  const { updateUser } = useAuth();
  const defaultAvatar = 'https://via.placeholder.com/150';
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    bio: '',
    profilePicture: null,
    profilePicturePreview: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const { user } = response.data.data;
        setFormData({
          full_name: user.full_name || '',
          username: user.username || '',
          email: user.email || '',
          bio: user.bio || '',
          profilePicture: null,
          profilePicturePreview: user.avatar_url || null
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // 1. ส่งข้อมูลทั่วไป
      const profileResponse = await axios.put(
        `${API_URL}/api/users/profile`,
        {
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let updatedUserData = profileResponse.data.data.user;

      // 2. ถ้ามีการอัพโหลดรูปภาพ
      if (formData.profilePicture) {
        const imageFormData = new FormData();
        imageFormData.append('avatar', formData.profilePicture);

        const avatarResponse = await axios.post(
          `${API_URL}/api/users/avatar`,
          imageFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        updatedUserData = avatarResponse.data.data.user;
      }

      // อัพเดตข้อมูลใน context
      updateUser(updatedUserData);

      // อัพเดตข้อมูลในฟอร์ม
      setFormData({
        full_name: updatedUserData.full_name || '',
        username: updatedUserData.username || '',
        email: updatedUserData.email || '',
        bio: updatedUserData.bio || '',
        profilePicture: null,
        profilePicturePreview: updatedUserData.avatar_url || null
      });

      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Profile</h1>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="cursor-pointer px-[40px] py-[12px] text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={formData.profilePicturePreview || defaultAvatar}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-upload"
            />
            <label
              htmlFor="profile-upload"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 cursor-pointer"
            >
              Upload profile picture
            </label>
          </div>
          <p className="text-xs text-left ml-32 text-gray-500">Maximum file size: 5MB</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#75716B] mb-2 text-left">
            Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-[#75716B] mb-2 text-left">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#75716B] mb-2 text-left">
            Email
          </label>
          <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 text-left">
            {formData.email}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-[#75716B] mb-2 text-left">
            Bio (max 120 characters)
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={6}
            maxLength={120}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 resize-none"
          />
        </div>
      </form>
    </div>
  );
};

export default AdminProfile; 