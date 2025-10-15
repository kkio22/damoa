/**
 * 시스템 상태 모니터링 컴포넌트 (todolist 3일차)
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const SystemMonitor = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  /**
   * 시스템 상태 조회
   */
  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/system/status`);
      setStatus(response.data);
      console.log('✅ 시스템 상태 조회 성공:', response.data);

    } catch (err) {
      const errorMessage = err.response?.data?.message || '시스템 상태 조회 실패';
      setError(errorMessage);
      console.error('❌ 시스템 상태 조회 실패:', err);

    } finally {
      setLoading(false);
    }
  };

  /**
   * 컴포넌트 마운트 시 조회
   */
  useEffect(() => {
    fetchSystemStatus();
  }, []);

  /**
   * 자동 새로고침 (30초마다)
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, [autoRefresh]);

  /**
   * 업타임 포맷
   */
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}일 ${hours}시간`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${minutes}분`;
    }
  };

  /**
   * 상태 뱃지 색상
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'success':
      case 'completed':
        return '#4caf50';
      case 'unhealthy':
      case 'disconnected':
      case 'failed':
        return '#f44336';
      default:
        return '#ff9800';
    }
  };

  if (loading && !status) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <p>📊 시스템 상태를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <p>❌ {error}</p>
          <button onClick={fetchSystemStatus} style={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const { services, crawling, statistics, uptime, timestamp } = status;

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📈 시스템 모니터</h1>
          <p style={styles.subtitle}>
            마지막 업데이트: {new Date(timestamp).toLocaleString('ko-KR')}
          </p>
        </div>
        <div style={styles.headerButtons}>
          <button
            onClick={fetchSystemStatus}
            disabled={loading}
            style={styles.refreshButton}
          >
            {loading ? '🔄 로딩 중...' : '🔄 새로고침'}
          </button>
          <label style={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span style={{ marginLeft: '5px' }}>자동 새로고침 (30초)</span>
          </label>
        </div>
      </div>

      {/* 서버 정보 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🖥️ 서버 정보</h2>
        <div style={styles.grid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>업타임</div>
            <div style={styles.statValue}>{formatUptime(uptime)}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>버전</div>
            <div style={styles.statValue}>{services.backend.version}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>상태</div>
            <div
              style={{
                ...styles.statusBadge,
                backgroundColor: getStatusColor(services.backend.status),
              }}
            >
              {services.backend.status}
            </div>
          </div>
        </div>
      </div>

      {/* 서비스 상태 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔌 서비스 상태</h2>
        <div style={styles.serviceGrid}>
          {/* PostgreSQL */}
          <div style={styles.serviceCard}>
            <div style={styles.serviceIcon}>🗄️</div>
            <div style={styles.serviceInfo}>
              <div style={styles.serviceName}>PostgreSQL</div>
              <div
                style={{
                  ...styles.serviceStatus,
                  color: getStatusColor(services.database.status),
                }}
              >
                {services.database.status === 'connected' ? '✅ 연결됨' : '❌ 연결 끊김'}
              </div>
            </div>
          </div>

          {/* Redis */}
          <div style={styles.serviceCard}>
            <div style={styles.serviceIcon}>⚡</div>
            <div style={styles.serviceInfo}>
              <div style={styles.serviceName}>Redis</div>
              <div
                style={{
                  ...styles.serviceStatus,
                  color: getStatusColor(services.cache.status),
                }}
              >
                {services.cache.status === 'connected' ? '✅ 연결됨' : '❌ 연결 끊김'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 크롤링 상태 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🕷️ 크롤링 상태</h2>
        
        {/* 스케줄러 정보 */}
        <div style={styles.crawlingBox}>
          <div style={styles.crawlingItem}>
            <span style={styles.crawlingLabel}>스케줄러:</span>
            <span
              style={{
                ...styles.crawlingValue,
                color: crawling.scheduler.enabled ? '#4caf50' : '#999',
              }}
            >
              {crawling.scheduler.enabled ? '✅ 활성화' : '⏸️ 비활성화'}
            </span>
          </div>
          {crawling.scheduler.nextRun && (
            <div style={styles.crawlingItem}>
              <span style={styles.crawlingLabel}>다음 실행:</span>
              <span style={styles.crawlingValue}>{crawling.scheduler.nextRun}</span>
            </div>
          )}
        </div>

        {/* 마지막 크롤링 */}
        {crawling.lastCrawl && (
          <div style={styles.lastCrawlBox}>
            <div style={styles.lastCrawlTitle}>마지막 크롤링</div>
            <div style={styles.crawlingGrid}>
              <div style={styles.crawlingStat}>
                <div style={styles.crawlingStatLabel}>시간</div>
                <div style={styles.crawlingStatValue}>
                  {new Date(crawling.lastCrawl.timestamp).toLocaleString('ko-KR')}
                </div>
              </div>
              <div style={styles.crawlingStat}>
                <div style={styles.crawlingStatLabel}>상품 수</div>
                <div style={styles.crawlingStatValue}>
                  {crawling.lastCrawl.totalProducts}개
                </div>
              </div>
              <div style={styles.crawlingStat}>
                <div style={styles.crawlingStatLabel}>소요 시간</div>
                <div style={styles.crawlingStatValue}>
                  {crawling.lastCrawl.duration}초
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 최근 크롤링 로그 */}
        {crawling.recentLogs && crawling.recentLogs.length > 0 && (
          <div style={styles.logsBox}>
            <div style={styles.logsTitle}>최근 크롤링 로그</div>
            <div style={styles.logsList}>
              {crawling.recentLogs.map((log) => (
                <div key={log.id} style={styles.logItem}>
                  <span
                    style={{
                      ...styles.logStatus,
                      backgroundColor: getStatusColor(log.status),
                    }}
                  >
                    {log.status}
                  </span>
                  <span style={styles.logInfo}>
                    {new Date(log.started_at).toLocaleString('ko-KR')} | {log.total_products}개 | {log.duration}초
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 통계 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📊 시스템 통계</h2>
        
        {/* Redis 통계 */}
        <div style={styles.statsSection}>
          <h3 style={styles.statsSubtitle}>⚡ Redis (캐시)</h3>
          <div style={styles.grid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>저장된 지역</div>
              <div style={styles.statValue}>{statistics.redis.totalLocations}개</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>총 상품</div>
              <div style={styles.statValue}>{statistics.redis.totalProducts}개</div>
            </div>
          </div>
        </div>

        {/* Database 통계 */}
        <div style={styles.statsSection}>
          <h3 style={styles.statsSubtitle}>🗄️ PostgreSQL (데이터베이스)</h3>
          <div style={styles.grid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>등록된 지역</div>
              <div style={styles.statValue}>{statistics.database.totalAreas}개</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>검색 로그</div>
              <div style={styles.statValue}>{statistics.database.totalSearchLogs}개</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>크롤링 로그</div>
              <div style={styles.statValue}>{statistics.database.totalCrawlingLogs}개</div>
            </div>
          </div>
        </div>

        {/* 검색 통계 */}
        {statistics.search.popularKeywords.length > 0 && (
          <div style={styles.statsSection}>
            <h3 style={styles.statsSubtitle}>🔍 인기 검색어</h3>
            <div style={styles.keywordsList}>
              {statistics.search.popularKeywords.map((item, index) => (
                <div key={index} style={styles.keywordItem}>
                  <span style={styles.keywordRank}>#{index + 1}</span>
                  <span style={styles.keywordQuery}>{item.query}</span>
                  <span style={styles.keywordCount}>{item.count}회</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 스타일
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  headerButtons: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  refreshButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2196f3',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  autoRefreshLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
  },
  section: {
    marginBottom: '30px',
    padding: '25px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  statCard: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#777',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '16px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  serviceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
  },
  serviceIcon: {
    fontSize: '32px',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  serviceStatus: {
    fontSize: '14px',
    fontWeight: '500',
  },
  crawlingBox: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    marginBottom: '15px',
  },
  crawlingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e0e0e0',
  },
  crawlingLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  crawlingValue: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  lastCrawlBox: {
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '10px',
    marginBottom: '15px',
  },
  lastCrawlTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '10px',
  },
  crawlingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
  },
  crawlingStat: {
    textAlign: 'center',
  },
  crawlingStatLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  crawlingStatValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  logsBox: {
    padding: '15px',
    backgroundColor: '#fff3e0',
    borderRadius: '10px',
  },
  logsTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: '10px',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  logItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '6px',
  },
  logStatus: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  logInfo: {
    fontSize: '13px',
    color: '#666',
  },
  statsSection: {
    marginBottom: '20px',
  },
  statsSubtitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '15px',
  },
  keywordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  keywordItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  keywordRank: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b35',
    color: '#fff',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  keywordQuery: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '500',
    color: '#333',
  },
  keywordCount: {
    fontSize: '13px',
    color: '#999',
  },
  loadingBox: {
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  errorBox: {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '12px',
    color: '#c00',
  },
  retryButton: {
    marginTop: '15px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#f44336',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default SystemMonitor;

