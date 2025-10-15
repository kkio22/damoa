/**
 * 관련 키워드 태그 컴포넌트 (todolist 3일차)
 */

import React from 'react';

const RelatedKeywords = ({ keywords, currentQuery, onKeywordClick }) => {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  // 현재 검색어와 다른 키워드만 표시
  const filteredKeywords = keywords.filter(
    (keyword) => keyword.toLowerCase() !== currentQuery.toLowerCase()
  );

  if (filteredKeywords.length === 0) {
    return null;
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>🔍</span>
        <h3 style={styles.title}>연관 검색어</h3>
      </div>

      <div style={styles.content}>
        <div style={styles.keywordGrid}>
          {filteredKeywords.map((keyword, index) => (
            <button
              key={index}
              onClick={() => onKeywordClick && onKeywordClick(keyword)}
              style={styles.keywordTag}
            >
              <span style={styles.keywordText}>{keyword}</span>
              <span style={styles.searchIcon}>→</span>
            </button>
          ))}
        </div>
        <div style={styles.hint}>
          💡 클릭하면 해당 키워드로 다시 검색합니다
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '20px',
    border: '2px solid #9c27b0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee',
  },
  icon: {
    fontSize: '24px',
    marginRight: '10px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  keywordGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  keywordTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f3e5f5',
    border: '2px solid #9c27b0',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  keywordText: {
    color: '#6a1b9a',
  },
  searchIcon: {
    color: '#9c27b0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    marginTop: '5px',
  },
};

export default RelatedKeywords;

