/**
 * 즐겨찾기 버튼 컴포넌트
 * 별 모양 아이콘 + 즐겨찾기 수 표시
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const FavoriteButton = ({ product, favoriteCount: initialCount = 0, isFavorite: initialFavorite = false, onToggle }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지

    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (isFavorite) {
        // 즐겨찾기 삭제
        await axios.delete(`${API_URL}/api/favorites/${product.id}`, {
          withCredentials: true
        });

        setIsFavorite(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
        
        if (onToggle) {
          onToggle(false);
        }
      } else {
        // 즐겨찾기 추가
        const response = await axios.post(
          `${API_URL}/api/favorites`,
          {
            product_id: product.id,
            product_data: {
              id: product.id,
              title: product.title,
              price: product.price,
              image: product.image,
              url: product.url,
              platform: product.platform,
              location: product.location,
              description: product.description
            }
          },
          {
            withCredentials: true
          }
        );

        setIsFavorite(true);
        setFavoriteCount(response.data.favorite.favorite_count);
        
        if (onToggle) {
          onToggle(true);
        }
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
      
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다');
      } else if (error.response?.status === 409) {
        alert('이미 즐겨찾기한 상품입니다');
      } else {
        alert('즐겨찾기 처리 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="favorite-button"
      title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        border: 'none',
        borderRadius: '20px',
        backgroundColor: isFavorite ? '#FFD700' : '#f5f5f5',
        color: isFavorite ? '#fff' : '#666',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1
      }}
    >
      <span style={{ fontSize: '18px' }}>
        {isFavorite ? '⭐' : '☆'}
      </span>
      <span>{favoriteCount}</span>
    </button>
  );
};

export default FavoriteButton;

