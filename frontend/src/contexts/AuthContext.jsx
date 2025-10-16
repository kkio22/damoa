/**
 * 인증 Context
 * JWT 토큰 관리 및 사용자 인증 상태 관리
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기화: localStorage에서 토큰 확인
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // 토큰으로 사용자 정보 가져오기
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('토큰 검증 실패:', error);
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * 회원가입
   */
  const register = async (email, password, passwordConfirm, name, phone) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        passwordConfirm,
        name,
        phone,
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || '회원가입 중 오류가 발생했습니다';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * 로그인
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { user, tokens } = response.data;

      // 토큰 저장
      localStorage.setItem('accessToken', tokens.accessToken);

      // 사용자 정보 저장
      setUser(user);

      return { success: true, message: '로그인 성공' };
    } catch (error) {
      const message = error.response?.data?.message || '로그인 중 오류가 발생했습니다';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * 로그아웃
   */
  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setError(null);
  };

  /**
   * 사용자 정보 새로고침
   */
  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('사용자 정보 갱신 실패:', error);
      logout();
    }
  };

  /**
   * 인증된 API 요청을 위한 axios 인터셉터 설정
   */
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터: 401 에러 시 자동 로그아웃
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

