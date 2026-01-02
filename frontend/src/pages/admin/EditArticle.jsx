import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultThumbnail from '../../assets/Img_box_light.png';
import { IoChevronDownOutline } from "react-icons/io5";
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { toast } from 'sonner';
import { FiLoader } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    introduction: '',
    content: '',
    categoryId: '',
    thumbnailImage: null,
    thumbnailPreview: null,
    authorName: ''
  });

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Please log in');
          navigate('/admin/login');
          return;
        }

        const response = await axios.get(`${API_URL}/api/admin/articles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const article = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data;
        if (!article) {
          toast.error('Article not found');
          navigate('/admin/article-management');
          return;
        }
        setFormData({
          title: article.title,
          introduction: article.introduction || '',
          content: article.content || '',
          categoryId: article.category_id?.toString() || '',
          thumbnailPreview: article.thumbnail_url || null,
          authorName: user?.name || user?.username || ''
        });
      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('Failed to fetch article');
        navigate('/admin/article-management');
      }
    };

    fetchArticle();
  }, [id, user, navigate]);

  // ดึงข้อมูลหมวดหมู่
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Please log in');
          navigate('/admin/login');
          return;
        }

        const response = await axios.get(`${API_URL}/api/admin/categories`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.status === 'success') {
          setCategories(response.data.data);
        } else {
          toast.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, [navigate]);

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
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('File size must not exceed 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        thumbnailImage: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSaveAsDraft = async () => {
    console.log('Save as draft clicked');
    try {
      if (!formData.title.trim() || !formData.categoryId) {
        toast.error('Please enter article title and select category');
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please log in');
        navigate('/admin/login');
        return;
      }

      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('introduction', formData.introduction?.trim() || '');
      form.append('content', formData.content?.trim() || '');
      form.append('category_id', formData.categoryId);
      form.append('status', 'draft');
      if (formData.thumbnailImage) {
        form.append('thumbnail_image', formData.thumbnailImage);
      }

      console.log('Sending draft data:', Object.fromEntries(form.entries()));
      const response = await axios.put(`${API_URL}/api/admin/articles/${id}`, form, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Draft saved successfully');
        setTimeout(() => {
          navigate('/admin/article-management');
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/admin/login');
      } else {
        toast.error('Failed to save draft');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    console.log('Publish clicked');
    try {
      if (!formData.title.trim() || !formData.categoryId || !formData.introduction?.trim() || !formData.content?.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please log in');
        navigate('/admin/login');
        return;
      }

      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('introduction', formData.introduction.trim());
      form.append('content', formData.content.trim());
      form.append('category_id', formData.categoryId);
      form.append('status', 'published');
      if (formData.thumbnailImage) {
        form.append('thumbnail_image', formData.thumbnailImage);
      }

      console.log('Sending publish data:', Object.fromEntries(form.entries()));
      const response = await axios.put(`${API_URL}/api/admin/articles/${id}`, form, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Article saved and published successfully');
        setTimeout(() => {
          navigate('/admin/article-management');
        }, 1000);
      }
    } catch (error) {
      console.error('Error publishing:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/admin/login');
      } else {
        toast.error('Failed to publish article');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-[#F9F8F6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium text-[#26231E]">Edit article</h1>
            <div className="flex gap-2">
              <button
                onClick={handleSaveAsDraft}
                disabled={isLoading}
                className={`cursor-pointer px-[40px] py-[12px] text-sm font-medium text-[#26231E] bg-white border border-gray-300 rounded-full hover:bg-gray-50 flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? <FiLoader className="animate-spin mr-2" /> : null}
                Save as draft
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className={`cursor-pointer px-[40px] py-[12px] text-sm font-medium text-white bg-[#26231E] rounded-full hover:bg-gray-800 flex items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? <FiLoader className="animate-spin mr-2" /> : null}
                Save and publish
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Thumbnail Image */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Thumbnail image
            </label>
            <div className="flex gap-6">
              <div 
                className="bg-[#EFEEEB] rounded-xl shadow-sm w-[460px] h-[260px] border-2 border-dashed border-[#DAD6D1] cursor-pointer"
                onClick={() => document.getElementById('thumbnail-upload').click()}
              >
                <div className="relative h-full flex items-center justify-center">
                  <img
                    src={formData.thumbnailPreview || defaultThumbnail}
                    alt=""
                    className={`rounded-xl ${formData.thumbnailPreview ? 'w-full h-full object-cover' : 'w-[40px] h-[40px]'}`}
                  />
                </div>
              </div>
              <div className="flex items-end h-[260px] ml-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="px-[40px] py-[12px] text-sm font-medium text-[#26231E] bg-white border border-gray-300 rounded-full hover:bg-gray-50 cursor-pointer"
                >
                  Upload thumbnail image
                </label>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Category
            </label>
            <div className="bg-[#F9F8F6] -ml-4 relative">
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="text-[#75716B] w-[480px] h-[48px] px-4 py-2.5 ml-[-470px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 appearance-none bg-white"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 sm:right-[500px] top-1/2 transform -translate-y-1/2 pointer-events-none">
                <IoChevronDownOutline className="text-[#75716B] w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Author name
            </label>
            <div className="bg-[#F9F8F6] -ml-4">
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                className="text-[#75716B] ml-[-470px] w-[480px] h-[48px] px-4 py-2.5 text-base border border-gray-300 rounded-lg bg-[#EFEEEB] cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Title
            </label>
            <div className="bg-[#F9F8F6] -ml-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Article title"
                className="bg-white ml-[10px] w-[960px] h-[48px] px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          {/* Introduction */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Introduction (max 120 letters)
            </label>
            <div className="bg-[#F9F8F6] -ml-4">
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleInputChange}
                maxLength={120}
                rows={3}
                placeholder="Write a brief introduction"
                className="bg-white ml-[10px] w-[960px] min-h-[143px] px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 resize-y"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Content
            </label>
            <div className="bg-[#F9F8F6] -ml-4">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                placeholder="Write your article content"
                className="bg-white ml-[10px] w-[960px] min-h-[572px] px-4 py-2.5 mb-30 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 resize-y"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArticle; 