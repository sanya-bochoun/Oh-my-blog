import React, { useState, useEffect, useRef } from 'react';
import { BsBell } from 'react-icons/bs';
import { AiOutlineLike, AiOutlineComment } from 'react-icons/ai';
import { FaRegNewspaper } from 'react-icons/fa';
import { FiTrash2, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = API_URL.replace('/api', '');

const NotificationBell = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const activities = response.data.data.activities || [];
      setActivities(activities);
    } catch (error) {
      toast.error('Unable to fetch activities');
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setClearing(true);
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/api/notifications/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setActivities([]);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Unable to clear notifications');
      console.error('Error clearing notifications:', error);
    } finally {
      setClearing(false);
    }
  };

  const deleteNotification = async (notificationId, event) => {
    // ป้องกัน event bubbling เพื่อไม่ให้ navigate ไปยังบทความ
    if (event) {
      event.stopPropagation();
    }
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setActivities(activities.filter(activity => activity.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Unable to delete notification');
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (activity) => {
    // สร้าง link จาก activity.link หรือจาก data.post_id
    let link = activity.link;
    
    // ถ้าไม่มี link ให้สร้างจาก data
    if (!link && activity.data) {
      try {
        const data = typeof activity.data === 'string' ? JSON.parse(activity.data) : activity.data;
        
        if (data.post_id) {
          // ถ้ามี slug ใน data ก็ใช้ slug
          if (data.post_slug) {
            link = `/article/${data.post_slug}`;
          } else {
            // ถ้าไม่มี slug ให้ fetch จาก API
            try {
              const token = localStorage.getItem('accessToken');
              const response = await axios.get(`${API_URL}/api/articles/detail/${data.post_id}`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              if (response.data.data?.slug) {
                link = `/article/${response.data.data.slug}`;
              } else {
                link = `/article/${data.post_id}`;
              }
            } catch {
              link = `/article/${data.post_id}`;
            }
          }
        }
      } catch {
        // Silent error handling
      }
    }
    
    // ถ้ายังไม่มี link และมี post_id ใน data (จาก JOIN ใน query)
    if (!link && activity.data) {
      try {
        const data = typeof activity.data === 'string' ? JSON.parse(activity.data) : activity.data;
        if (data.post_id) {
          link = `/article/${data.post_id}`;
        }
      } catch {
        // Silent error handling
      }
    }
    
    if (link) {
      // ตรวจสอบว่า link ไม่มี leading slash ซ้ำ
      link = link.startsWith('/') ? link : `/${link}`;
      // ถ้ามี /article/article ให้ลบซ้ำ
      link = link.replace(/\/article\/article\//, '/article/');
      
      setShowDropdown(false); // ปิด dropdown
      navigate(link);
    } else {
      toast.error('Article link not found');
    }
  };

  useEffect(() => {
    if (showDropdown) {
      fetchActivities();
    }
  }, [showDropdown]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true
    });
    socket.on('connect', () => {
      // console.log('Socket connected:', socket.id);
    });
    socket.on('notification', (newNotification) => {
      setActivities(prev => [newNotification, ...prev]);
      toast.info('คุณมีแจ้งเตือนใหม่!');
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post':
        return <FaRegNewspaper className="text-blue-500" />;
      case 'like':
      case 'post_like':
        return <AiOutlineLike className="text-red-500" />;
      case 'comment':
        return <AiOutlineComment className="text-green-500" />;
      default:
        return <BsBell className="text-gray-500" />;
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'post':
        return `created a new post: ${activity.content}`;
      case 'comment':
        return `commented: ${activity.content}`;
      case 'post_like':
        return `liked post: ${activity.content}`;
      case 'comment_like':
        return `liked comment: ${activity.content}`;
      default:
        return activity.content;
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer"
      >
        <BsBell className="text-xl" />
        {activities.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {activities.length}
        </span>
        )}
      </button>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto z-50"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-left">Recent Activities</h3>
              {activities.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  disabled={clearing}
                  className="flex items-center text-sm text-red-600 hover:text-red-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {clearing ? (
                    <FiLoader className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <FiTrash2 className="w-4 h-4 mr-1" />
                  )}
                  Clear All
                </button>
              )}
      </div>

            {loading ? (
              <div className="text-center py-4">
                <FiLoader className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No new activities</div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    onClick={() => handleNotificationClick(activity)}
                    className={`flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group ${
                      activity.link ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm text-gray-800 text-left">
                        <span className="font-medium">{activity.user_name || 'User'}</span>
                        {' '}
                        {getActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 text-left">
                        {new Date(activity.created_at).toLocaleString('en-US')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.user_avatar && (
                        <img
                          src={activity.user_avatar}
                          alt={activity.user_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <button
                        onClick={(e) => deleteNotification(activity.id, e)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete notification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
              </div>
            ))}
          </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 