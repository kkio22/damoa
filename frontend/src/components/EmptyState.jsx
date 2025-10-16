/**
 * 빈 상태 컴포넌트 (UI/UX 개선 - todolist 4일차)
 * 검색 결과가 없을 때 표시되는 UI
 */

import React from 'react';

const EmptyState = ({ 
  icon = '🔍', 
  title = '검색 결과가 없습니다', 
  message = '다른 검색어로 시도해보세요',
  suggestions = []
}) => {
  return (
    <div style={styles.container} className="empty-fade-in">
      <div style={styles.iconWrapper}>
        <span style={styles.icon}>{icon}</span>
      </div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.message}>{message}</p>
      
      {suggestions.length > 0 && (
        <div style={styles.suggestions}>
          <p style={styles.suggestionsTitle}>💡 검색 팁:</p>
          <ul style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <li key={index} style={styles.suggestionItem}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// 스타일
const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '80px 40px',
    textAlign: 'center',
    margin: '20px 0',
  },
  iconWrapper: {
    marginBottom: '24px',
  },
  icon: {
    fontSize: '80px',
    display: 'inline-block',
    opacity: 0.8,
    animation: 'floatIcon 3s ease-in-out infinite',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  suggestions: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'left',
  },
  suggestionsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  suggestionsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  suggestionItem: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
    paddingLeft: '20px',
    position: 'relative',
    lineHeight: '1.5',
  },
};

// CSS 애니메이션 추가
if (!document.getElementById('empty-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'empty-styles';
  styleSheet.textContent = `
    @keyframes floatIcon {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-15px);
      }
    }

    @keyframes emptyFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .empty-fade-in {
      animation: emptyFadeIn 0.5s ease-out;
    }

    .empty-fade-in ul li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #2563eb;
      font-weight: bold;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default EmptyState;

