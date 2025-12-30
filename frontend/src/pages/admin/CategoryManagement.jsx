import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

const CategoryManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // Add 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Fetching categories with token:', token);
      const response = await axios.get(`${API_URL}/api/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('API Response:', response.data);
      // เนื่องจาก backend ส่งข้อมูลมาในรูปแบบ { status: 'success', data: [...] }
      if (response.data.status === 'success') {
        setCategories(response.data.data);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error.response || error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Search categories
  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    try {
      const token = localStorage.getItem('accessToken');
      if (e.target.value.trim()) {
        const response = await axios.get(`${API_URL}/api/admin/categories/search?q=${e.target.value}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCategories(response.data.data);
      } else {
        fetchCategories(); // If no search term, fetch all
      }
    } catch (error) {
      console.error('Error searching categories:', error);
      toast.error('Error occurred while searching');
    }
  };

  // Show delete confirmation modal
  const handleDeleteClick = (id) => {
    setSelectedCategoryId(id);
    setShowDeleteModal(true);
  };

  // Delete category
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/api/admin/categories/${selectedCategoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('ลบหมวดหมู่สำเร็จ');
      fetchCategories();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'ไม่สามารถลบหมวดหมู่ได้';
      toast.error(errorMsg);
    } finally {
      setShowDeleteModal(false);
      setSelectedCategoryId(null);
    }
  };

  // Edit category
  const handleEdit = (id) => {
    navigate(`/admin/edit-category/${id}`);
  };

  // Load data when component is mounted and authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, fetchCategories]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Category management</h1>
        <button 
          onClick={() => navigate('/admin/create-category')}
          className="px-[40px] py-[12px] text-sm font-medium text-white bg-gray-900 rounded-[999px] hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
        >
          <span>+</span> Create category
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-left text-medium font-medium text-gray-700">Category</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <FiLoader className="w-6 h-6 text-gray-400 animate-spin mr-2" />
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">No categories found</div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-100">
                <span className="text-sm text-gray-900">{category.name}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-[400px] shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-medium">Delete category</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-6">Do you want to delete this category?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[999px] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-[999px] hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement; 