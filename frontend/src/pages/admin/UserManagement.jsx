import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiTrash2, FiKey, FiLock, FiUnlock, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// กำหนด axios defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // ดึง token จาก localStorage
    const token = localStorage.getItem('accessToken'); // เปลี่ยนเป็น accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้าเป็น error 401 และยังไม่เคยลอง retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ลองขอ token ใหม่
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // ทำ request เดิมอีกครั้งด้วย token ใหม่
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // ถ้าไม่สามารถขอ token ใหม่ได้ ให้ logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h2 className="text-xl text-red-600">Something went wrong.</h2>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-[400px] shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Delete article</h2>
        <p className="text-gray-600 mb-6">Do you want to delete this article?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const roles = [
    { id: 'user', name: 'User' },
    { id: 'admin', name: 'Admin' },
    { id: 'editor', name: 'Editor' }
  ];

  // Fetch users
  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);

      // ตรวจสอบว่ามี token หรือไม่
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Add 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await api.get('/api/admin/users', {
        params: {
          page,
          search,
        }
      });
      
      if (response.data && typeof response.data === 'object') {
        const { users = [], pagination = {} } = response.data;
        
        if (Array.isArray(users)) {
          setUsers(users);
          setTotalPages(pagination.totalPages || 1);
          setCurrentPage(pagination.currentPage || 1);
        } else {
          throw new Error('Invalid user data format');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      let errorMessage = 'Failed to fetch users. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication token not found';
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
      
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchUsers]);

  useEffect(() => {
    // ดึงข้อมูล current user จาก localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleResetPassword = (userId) => {
    navigate(`/admin/reset-user-password/${userId}`);
  };

  const handleToggleLock = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
      await api.put(`/api/admin/users/${userId}/status`, { status: newStatus });
      
      // Refresh user list
      fetchUsers(currentPage, searchTerm);
      
      toast.success(`User ${newStatus === 'locked' ? 'locked' : 'unlocked'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/api/admin/users/${userToDelete.id}`);
      toast.success('ลบผู้ใช้สำเร็จ');
      fetchUsers(currentPage, searchTerm);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('ไม่สามารถลบผู้ใช้ได้');
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setEditRoleModalOpen(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('กรุณาเลือกบทบาทที่ต้องการ');
      return;
    }

    try {
      await api.put(`/api/admin/users/${selectedUser.id}/role`, {
        role: selectedRole
      });

      // อัพเดทข้อมูลผู้ใช้ในตาราง
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: selectedRole }
          : user
      ));

      toast.success('อัพเดทบทบาทผู้ใช้สำเร็จ');
      setEditRoleModalOpen(false);
      setSelectedUser(null);
      setSelectedRole('');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถอัพเดทบทบาทผู้ใช้ได้');
    }
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600">{error}</div>
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => fetchUsers(currentPage, searchTerm)}
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">User management</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-400"
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow text-left">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <FiLoader className="w-6 h-6 text-gray-400 animate-spin mr-2" />
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {currentUser?.role === 'admin' ? (
                      <button
                        onClick={() => handleEditRole(user)}
                        className="text-sm text-gray-900 hover:text-blue-600"
                      >
                        {user.role || 'user'}
                        <span className="ml-1 text-xs text-blue-600">(Edit)</span>
                      </button>
                    ) : (
                      <span className="text-sm text-gray-900">
                        {user.role || 'user'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.last_login).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      {/* ถ้าเป็น editor จะไม่สามารถจัดการกับ admin ได้ */}
                      {!(currentUser?.role === 'editor' && user.role === 'admin') && (
                        <>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Reset Password"
                          >
                            <FiKey className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleLock(user.id, user.status)}
                            className="text-gray-500 hover:text-gray-700"
                            title={user.status === 'locked' ? 'Unlock Account' : 'Lock Account'}
                          >
                            {user.status === 'locked' ? (
                              <FiUnlock className="w-4 h-4" />
                            ) : (
                              <FiLock className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-gray-500 hover:text-red-600"
                            title="Delete User"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchUsers(page, searchTerm)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Edit Role Modal */}
      {editRoleModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-[400px] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Edit User Role</h2>
              <button
                onClick={() => {
                  setEditRoleModalOpen(false);
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setEditRoleModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[999px] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-[999px] hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap the component with ErrorBoundary
export default function UserManagementWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <UserManagement />
    </ErrorBoundary>
  );
} 