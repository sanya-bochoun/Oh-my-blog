import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { FiEdit2, FiTrash2, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

function ArticleManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [viewAllArticles, setViewAllArticles] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const { user } = useAuth();
  
  // เพิ่ม state สำหรับ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();
    
  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      // Add 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await api.get(`${API_URL}/api/articles${viewAllArticles ? '?viewAll=true' : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('API Response (viewAllArticles:', viewAllArticles, '):', response.data);
      if (response.data.status === 'success') {
        setArticles(response.data.data);
      } else {
        toast.error('Failed to fetch articles');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Error fetching articles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [viewAllArticles, API_URL]);

  // Search articles
  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    try {
      const token = localStorage.getItem('accessToken');
      if (e.target.value.trim()) {
        const response = await api.get(
          `${API_URL}/api/articles/search?q=${e.target.value}${viewAllArticles ? '&viewAll=true' : ''}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (response.data.status === 'success') {
          setArticles(response.data.data);
        }
      } else {
        fetchArticles();
      }
    } catch (error) {
      console.error('Error searching articles:', error);
      toast.error('Error occurred while searching');
    }
  };

  // Toggle view all articles
  const handleViewAllToggle = () => {
    setViewAllArticles(prev => {
      const newValue = !prev;
      console.log('ViewAllArticles toggled:', newValue);
      return newValue;
    });
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(`${API_URL}/api/categories`);
      if (response.data.status === 'success') {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  }, [API_URL]);

  useEffect(() => {
    console.log('useEffect triggered, viewAllArticles:', viewAllArticles);
    fetchArticles();
    fetchCategories();
  }, [viewAllArticles, fetchArticles, fetchCategories]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || article.status === selectedStatus;
    const matchesCategory = !selectedCategory || article.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // คำนวณข้อมูลสำหรับ pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = (article) => {
    setSelectedArticleId(article.id);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setSelectedArticleId(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await api.delete(`${API_URL}/api/articles/${selectedArticleId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
        
      if (response.data.status === 'success') {
        toast.success(response.data.message);
        // อัพเดทรายการบทความทันที
        setArticles(articles.filter(article => article.id !== selectedArticleId));
      } else {
        toast.error(response.data.message || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error(error.response?.data?.message || 'Error deleting article. Please try again.');
    } finally {
      setSelectedArticleId(null);
      setShowDeleteModal(false);
    }
  };

  const handleBackClick = async () => {
    setIsNavigatingBack(true);
    // เพิ่ม delay เล็กน้อยเพื่อให้เห็น loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="w-8 h-8 text-gray-400 animate-spin mr-2" />
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen justify-center sm:justify-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8  sm:mt-20 mb-0 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Mobile: My Articles ด้านบน, Back ด้านล่าง */}
        <div className="block sm:hidden w-full mb-2">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2 mt-10 text-center">My Articles</h1>
        </div>
        {/* Desktop: กลุ่มปุ่ม Back, My Articles, View All Articles ชิดซ้าย */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto sm:justify-start">
          <button
            onClick={handleBackClick}
            disabled={isNavigatingBack}
            className="w-full sm:w-auto px-[40px] py-[12px] text-sm font-medium text-[#26231E] bg-white border border-gray-300 rounded-[999px] hover:bg-gray-50 sm:cursor-pointer sm:px-[40px]py-[12px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isNavigatingBack ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              'Back'
            )}
          </button>
          <h1 className="hidden sm:block text-2xl sm:text-2xl font-semibold text-gray-900">My Articles</h1>
          {user?.role === 'admin' && (
            <button
              onClick={handleViewAllToggle}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              {viewAllArticles ? 'View My Articles' : 'View All Articles'}
            </button>
          )}
        </div>
        {/* ปุ่ม Create article อยู่ขวาสุดใน desktop */}
        <div className="w-full sm:w-auto flex justify-end">
          <Link
            to="/create-article"
            className="w-full sm:w-auto px-4 sm:px-[40px] py-[12px] sm:py-[12px] text-sm font-medium text-white bg-gray-900 rounded-[999px] hover:bg-gray-800 flex items-center gap-2 justify-center sm:justify-start"
          >
            <span>+</span> Create article
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-white w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="
         bg-white w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="block sm:hidden">
          {/* Mobile View */}
          {currentItems.map((article) => (
            <div key={article.id} className="p-4 border-b border-gray-200">
              <div className="mb-2">
                <Link to={`/article/${article.slug}`} className="text-base font-medium text-gray-900 hover:text-blue-600">
                  {article.title}
                </Link>
                <div className="text-xs text-gray-500 mt-1">Author: {article.author_name || article.authorName || article.author?.username || article.Author?.username || '-'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    {categories.find(c => c.id === article.category_id)?.name || 'Uncategorized'}
                  </div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    article.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    to={`/edit-article/${article.id}`}
                    className="text-gray-600 hover:text-gray-900 p-2"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(article)}
                    className="text-gray-600 hover:text-red-600 cursor-pointer p-2"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - ไม่เปลี่ยนแปลง */}
        <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TITLE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AUTHOR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CATEGORY
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4">
                  <Link to={`/article/${article.slug}`} className="text-sm text-gray-900 hover:text-blue-600">
                    {article.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {article.author_name || article.authorName || article.author?.username || article.Author?.username || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {categories.find(c => c.id === article.category_id)?.name || 'Uncategorized'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    article.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex items-center space-x-4">
                    <Link
                      to={`/edit-article/${article.id}`}
                      className="text-gray-600 hover:text-gray-900"
                      title="Edit this article"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(article)}
                      className="text-gray-600 hover:text-red-600 cursor-pointer"
                      title="Delete this article"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6 pb-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`w-8 h-8 sm:px-3 sm:py-1 rounded-md text-sm flex items-center justify-center ${
                currentPage === index + 1
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3 py-1 rounded-md bg-white border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-[400px] shadow-lg mx-4">
            <h2 className="text-xl font-semibold mb-4">Delete article</h2>
            <p className="text-gray-600 mb-6">Do you want to delete this article?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 sm:px-6 py-2 text-sm font-medium text-gray-700 bg-white/80 border border-gray-300 rounded-full hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-red-600/90 rounded-full hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleManagement; 