/**
 * 마이페이지 컴포넌트
 * 즐겨찾기 목록 표시
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const MyPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, page]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/favorites`, {
        params: { page, limit },
        withCredentials: true
      });

      setFavorites(response.data.favorites);
      setTotal(response.data.total);
    } catch (err) {
      console.error('즐겨찾기 목록 조회 실패:', err);
      setError('즐겨찾기 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteRemoved = (favoriteId) => {
    setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    setTotal(prev => prev - 1);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#d32f2f' }}>{error}</p>
        <button onClick={fetchFavorites} style={{ marginTop: '20px' }}>
          다시 시도
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            마이페이지
          </h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>
            {user?.name}님 환영합니다
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            홈으로
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#f44336',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 즐겨찾기 통계 */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 8px', color: '#666', fontSize: '14px' }}>
            즐겨찾기
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
            {total}개
          </p>
        </div>
      </div>

      {/* 즐겨찾기 목록 */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          즐겨찾기 목록
        </h2>

        {favorites.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '18px', color: '#666' }}>
              즐겨찾기한 상품이 없습니다
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#2196F3',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              상품 검색하러 가기
            </button>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    transition: 'box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(favorite.product_data.url, '_blank')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* 상품 이미지 */}
                  {favorite.product_data.image && (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#f5f5f5',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={favorite.product_data.image}
                        alt={favorite.product_data.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}

                  {/* 상품 정보 */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      margin: '0 0 8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {favorite.product_data.title}
                    </h3>

                    <p style={{
                      margin: '0 0 8px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#d32f2f'
                    }}>
                      {favorite.product_data.price}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#666',
                        backgroundColor: '#f5f5f5',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {favorite.product_data.platform}
                      </span>

                      <div onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton
                          product={favorite.product_data}
                          favoriteCount={favorite.favorite_count}
                          isFavorite={true}
                          onToggle={(isFav) => {
                            if (!isFav) {
                              handleFavoriteRemoved(favorite.id);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '40px'
              }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1
                  }}
                >
                  이전
                </button>

                <span style={{ padding: '0 16px' }}>
                  {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.5 : 1
                  }}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPage;

