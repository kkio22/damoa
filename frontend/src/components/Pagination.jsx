/**
 * 페이지네이션 컴포넌트 (todolist 2일차)
 */

import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div style={styles.container}>
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...styles.button,
          ...(currentPage === 1 ? styles.buttonDisabled : {}),
        }}
      >
        ‹ 이전
      </button>

      {/* 첫 페이지 */}
      {getPageNumbers()[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            style={styles.button}
          >
            1
          </button>
          {getPageNumbers()[0] > 2 && <span style={styles.ellipsis}>...</span>}
        </>
      )}

      {/* 페이지 번호들 */}
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            ...styles.button,
            ...(page === currentPage ? styles.buttonActive : {}),
          }}
        >
          {page}
        </button>
      ))}

      {/* 마지막 페이지 */}
      {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
        <>
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
            <span style={styles.ellipsis}>...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            style={styles.button}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...styles.button,
          ...(currentPage === totalPages ? styles.buttonDisabled : {}),
        }}
      >
        다음 ›
      </button>

      {/* 페이지 정보 */}
      <span style={styles.info}>
        {currentPage} / {totalPages} 페이지
      </span>
    </div>
  );
};

// 스타일
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '40px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    color: '#333',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    minWidth: '40px',
  },
  buttonActive: {
    backgroundColor: '#2563eb',
    color: '#fff',
    borderColor: '#2563eb',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#ccc',
    cursor: 'not-allowed',
    borderColor: '#e0e0e0',
  },
  ellipsis: {
    padding: '0 8px',
    color: '#999',
    fontSize: '14px',
  },
  info: {
    marginLeft: '15px',
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
};

export default Pagination;

