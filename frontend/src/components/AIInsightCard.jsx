/**
 * AI 분석 결과 표시 컴포넌트 (todolist 3일차)
 */

import React from 'react';

const AIInsightCard = ({ insights }) => {
  if (!insights) return null;

  const { averagePrice, priceRange, mostCommonLocations, trendingItems, summary } = insights;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>🤖</span>
        <h3 style={styles.title}>AI 시장 분석</h3>
      </div>

      <div style={styles.content}>
        {/* AI 요약 */}
        {summary && (
          <div style={styles.section}>
            <p style={styles.summary}>{summary}</p>
          </div>
        )}

        {/* 가격 정보 */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>평균 가격</div>
            <div style={styles.statValue}>
              {averagePrice > 0 ? `${averagePrice.toLocaleString()}원` : '-'}
            </div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statLabel}>가격 범위</div>
            <div style={styles.statValue}>
              {priceRange.min > 0 
                ? `${priceRange.min.toLocaleString()} ~ ${priceRange.max.toLocaleString()}원`
                : '-'
              }
            </div>
          </div>
        </div>

        {/* 인기 지역 */}
        {mostCommonLocations && mostCommonLocations.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>📍 인기 지역</div>
            <div style={styles.tags}>
              {mostCommonLocations.slice(0, 5).map((location, index) => (
                <span key={index} style={styles.tag}>
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 트렌딩 키워드 */}
        {trendingItems && trendingItems.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🔥 트렌딩 키워드</div>
            <div style={styles.tags}>
              {trendingItems.slice(0, 5).map((item, index) => (
                <span key={index} style={styles.trendingTag}>
                  {item}
                </span>
              ))}
            </div>
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
    border: '2px solid #ff6b35',
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
  summary: {
    fontSize: '15px',
    color: '#555',
    lineHeight: '1.6',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    borderLeft: '4px solid #ff6b35',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  statBox: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '13px',
    color: '#777',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: '5px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '10px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    padding: '6px 12px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500',
  },
  trendingTag: {
    padding: '6px 12px',
    backgroundColor: '#fff3e0',
    color: '#e65100',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500',
  },
};

export default AIInsightCard;

