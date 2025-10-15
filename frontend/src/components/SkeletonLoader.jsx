/**
 * 스켈레톤 로더 컴포넌트 (UI/UX 개선 - todolist 4일차)
 * 상품 카드 로딩 시 표시되는 스켈레톤 UI
 */

import React from 'react';

const SkeletonLoader = ({ count = 6 }) => {
  return (
    <div style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={styles.card} className="skeleton-card">
          <div style={styles.imagePlaceholder} className="skeleton-shimmer"></div>
          <div style={styles.content}>
            <div style={styles.titlePlaceholder} className="skeleton-shimmer"></div>
            <div style={styles.pricePlaceholder} className="skeleton-shimmer"></div>
            <div style={styles.locationPlaceholder} className="skeleton-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 스타일
const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    padding: '20px 0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    animation: 'fadeIn 0.3s ease-in',
  },
  imagePlaceholder: {
    width: '100%',
    height: '200px',
    backgroundColor: '#e0e0e0',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    padding: '15px',
  },
  titlePlaceholder: {
    height: '20px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    marginBottom: '10px',
    width: '80%',
  },
  pricePlaceholder: {
    height: '24px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    marginBottom: '10px',
    width: '40%',
  },
  locationPlaceholder: {
    height: '16px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    width: '30%',
  },
};

// CSS 애니메이션 추가
if (!document.getElementById('skeleton-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'skeleton-styles';
  styleSheet.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        #e0e0e0 0%,
        #f0f0f0 20%,
        #e0e0e0 40%,
        #e0e0e0 100%
      );
      background-size: 1000px 100%;
      animation: shimmer 2s infinite linear;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .skeleton-card {
      animation: fadeIn 0.3s ease-in;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default SkeletonLoader;

