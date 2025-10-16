/**
 * 에러 메시지 컴포넌트 (UI/UX 개선 - todolist 4일차)
 * 에러 발생 시 사용자 친화적인 메시지 표시
 */

import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={styles.container} className="error-fade-in">
      <div style={styles.iconWrapper}>
        <span style={styles.icon}>⚠️</span>
      </div>
      <h3 style={styles.title}>문제가 발생했습니다</h3>
      <p style={styles.message}>{message || '알 수 없는 오류가 발생했습니다.'}</p>
      {onRetry && (
        <button 
          style={styles.retryButton} 
          onClick={onRetry}
          className="error-retry-button"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};

// 스타일 - Damoa 파란색 테마
const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '60px 40px',
    textAlign: 'center',
    margin: '20px 0',
    border: '2px solid #2563eb',
  },
  iconWrapper: {
    marginBottom: '20px',
  },
  icon: {
    fontSize: '64px',
    display: 'inline-block',
    animation: 'bounce 2s infinite',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
  },
};

// CSS 애니메이션 추가
if (!document.getElementById('error-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'error-styles';
  styleSheet.textContent = `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes errorFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .error-fade-in {
      animation: errorFadeIn 0.3s ease-out;
    }

    .error-retry-button:hover {
      background-color: #1e40af !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4) !important;
    }

    .error-retry-button:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ErrorMessage;

