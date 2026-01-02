import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);

  // ดึงข้อมูล category ที่ต้องการแก้ไข
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/api/admin/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const category = response.data.data;
        setCategoryName(category.name);
        setDescription(category.description || '');
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to fetch category');
        navigate('/admin/category-management');
      }
    };

    fetchCategory();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmEdit = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/api/admin/categories/${id}`, 
        { 
          name: categoryName,
          description: description 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Category updated successfully');
      navigate('/admin/category-management');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
    setShowModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Edit category</h1>
        <button
          onClick={handleSubmit}
          className="px-[40px] py-[12px] text-sm font-medium text-white bg-gray-900 rounded-[999px] hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
        >
          Save
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="text-left block text-sm font-medium text-[#75716B] mb-2">
              Category name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              className="bg-white w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
              required
            />
          </div>
          <div>
            <label className="text-left block text-sm font-medium text-[#75716B] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description"
              className="bg-white w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400 min-h-[300px]"
            />
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#F5F5F5] bg-opacity-20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 w-[400px] shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-medium">Edit category</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-6">Do you want to edit this category?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[999px] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-[999px] hover:bg-gray-800 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCategory; 