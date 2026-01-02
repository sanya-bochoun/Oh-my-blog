import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // เช็คว่ามี token เก็บอยู่ใน localStorage หรือไม่
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const userDataString = localStorage.getItem('user');

      if (token && userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // ถ้าเป็น 403 หรือ 401 แสดงว่า token ไม่ถูกต้องหรือหมดอายุ
      if (response.status === 403 || response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
    } catch (error) {
      // ไม่ log error ถ้าเป็น 403 เพราะเป็นเรื่องปกติ (token หมดอายุ)
      if (error.message !== 'Failed to fetch user profile' || !error.message.includes('403')) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'การเข้าสู่ระบบล้มเหลว');
      }
      
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      setUser(data.data.user);
      setIsAuthenticated(true);

      // ดึงข้อมูล user ล่าสุดหลังจาก login
      await fetchUserProfile();
      
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'การลงทะเบียนล้มเหลว');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh token');
      }
      
      localStorage.setItem('accessToken', data.data.accessToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  // เพิ่มฟังก์ชัน updateUser สำหรับอัปเดตข้อมูลผู้ใช้
  const updateUser = (updatedUserData) => {
    try {
      // อัปเดต state
      setUser(updatedUserData);
      
      // อัปเดตข้อมูลใน localStorage
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  // เรียกใช้ fetchUserProfile เมื่อ component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 