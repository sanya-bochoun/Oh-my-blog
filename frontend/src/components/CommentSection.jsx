import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../hooks/useAuth";
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import AlertDialog from './ui/AlertDialog';
import { toast } from 'sonner';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // ดึงคอมเมนต์ทั้งหมด
  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/comments/post/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // สร้างคอมเมนต์ใหม่
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments`,
        {
          post_id: postId,
          content: newComment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment posted!', {
        description: 'Your comment has been added successfully.',
      });
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // ลบคอมเมนต์
  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // ไลค์/ยกเลิกไลค์คอมเมนต์
  const handleLike = async (commentId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/${commentId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchComments(); // รีเฟรชคอมเมนต์เพื่ออัปเดตสถานะไลค์
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">ความคิดเห็น</h3>
      
      {/* ฟอร์มสร้างคอมเมนต์ */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="เขียนความคิดเห็น..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
          </button>
        </form>
      )}

      {/* แสดงคอมเมนต์ทั้งหมด */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <img
                  src={comment.avatar_url || '/default-avatar.png'}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium">{comment.username}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: th
                    })}
                  </p>
                </div>
              </div>
              {user && user.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                >
                  ลบ
                </button>
              )}
            </div>
            <p className="mt-2">{comment.content}</p>
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center space-x-1 cursor-pointer ${
                  comment.user_liked ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={comment.user_liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0-.714.211-1.412.608-2.006L7.11 2.42A1.994 1.994 0 0110 2h4a2 2 0 012 2v8m-6 0h6"
                  />
                </svg>
                <span>{comment.likes_count || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Dialog */}
      <AlertDialog 
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
      />
    </div>
  );
};

export default CommentSection; 