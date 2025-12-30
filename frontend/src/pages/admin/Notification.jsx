import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLoader, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Notification = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      const response = await api.get('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.data?.activities) {
        setActivities(response.data.data.activities);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setClearing(true);
      const token = localStorage.getItem('accessToken');
      
      await api.put('/api/notifications/read-all', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setActivities([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    } finally {
      setClearing(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await api.delete(`/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setActivities(activities.filter(activity => activity.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center p-8 bg-white rounded-lg text-red-500">
          {error}
        </div>
      </div>
    );
  }

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'post':
        return `created a new post: ${activity.content}`;
      case 'comment':
        return `commented: ${activity.content}`;
      case 'post_like':
        return `liked the post: ${activity.content}`;
      case 'comment_like':
        return `liked a comment: ${activity.content}`;
      default:
        return activity.content;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Notifications</h1>
        {activities.length > 0 && (
          <button
            onClick={clearAllNotifications}
            disabled={clearing}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {clearing ? (
              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FiTrash2 className="w-4 h-4 mr-2" />
            )}
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8 bg-white rounded-lg">
            <FiLoader className="w-6 h-6 text-gray-400 animate-spin mr-2" />
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg text-gray-500">
            No notifications found
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="bg-white rounded-lg p-4 flex items-start gap-4 group hover:bg-gray-50"
            >
              <img
                src={activity.user_avatar || 'https://via.placeholder.com/40'}
                alt={activity.user_name || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user_name || 'User'}</span>
                      {' '}
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.target_id && (
                      <Link
                        to={`/article/${activity.target_id}`}
                        className="text-sm font-medium text-gray-900 hover:underline"
                      >
                        View
                      </Link>
                    )}
                    <button
                      onClick={() => deleteNotification(activity.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete notification"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification; 