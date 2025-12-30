import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogCard from './BlogCard';
import SearchDropdown from './ui/SearchDropdown';
import { fetchPosts } from '../services/api';
import { formatDate } from '../utils/date';
import axios from 'axios';

const LOADING_DELAY = 1000; // 1 second delay
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ArticleSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([{ id: 0, name: 'Highlight' }]); // เปลี่ยนเป็น array ของ object
  const [selectedCategory, setSelectedCategory] = useState(0); // เก็บ id
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const searchMobileRef = useRef(null);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  
  // ผสาน click outside effect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (searchRef.current && !searchRef.current.contains(event.target)) &&
        (searchMobileRef.current && !searchMobileRef.current.contains(event.target))
      ) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // เพิ่มฟังก์ชันสำหรับดึงข้อมูล categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/categories`);
      // ดึงข้อมูลจาก response.data.data ตามที่ API ส่งกลับมา
      const categoryObjs = [{ id: 0, name: 'Highlight' }, ...response.data.data.map(cat => ({ id: cat.id, name: cat.name }))];
      setCategories(categoryObjs);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([{ id: 0, name: 'Highlight' }, { id: 1, name: 'Cat' }, { id: 2, name: 'Inspiration' }, { id: 3, name: 'General' }]);
    }
  };

  // เรียกใช้ฟังก์ชัน fetchCategories เมื่อ component โหลด
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleArticleClick = (slug) => {
    if (!slug) {
      console.error('No slug provided to handleArticleClick!', slug);
      return;
    }
    navigate(`/article/${slug}`);
    setShowSearchResults(false);
    setSearchTerm('');
  };

  const fetchSearchResults = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/posts`, {
        params: {
          search: query,
          limit: 5 // จำกัดผลลัพธ์ให้แสดงแค่ 5 รายการ
        }
      });
      setSearchResults(
        response.data.data.posts.map(post => ({
          ...post,
          slug: post.slug || '',
        }))
      );
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error searching posts:', err);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const loadPosts = async (page) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add delay before fetching
      await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
      
      const data = await fetchPosts({
        page,
        category: selectedCategory === 0 ? '' : selectedCategory,
        keyword: searchTerm
      });
      
      // Format dates before setting posts
      console.log('Raw posts from backend:', data.data.posts); // log posts
      const formattedPosts = data.data.posts.map(post => ({
        ...post,
        date: formatDate(post.created_at || post.date),
        slug: post.slug || '', // fallback ถ้าไม่มี slug
      }));
      
      if (page === 1) {
        // Reset posts if it's first page
        setPosts(formattedPosts);
      } else {
        // Append new posts to existing ones
        setPosts(prevPosts => [...prevPosts, ...formattedPosts]);
      }

      // Check if we have more posts to load
      const pagination = data.data.pagination;
      setHasMore(pagination.page < pagination.total_pages);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial posts or when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadPosts(1);
  }, [selectedCategory, searchTerm]);

  // สำหรับการค้นหาแบบ real-time
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSearchResults(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    if (searchTerm.length >= 1) {
      setShowSearchResults(true);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadPosts(nextPage);
  };

  // แยก categories เป็น 5 อันแรก (ไม่รวม Highlight) และที่เหลือ
  const mainCategories = categories.slice(0, 6); // Highlight + 5 อันแรก
  const extraCategories = categories.length > 6 ? categories.slice(6) : [];

  return (
    <section className="article-section flex flex-col justify-start items-center min-h-screen w-full bg-[#F8F7F6] mb-12">
      <div className="article-container w-[375px] md:w-full sm:container mx-auto">
        <div className="article-content w-full px-4 md:px-6 lg:px-8">
          <h1 className="article-title font-semibold text-[#26231E] text-[24px] text-left leading-[32px] tracking-[0%] mb-8">Latest articles</h1>
          
          {/* Mobile View */}
          <div className="search-mobile md:hidden">
            {/* Search Input */}
            <div ref={searchMobileRef} className="search-mobile-input-container relative mb-6">
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="w-full h-12 pl-4 pr-12 rounded-full bg-white border border-gray-200 focus:outline-none"
                />
                <div className="absolute right-4 flex items-center justify-center">
                  {isSearching ? (
                    <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                  ) : (
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#75716B] hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                    >
                      <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Search Dropdown for Mobile */}
              <SearchDropdown 
                results={searchResults}
                isVisible={showSearchResults}
                onSelect={handleArticleClick}
              />
            </div>
            
            {/* Category Dropdown */}
            <div className="category-mobile-container mb-6 text-left">
              <p className="category-mobile-label font-medium text-[#75716B] text-[16px] leading-[24px] tracking-[0%] mb-2">Category</p>
              <div className="category-mobile-select-wrapper relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-mobile-select w-full h-14 px-4 rounded-lg border border-gray-200 bg-white font-medium text-[#75716B] text-[16px] leading-[24px] appearance-none"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <div className="category-mobile-select-icon absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop View */}
          <nav className="search-desktop hidden md:block">
            <div className="search-desktop-container flex items-center justify-between h-[80px] bg-[#EFEEEB] pt-[16px] pr-[24px] pb-[16px] pl-[24px] rounded-[16px]">
              <div className="category-buttons flex items-center gap-2">
                {/* แสดง 5 อันแรกเป็น text เฉยๆ */}
                {mainCategories.map((category) => (
                  <span
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`cursor-pointer rounded transition ${
                      selectedCategory === category.id 
                        ? 'px-4 py-2 bg-white rounded-md font-medium text-[#26231E] text-[16px]' 
                        : 'px-4 py-2 rounded-md font-medium text-[#75716B] text-[16px]'
                    }`}
                  >
                    {category.name}
                  </span>
                ))}
                {/* ถ้ามีมากกว่า 5 อัน ให้แสดง custom dropdown (More) */}
                {extraCategories.length > 0 && (
                  <div className="relative ml-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 bg-transparent text-base cursor-pointer select-none"
                      onClick={() => setShowMoreDropdown((prev) => !prev)}
                      onBlur={() => setTimeout(() => setShowMoreDropdown(false), 150)}
                    >
                      More
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {showMoreDropdown && (
                      <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow z-10">
                        {extraCategories.map((category) => (
                          <div
                            key={category.id}
                            onClick={() => { setSelectedCategory(category.id); setShowMoreDropdown(false); }}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-base rounded transition ${
                              selectedCategory === category.id 
                                ? 'px-4 py-2 bg-white rounded-md font-medium text-[#26231E] text-[16px]' 
                                : 'px-4 py-2 rounded-md font-medium text-[#75716B] text-[16px]'
                            }`}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div ref={searchRef} className="search-desktop-input-container relative ml-auto w-full md:w-[350px] lg:w-[400px] xl:w-[450px]">
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    className="w-full h-12 pl-4 pr-12 rounded-full bg-white border border-gray-200 focus:outline-none"
                  />
                  <div className="absolute right-4 flex items-center justify-center">
                    {isSearching ? (
                      <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                    ) : (
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#75716B] hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                      >
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Search Dropdown for Desktop */}
                <SearchDropdown 
                  results={searchResults}
                  isVisible={showSearchResults}
                  onSelect={handleArticleClick}
                />
              </div>
            </div>
          </nav>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-center my-4">
              {error}
            </div>
          )}

          {/* Blog Posts Grid */}
          <div className="blog-posts-grid grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                id={post.id}
                slug={post.slug}
                image={post.thumbnail_url || post.image}
                category={post.category_name || post.category}
                title={post.title}
                description={post.excerpt || post.description}
                author={post.author_name || post.author}
                authorImage={post.author_avatar || post.authorImage}
                date={formatDate(post.created_at || post.date)}
                onClick={handleArticleClick}
              />
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading posts...</span>
            </div>
          )}

          {/* View More Button */}
          {hasMore && !isLoading && (
            <div className="text-center mt-8 mb-12">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2.5 rounded-full border border-[#DAD6D1] hover:border-gray-400 text-sm font-medium text-gray-600 hover:text-gray-800 transition-all duration-200 ease-in-out flex items-center justify-center mx-auto gap-2 hover:shadow-sm cursor-pointer"
              >
                View more
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-200 group-hover:translate-y-0.5"
                >
                  <path 
                    d="M19 9L12 16L5 9" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ArticleSection; 