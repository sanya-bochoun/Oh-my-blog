import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultThumbnail from '../assets/Img_box_light.png';
import { IoChevronDownOutline } from "react-icons/io5";
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { toast } from 'sonner';


function CreateArticle() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [formData, setFormData] = useState({
    title: '',
    introduction: '',
    content: '',
    category: '',
    thumbnailImage: null,
    thumbnailPreview: null,
    authorName: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await api.get(`${API_URL}/api/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const categoriesData = response.data.data || response.data;
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          console.error('Categories data is not an array:', categoriesData);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    if (isAuthenticated) {
      fetchCategories();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, API_URL]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        authorName: user.name || user.username
      }));
    }
  }, [user]);

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
        thumbnailImage: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนบันทึกบทความ');
        navigate('/login');
        return;
      }

      if (!formData.title.trim()) {
        toast.error('กรุณากรอกชื่อบทความ');
        return;
      }
      if (!formData.category) {
        toast.error('กรุณาเลือกหมวดหมู่');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('introduction', formData.introduction.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('categoryId', formData.category);
      formDataToSend.append('status', 'draft');
      
      if (formData.thumbnailImage) {
        formDataToSend.append('thumbnailImage', formData.thumbnailImage);
      }

      console.log('Sending data:', {
        title: formData.title.trim(),
        introduction: formData.introduction.trim(),
        content: formData.content.trim(),
        categoryId: formData.category,
        status: 'draft',
        hasImage: !!formData.thumbnailImage
      });

      const response = await api.post(`${API_URL}/api/articles`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.data.status === 'success') {
        toast.success('บันทึกบทความเป็นฉบับร่างเรียบร้อยแล้ว');
        navigate('/article-management');
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึกบทความ');
      }
    } catch (error) {
      console.error('Error saving article as draft:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 403) {
        toast.error('ไม่มีสิทธิ์ในการบันทึกบทความ กรุณาเข้าสู่ระบบใหม่');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกบทความ');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนเผยแพร่บทความ');
        navigate('/login');
        return;
      }

      if (!formData.title.trim()) {
        toast.error('กรุณากรอกชื่อบทความ');
        return;
      }
      if (!formData.category) {
        toast.error('กรุณาเลือกหมวดหมู่');
        return;
      }
      if (!formData.content.trim()) {
        toast.error('กรุณากรอกเนื้อหาบทความ');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('introduction', formData.introduction.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('categoryId', formData.category);
      formDataToSend.append('status', 'published');
      
      if (formData.thumbnailImage) {
        formDataToSend.append('thumbnailImage', formData.thumbnailImage);
      }

      console.log('Sending data:', {
        title: formData.title.trim(),
        introduction: formData.introduction.trim(),
        content: formData.content.trim(),
        categoryId: formData.category,
        status: 'published',
        hasImage: !!formData.thumbnailImage
      });

      const response = await api.post(`${API_URL}/api/articles`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.data.status === 'success') {
        toast.success('เผยแพร่บทความเรียบร้อยแล้ว');
        navigate('/article-management');
      } else {
        toast.error('เกิดข้อผิดพลาดในการเผยแพร่บทความ');
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 403) {
        toast.error('ไม่มีสิทธิ์ในการเผยแพร่บทความ กรุณาเข้าสู่ระบบใหม่');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเผยแพร่บทความ');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] mt-10 sm:mt-30">
      {/* Header */}
      <div className="border-b border-gray-200 bg-[#F9F8F6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            {/* Mobile: หัวข้ออยู่บนปุ่ม Back */}
            <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:gap-4 sm:w-auto order-1">
              <h1 className="block sm:hidden text-2xl font-medium text-[#26231E] text-center mt-8 mb-2">Create article</h1>
              <button
                onClick={() => navigate('/article-management')}
                className="w-full sm:w-auto px-[40px] py-[12px] text-sm font-medium text-[#26231E] bg-white border border-gray-300 rounded-[999px] hover:bg-gray-50 sm:cursor-pointer sm:px-[40px]py-[12px]"
              >
                Back
              </button>
              {/* Desktop: หัวข้ออยู่ข้างปุ่ม Back */}
              <h1 className="hidden sm:block text-2xl font-medium text-[#26231E] text-left ml-4">Create article</h1>
            </div>
            <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto order-2">
              <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-2 sm:w-auto">
                <button
                  onClick={handleSaveAsDraft}
                  disabled={isSaving || isPublishing}
                  className="w-full sm:w-auto px-[40px] py-[12px] text-sm font-medium text-[#26231E] bg-white border border-gray-300 rounded-[999px] hover:bg-gray-50 sm:cursor-pointer sm:px-[40px]py-[12px] mb-2 sm:mb-0"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    'Save as draft'
                  )}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isSaving || isPublishing}
                  className="w-full sm:w-auto px-[40px] py-[12px] text-sm font-medium text-white bg-[#26231E] rounded-[999px] hover:bg-gray-800 sm:cursor-pointer sm:px-[40px]py-[12px]"
                >
                  {isPublishing ? (
                    <span>Publishing...</span>
                  ) : (
                    'Save and publish'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2 sm:mt-16">
        {/* Thumbnail Image */}
        <div>
          <label className="block text-base font-medium text-[#75716B] mb-3 sm:text-left">
            Thumbnail image
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-[#EFEEEB] rounded-xl shadow-sm w-full sm:w-[460px] h-[260px] border-2 border-dashed border-[#DAD6D1] cursor-pointer"
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
            <div className="flex items-center sm:items-end sm:h-[260px] ml-0 sm:ml-4">
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
          <label className="block text-base font-medium text-[#75716B] mb-3 text-left">
            Category
          </label>
          <div className="bg-[#F9F8F6] `-ml-0` sm:-ml-4 relative">
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="text-[#75716B] w-full sm:w-[480px] h-[48px] px-4 py-2.5 sm:ml-[-470px] text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 appearance-none bg-white"
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
          <div className="bg-[#F9F8F6] `-ml-0` sm:-ml-4">
            <input
              type="text"
              name="authorName"
              value={formData.authorName}
              className="text-[#75716B] w-full sm:w-[480px] h-[48px] px-4 py-2.5 sm:ml-[-470px] text-base border border-gray-300 rounded-lg bg-[#EFEEEB] cursor-not-allowed"
              disabled
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
  );
}

export default CreateArticle; 