import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FaUser, FaCalendar, FaFolder, FaFacebookF, FaTwitter, FaLinkedinIn, FaComment } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // ดึงคอมเมนต์
  const fetchComments = async (postId) => {
    try {
      setCommentLoading(true);
      const response = await axios.get(`${API_URL}/api/comments/post/${postId}`);
      console.log('API comments:', response.data);
      // รองรับทั้งกรณีที่ data อยู่ใน data.data หรือ data เป็น array เลย
      if (Array.isArray(response.data.data)) {
        setComments(response.data.data);
      } else if (Array.isArray(response.data)) {
        setComments(response.data);
      } else {
        setComments([]);
      }
    } catch {
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/articles/detail/${slug}`);
        if (response.data.status === 'success') {
          console.log('Article Data:', response.data.data);
          setArticle(response.data.data);
          setLikeCount(response.data.data.like_count || 0);
          fetchComments(response.data.data.id);
        } else {
          setError('ไม่สามารถโหลดบทความได้');
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดบทความ');
        setLoading(false);
      }
    };

    const checkLikeStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await axios.get(
          `${API_URL}/api/likes/articles/${article?.id}/check`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setHasLiked(response.data.hasLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    fetchArticle();
    if (article?.id) {
      checkLikeStatus();
    }
  }, [slug, API_URL, article?.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const method = hasLiked ? 'DELETE' : 'POST';
      const response = await axios({
        method,
        url: `${API_URL}/api/likes/articles/${article.id}/like`,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 201 || response.status === 200) {
        setHasLiked(!hasLiked);
        setLikeCount(prevCount => hasLiked ? prevCount - 1 : prevCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('เกิดข้อผิดพลาดในการกดไลค์');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      await axios.post(
        `${API_URL}/api/comments`,
        { post_id: article.id, content: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      fetchComments(article.id);
    } catch {
      alert('เกิดข้อผิดพลาดในการส่งคอมเมนต์');
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('คัดลอกลิงก์เรียบร้อยแล้ว!');
      })
      .catch(() => {
        toast.error('ไม่สามารถคัดลอกลิงก์ได้');
      });
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link to="/" className="text-blue-500 hover:underline flex items-center">
          <IoMdArrowRoundBack className="mr-2" /> Back to Home
        </Link>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="max-w-[1300px] mx-auto">
      {/* Header with Profile */}
      <div className="px-4 sm:px-8 py-4 border-b flex justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl font-bold">hh.</Link>
        <div className="flex items-center gap-2">
          <img
            src={article.Author?.avatar_url && article.Author?.avatar_url.trim() !== '' ? article.Author?.avatar_url : '/src/assets/default-logo.png'}
            alt={article.Author?.username}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
          />
          <span className="font-medium text-xs sm:text-sm">{article.Author?.username}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-4 sm:py-8 text-left">
        {/* Featured Image */}
        {article.thumbnail_url && (
          <div className="mb-4 sm:mb-8">
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-full h-auto sm:h-[587px] object-cover rounded-2xl mx-auto"
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Category and Date */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-block bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-1 rounded-full text-xs font-semibold mr-2">
                {article.category || 'Uncategorized'}
                </span>
                <time className="text-xs sm:text-sm text-gray-500">
                  {format(new Date(article.created_at), 'd MMMM yyyy')}
                </time>
            </div>

            {/* Article Title */}
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-left">
              {article.title}
            </h1>

            {/* Article Content */}
            <div className="prose prose-sm sm:prose-lg max-w-none mb-8 sm:mb-12">
              <div className="text-gray-600 mb-4 sm:mb-8 text-base sm:text-lg leading-relaxed">
                {article.introduction}
              </div>
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 mt-6 sm:mt-8" {...props} />,
                  h2: ({...props}) => <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-5 sm:mt-6" {...props} />,
                  h3: ({...props}) => <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 mt-4 sm:mt-5" {...props} />,
                  p: ({...props}) => <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />,
                  li: ({...props}) => <li className="text-gray-600 text-sm sm:text-base" {...props} />,
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-gray-200 pl-3 sm:pl-4 italic my-3 sm:my-4 text-sm sm:text-base" {...props} />
                  ),
                  code: ({inline, ...props}) => (
                    inline ? 
                    <code className="bg-gray-100 rounded px-1 py-0.5 text-sm sm:text-base" {...props} /> :
                    <code className="block bg-gray-100 rounded p-3 sm:p-4 my-3 sm:my-4 overflow-auto text-sm sm:text-base" {...props} />
                  )
                }}
              >
                {article.content}
              </Markdown>
            </div>

            {/* Like and Share Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#EFEEEB] rounded-[16px] px-4 sm:px-[24px] py-3 sm:py-[16px] mb-6 sm:mb-8">
              <div className="flex gap-2 sm:gap-4 mb-3 sm:mb-0">
                <div className="bg-white px-4 sm:px-[40px] py-2 sm:py-[12px] rounded-[999px] flex items-center gap-2">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 ${hasLiked ? 'text-blue-600' : 'text-gray-600'} hover:text-gray-800 cursor-pointer`}
                  >
                    <InsertEmoticonIcon className={`text-xl sm:text-2xl ${hasLiked ? 'text-blue-600' : ''}`} />
                    <span className="font-medium text-sm sm:text-base">{likeCount}</span>
                  </button>
                </div>
                <div className="bg-white px-4 sm:px-[40px] py-2 sm:py-[12px] rounded-[999px] flex items-center gap-2">
                  <button 
                    onClick={() => document.getElementById('commentSection').scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <FaComment className="text-lg sm:text-xl" />
                    <span className="font-medium text-sm sm:text-base">{article?.comment_count || 0}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button className="bg-white flex items-center gap-2 px-4 sm:px-[40px] py-2 sm:py-[12px] border rounded-[999px] hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                  onClick={handleCopyLink}
                >
                  <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                  Copy link
                </button>
                <div className="flex gap-1 sm:gap-2">
                  <button onClick={() => handleShare('facebook')} className="w-8 h-8 sm:w-[48px] sm:h-[48px] flex items-center justify-center bg-[#1877F2] text-white rounded-full hover:bg-blue-600 cursor-pointer">
                    <FaFacebookF size={14} />
                  </button>
                  <button onClick={() => handleShare('linkedin')} className="w-8 h-8 sm:w-[48px] sm:h-[48px] flex items-center justify-center bg-[#0A66C2] text-white rounded-full hover:bg-blue-700 cursor-pointer">
                    <FaLinkedinIn size={14} />
                  </button>
                  <button onClick={() => handleShare('twitter')} className="w-8 h-8 sm:w-[48px] sm:h-[48px] flex items-center justify-center bg-[#1DA1F2] text-white rounded-full hover:bg-blue-400 cursor-pointer">
                    <FaTwitter size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <div className="mt-8 sm:mt-12" id="commentSection">
              <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#75716B] mb-3 sm:mb-4">Comments</h3>
              <form onSubmit={handleCommentSubmit} className="mb-6 sm:mb-8">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="bg-white text-[14px] sm:text-[16px] w-full p-3 sm:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                />
                <div className='text-right'>
                  <button
                    type="submit"
                    className="mt-2 px-4 sm:px-[40px] py-2 sm:py-[12px] text-right bg-black text-white rounded-full hover:bg-gray-800 text-sm sm:text-base"
                  >
                    Send
                  </button>
                </div>
              </form>
              
              {commentLoading ? (
                <div className="text-center py-3 sm:py-4">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-gray-400 text-sm sm:text-base">No comments yet.</div>
              ) : (
                comments.map((c, idx) => (
                  <div key={c.id || idx} className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                      <img src={c.avatar_url && c.avatar_url.trim() !== '' ? c.avatar_url : '/src/assets/default-logo.png'} alt={c.username} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                      <div>
                        <div className="font-semibold text-black text-sm sm:text-base">{c.username}</div>
                        <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}</div>
                      </div>
                    </div>
                    <div className="ml-8 sm:ml-11 text-gray-700 text-[13px] sm:text-[15px]">{c.content}</div>
                    <hr className="my-4 sm:my-6" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Author Bio - Sticky Sidebar */}
          <div className="w-full lg:w-[320px]">
            <div className="sticky top-20 bg-[#EFEEEB] w-full lg:w-[257px] min-h-[200px] h-fit rounded-lg p-4 sm:p-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <img
                  src={article['Author.avatar_url'] && article['Author.avatar_url'].trim() !== '' ? article['Author.avatar_url'] : '/src/assets/default-logo.png'}
                  alt={article['Author.username']}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                />
                <div>
                  <div className="text-xs text-gray-500">Author</div>
                  <div className="font-medium text-xs sm:text-sm">{article['Author.username']}</div>
                </div>
              </div>
              <div className="w-full h-[1px] bg-[#DAD6D1] my-3 sm:my-4"></div>
              <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                {article['Author.bio'] && article['Author.bio'].trim() !== ''
                  ? article['Author.bio']
                  : "No bio provided. I'm a passionate writer who loves sharing knowledge and stories with the world."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail; 