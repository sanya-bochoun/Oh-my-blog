import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { FiLoader, FiUpload } from 'react-icons/fi';
import { IoChevronDownOutline, IoArrowBack } from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth';

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    introduction: '',
    authorName: user?.username || '',
    thumbnailPreview: null,
    thumbnailFile: null
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await api.get(`${API_URL}/api/articles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.status === 'success') {
          const article = response.data.data;
          setFormData({
            title: article.title || '',
            content: article.content || '',
            category: article.category_id?.toString() || '',
            introduction: article.introduction || '',
            authorName: user?.username || '',
            thumbnailPreview: article.thumbnail_url || null,
            thumbnailFile: null
          });
        } else {
          toast.error('Failed to fetch article');
          navigate('/my-articles');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('Error fetching article. Please try again.');
        navigate('/my-articles');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get(`${API_URL}/api/categories`);
        if (response.data.status === 'success') {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      }
    };

    fetchArticle();
    fetchCategories();
  }, [id, navigate, user, API_URL]);

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
      setFormData(prev => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!formData.title || !formData.category) {
        toast.error('Title and category are required');
        return;
      }

      let response;
      if (formData.thumbnailFile) {
        // อัปโหลดไฟล์ใหม่
        const form = new FormData();
        form.append('title', formData.title);
        form.append('content', formData.content);
        form.append('categoryId', formData.category);
        form.append('introduction', formData.introduction);
        form.append('status', 'draft');
        form.append('thumbnailImage', formData.thumbnailFile);

        response = await api.put(
          `${API_URL}/api/articles/${id}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`
              // ไม่ต้องใส่ Content-Type, browser จะจัดการเอง
            }
          }
        );
      } else {
        // ไม่อัปโหลดไฟล์ใหม่
        const submitData = {
          title: formData.title,
          content: formData.content,
          categoryId: formData.category,
          introduction: formData.introduction,
          status: 'draft'
        };
        response = await api.put(
          `${API_URL}/api/articles/${id}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.data.status === 'success') {
        toast.success('Article saved as draft');
        navigate('/article-management');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!formData.title || !formData.category) {
        toast.error('Title and category are required');
        return;
      }

      let response;
      if (formData.thumbnailFile) {
        // อัปโหลดไฟล์ใหม่
        const form = new FormData();
        form.append('title', formData.title);
        form.append('content', formData.content);
        form.append('categoryId', formData.category);
        form.append('introduction', formData.introduction);
        form.append('status', 'published');
        form.append('thumbnailImage', formData.thumbnailFile);

        response = await api.put(
          `${API_URL}/api/articles/${id}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        // ไม่อัปโหลดไฟล์ใหม่
        const submitData = {
          title: formData.title,
          content: formData.content,
          categoryId: formData.category,
          introduction: formData.introduction,
          status: 'published'
        };
        response = await api.put(
          `${API_URL}/api/articles/${id}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.data.status === 'success') {
        toast.success('Article published successfully');
        navigate('/article-management');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish article');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] mt-4 sm:mt-10">
      {/* Header */}
      <div className="border-b border-gray-200 bg-[#F9F8F6] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-4 sm:gap-6 order-1">
              <button
                onClick={() => navigate('/article-management')}
                className="flex items-center justify-center sm:justify-start gap-2 px-[40px] py-[12px] text-sm font-medium text-[#26231E] bg-white border border-gray-200 rounded-[999px] hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer w-full sm:w-auto sm:px-[40px] sm:py-[12px] sm:round-[999px]"
              >
                <IoArrowBack className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-medium text-[#26231E] text-center sm:text-left">Edit article</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2">
              <button
                onClick={handleSaveAsDraft}
                disabled={isSaving}
                className="w-full sm:w-auto px-[40px] py-[12px] text-sm font-medium text-[#26231E] bg-white border border-gray-300 rounded-full hover:bg-gray-50 sm:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save as draft'
                )}
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full sm:w-auto px-[40px] py-[12px] text-sm font-medium text-white bg-[#26231E] rounded-full hover:bg-gray-800 sm:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <div className="flex items-center justify-center gap-2">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </div>
                ) : (
                  'Save and publish'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-8">
          {/* Thumbnail Image */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-2 sm:mb-3 sm:text-left">
              Thumbnail image
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-[#EFEEEB] rounded-xl shadow-sm w-full sm:w-[460px] h-[200px] sm:h-[260px] border-2 border-dashed border-[#DAD6D1] cursor-pointer"
                onClick={() => document.getElementById('thumbnail-upload').click()}
              >
                <div className="relative h-full flex items-center justify-center">
                  {formData.thumbnailPreview ? (
                    <img
                      src={formData.thumbnailPreview}
                      alt=""
                      className="rounded-xl w-full h-full object-cover"
                    />
                  ) : (
                    <FiUpload className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center sm:items-end sm:h-[260px] ml-0 sm:ml-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="w-full sm:w-auto px-[40px] py-[12px] text-sm font-medium text-[#26231E] bg-white border border-gray-300 rounded-full hover:bg-gray-50 cursor-pointer text-center"
                >
                  Upload thumbnail image
                </label>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-2 sm:mb-3 text-left">
              Category
            </label>
            <div className="bg-[#F9F8F6] relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="text-[#75716B] w-full sm:w-[480px] h-[48px] px-4 py-2.5 sm:ml-[-470px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 appearance-none bg-white"
              >
                <option value="">Select category</option>
                {categories.map(category => (
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
            <div className="bg-[#F9F8F6] `-ml-0` sm:-ml-4">
              <input
                type="text"
                value={user?.username || ''}
                className="text-[#75716B] w-full sm:w-[480px] h-[48px] px-4 py-2.5 sm:ml-[-470px] text-base border border-gray-300 rounded-lg bg-[#EFEEEB] cursor-not-allowed"
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Title
            </label>
            <div className="bg-[#F9F8F6] `-ml-0` sm:-ml-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Article title"
                className="bg-white w-full sm:w-[960px] h-[48px] px-4 py-2.5 sm:ml-[10px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          {/* Introduction */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Introduction (max 350 letters)
            </label>
            <div className="bg-[#F9F8F6] `-ml-0` sm:-ml-4">
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleInputChange}
                maxLength={350}
                rows={3}
                placeholder="Write a brief introduction"
                className="bg-white w-full sm:w-[960px] min-h-[143px] px-4 py-2.5 sm:ml-[10px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 resize-y"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
              Content
            </label>
            <div className="bg-[#F9F8F6] `-ml-0` sm:-ml-4">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                placeholder="Write your article content"
                className="bg-white w-full sm:w-[960px] min-h-[572px] px-4 py-2.5 mb-30 sm:ml-[10px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 resize-y"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArticle; 