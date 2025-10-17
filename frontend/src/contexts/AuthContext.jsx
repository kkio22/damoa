/**
 * 인증 Context
 * JWT 토큰 관리 및 사용자 인증 상태 관리
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기화: 쿠키에서 자동으로 인증 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        // HTTP-only 쿠키가 자동으로 전송됨
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true, // 쿠키 전송 허용 (중요!)
        });
        setUser(response.data.user);
      } catch (error) {
        // 쿠키가 없거나 만료됨
        console.log('인증되지 않음');
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
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          email,
          password,
          passwordConfirm,
          name,
          phone,
        },
        {
          withCredentials: true, // 쿠키 전송 허용
        }
      );

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
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true, // 쿠키 전송 허용 (중요!)
        }
      );

      const { user } = response.data;

      // HTTP-only 쿠키로 토큰이 자동 설정됨 (localStorage 불필요!)
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
  const logout = async () => {
    try {
      // 서버에 로그아웃 요청 (쿠키 삭제)
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    }
    
    // 클라이언트 상태 초기화
    setUser(null);
    setError(null);
  };

  /**
   * 사용자 정보 새로고침
   */
  const refreshUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('사용자 정보 갱신 실패:', error);
      logout();
    }
  };

  /**
   * Access Token 갱신 (Refresh Token 사용)
   */
  const refreshAccessToken = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        {
          withCredentials: true, // 쿠키 전송
        }
      );
      return true;
    } catch (error) {
      console.error('Token 갱신 실패:', error);
      return false;
    }
  };

  /**
   * axios 기본 설정 (withCredentials + 자동 토큰 갱신)
   */
  useEffect(() => {
    // 모든 요청에 withCredentials 자동 추가
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        config.withCredentials = true; // 모든 요청에 쿠키 전송
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터: 401 에러 시 자동 토큰 갱신 시도
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 401 에러이고, 아직 재시도하지 않았으며, refresh 엔드포인트가 아닌 경우
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/api/auth/refresh')
        ) {
          originalRequest._retry = true;

          // Refresh Token으로 Access Token 갱신 시도
          const refreshed = await refreshAccessToken();

          if (refreshed) {
            // 갱신 성공 시 원래 요청 재시도
            return axios(originalRequest);
          } else {
            // 갱신 실패 시 로그아웃
            logout();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
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

