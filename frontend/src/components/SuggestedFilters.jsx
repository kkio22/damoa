/**
 * AI 제안 필터 컴포넌트 (todolist 3일차)
 */

import React from 'react';

const SuggestedFilters = ({ suggestedFilters, onApplyFilter }) => {
  if (!suggestedFilters || Object.keys(suggestedFilters).length === 0) {
    return null;
  }

  const { priceRange, locations } = suggestedFilters;

  const handleApplyPriceRange = () => {
    if (priceRange && onApplyFilter) {
      onApplyFilter({
        type: 'priceRange',
        value: priceRange,
      });
    }
  };

  const handleApplyLocation = (location) => {
    if (onApplyFilter) {
      onApplyFilter({
        type: 'location',
        value: location,
      });
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>💡</span>
        <h3 style={styles.title}>AI 추천 필터</h3>
      </div>

      <div style={styles.content}>
        {/* 가격 범위 제안 */}
        {priceRange && (
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>추천 가격대</div>
            <button
              onClick={handleApplyPriceRange}
              style={styles.priceButton}
            >
              <span style={styles.priceText}>
                {priceRange.min.toLocaleString()}원 ~ {priceRange.max.toLocaleString()}원
              </span>
              <span style={styles.applyIcon}>✓ 적용</span>
            </button>
            <div style={styles.hint}>평균 가격 기준 최적 범위</div>
          </div>
        )}

        {/* 지역 제안 */}
        {locations && locations.length > 0 && (
          <div style={styles.filterSection}>
            <div style={styles.filterLabel}>추천 지역</div>
            <div style={styles.locationGrid}>
              {locations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleApplyLocation(location)}
                  style={styles.locationButton}
                >
                  <span>📍 {location}</span>
                  <span style={styles.applyIconSmall}>✓</span>
                </button>
              ))}
            </div>
            <div style={styles.hint}>상품이 가장 많은 지역</div>
          </div>
        )}
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
    border: '2px solid #2563eb',
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
    gap: '20px',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
  },
  priceButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#eff6ff',
    border: '2px solid #2563eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '15px',
    fontWeight: '500',
  },
  priceText: {
    color: '#333',
  },
  applyIcon: {
    color: '#2563eb',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  locationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
  },
  locationButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 15px',
    backgroundColor: '#eff6ff',
    border: '2px solid #2563eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  applyIconSmall: {
    color: '#2563eb',
    fontSize: '12px',
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
  },
};

export default SuggestedFilters;

