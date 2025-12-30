import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ArticleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลบทความทั้งหมด
  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      // Add 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await axios.get(`${API_URL}/api/admin/articles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setArticles(response.data.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to fetch articles');
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลหมวดหมู่
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
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

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  // แสดง modal ยืนยันการลบ
  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  // ยกเลิกการลบ
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setArticleToDelete(null);
  };

  // ลบบทความ
  const handleDeleteArticle = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/api/admin/articles/${articleToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Article deleted successfully');
      fetchArticles();
      setShowDeleteModal(false);
      setArticleToDelete(null);
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  // กรองบทความตามการค้นหา สถานะ และหมวดหมู่
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || article.status === selectedStatus;
    const matchesCategory = !selectedCategory || article.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Article management</h1>
        <Link
          to="/admin/create-article"
          className="inline-flex items-center px-[40px] py-[12px] bg-[#26231E] text-white rounded-[999px] hover:bg-gray-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create article
        </Link>
      </div>

      <div className="space-y-4 mb-6">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg"
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
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer"
          >
            <option value="">Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer"
          >
            <option value="">Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <FiLoader className="w-6 h-6 text-gray-400 animate-spin mr-2" />
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ARTICLE TITLE
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
              <tbody className="bg-white divide-y divide-gray-200 text-left">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No articles found
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map(article => (
                    <tr key={article.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{article.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {article.category_name || categories.find(c => c.id === article.category_id)?.name || 'Uncategorized'}
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
                            to={`/admin/edit-article/${article.id}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(article)}
                            className="text-gray-600 hover:text-gray-900 cursor-pointer"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 w-[400px] shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Delete article</h2>
            <p className="text-gray-600 mb-6">Do you want to delete this article?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white/80 border border-gray-300 rounded-full hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteArticle}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600/90 rounded-full hover:bg-red-700"
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

export default ArticleManagement; 