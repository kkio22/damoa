/**
 * 상세 시장 인사이트 컴포넌트 (todolist 3일차)
 */

import React from 'react';

const MarketInsights = ({ insights, totalProducts }) => {
  if (!insights) return null;

  const { averagePrice, priceRange, mostCommonLocations, trendingItems } = insights;

  // 가격 분포 계산 (간단한 버전)
  const getPriceDistribution = () => {
    if (!priceRange || priceRange.min === 0) return null;
    
    const range = priceRange.max - priceRange.min;
    const avgPosition = ((averagePrice - priceRange.min) / range) * 100;
    
    return avgPosition;
  };

  const priceDistribution = getPriceDistribution();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>📊</span>
        <h3 style={styles.title}>시장 인사이트</h3>
      </div>

      <div style={styles.grid}>
        {/* 총 상품 수 */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>📦</div>
          <div style={styles.cardLabel}>총 상품 수</div>
          <div style={styles.cardValue}>{totalProducts || 0}개</div>
        </div>

        {/* 평균 가격 */}
        <div style={styles.card}>
          <div style={styles.cardIcon}>💰</div>
          <div style={styles.cardLabel}>평균 가격</div>
          <div style={styles.cardValue}>
            {averagePrice > 0 ? `${averagePrice.toLocaleString()}원` : '-'}
          </div>
        </div>

        {/* 최저가 */}
        {priceRange && priceRange.min > 0 && (
          <div style={styles.card}>
            <div style={styles.cardIcon}>⬇️</div>
            <div style={styles.cardLabel}>최저가</div>
            <div style={styles.cardValue}>{priceRange.min.toLocaleString()}원</div>
          </div>
        )}

        {/* 최고가 */}
        {priceRange && priceRange.max > 0 && (
          <div style={styles.card}>
            <div style={styles.cardIcon}>⬆️</div>
            <div style={styles.cardLabel}>최고가</div>
            <div style={styles.cardValue}>{priceRange.max.toLocaleString()}원</div>
          </div>
        )}
      </div>

      {/* 가격 분포 */}
      {priceDistribution !== null && (
        <div style={styles.priceDistributionSection}>
          <div style={styles.sectionTitle}>💹 가격 분포</div>
          <div style={styles.priceBar}>
            <div style={styles.priceBarFill}></div>
            <div 
              style={{
                ...styles.priceAvgMarker,
                left: `${priceDistribution}%`,
              }}
            >
              <div style={styles.priceAvgLabel}>평균</div>
            </div>
          </div>
          <div style={styles.priceBarLabels}>
            <span>최저 {priceRange.min.toLocaleString()}원</span>
            <span>최고 {priceRange.max.toLocaleString()}원</span>
          </div>
        </div>
      )}

      {/* 인기 지역 */}
      {mostCommonLocations && mostCommonLocations.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>📍 인기 거래 지역 TOP 5</div>
          <div style={styles.locationList}>
            {mostCommonLocations.slice(0, 5).map((location, index) => (
              <div key={index} style={styles.locationItem}>
                <span style={styles.rank}>{index + 1}</span>
                <span style={styles.locationName}>{location}</span>
                <span style={styles.badge}>인기</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 트렌딩 키워드 */}
      {trendingItems && trendingItems.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🔥 인기 검색 키워드</div>
          <div style={styles.trendingGrid}>
            {trendingItems.slice(0, 10).map((item, index) => (
              <div key={index} style={styles.trendingItem}>
                <span style={styles.trendingRank}>#{index + 1}</span>
                <span style={styles.trendingText}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '25px',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #eee',
  },
  icon: {
    fontSize: '28px',
    marginRight: '12px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  card: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid #e0e0e0',
  },
  cardIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  cardLabel: {
    fontSize: '13px',
    color: '#777',
    marginBottom: '8px',
  },
  cardValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  priceDistributionSection: {
    marginBottom: '25px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
  },
  priceBar: {
    position: 'relative',
    height: '40px',
    backgroundColor: '#e0e0e0',
    borderRadius: '20px',
    marginTop: '15px',
    marginBottom: '10px',
    overflow: 'visible',
  },
  priceBarFill: {
    height: '100%',
    background: 'linear-gradient(to right, #4caf50, #ff9800, #f44336)',
    borderRadius: '20px',
  },
  priceAvgMarker: {
    position: 'absolute',
    top: '-35px',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  priceAvgLabel: {
    padding: '4px 8px',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
  },
  priceBarLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#666',
    marginTop: '10px',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '15px',
  },
  locationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  locationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  rank: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '50%',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  locationName: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
  },
  badge: {
    padding: '4px 10px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  trendingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
  },
  trendingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    backgroundColor: '#fff3e0',
    borderRadius: '8px',
    border: '1px solid #ffe0b2',
  },
  trendingRank: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#e65100',
  },
  trendingText: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
};

export default MarketInsights;

