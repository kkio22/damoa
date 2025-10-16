/**
 * 상품 검색 컴포넌트 (고객용)
 * Redis에 저장된 상품을 검색하고 표시합니다 (todolist 2일차)
 */

import React, { useState } from 'react';
import axios from 'axios';
import Pagination from './Pagination';
import AIInsightCard from './AIInsightCard'; // todolist 3일차
import SuggestedFilters from './SuggestedFilters'; // todolist 3일차
import RelatedKeywords from './RelatedKeywords'; // todolist 3일차
import MarketInsights from './MarketInsights'; // todolist 3일차
import SkeletonLoader from './SkeletonLoader'; // todolist 4일차 - UI/UX 개선
import ErrorMessage from './ErrorMessage'; // todolist 4일차 - UI/UX 개선
import EmptyState from './EmptyState'; // todolist 4일차 - UI/UX 개선

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false); // 검색 실행 여부 추적
  
  // 페이지네이션 상태 (todolist 2일차)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 페이지당 12개 상품

  // AI 분석 상태 (todolist 3일차)
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  /**
   * 상품 검색 (POST /api/search - todolist 2일차)
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('검색어를 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setProducts([]);
    setHasSearched(true); // 검색 실행됨

    try {
      // 백엔드 API 형식에 맞춰 요청 구성 (전국 단위 검색)
      const requestBody = {
        query: searchQuery,
        filters: {},
      };

      // 가격 필터
      if (priceRange.min || priceRange.max) {
        requestBody.filters.priceRange = {};
        if (priceRange.min) {
          requestBody.filters.priceRange.min = parseInt(priceRange.min);
        }
        if (priceRange.max) {
          requestBody.filters.priceRange.max = parseInt(priceRange.max);
        }
      }

      // 상품 상태 필터 (available만)
      requestBody.filters.status = 'available';

      console.log('🔍 검색 요청:', requestBody);

      // POST 요청으로 변경
      const response = await axios.post(`${API_URL}/api/search`, requestBody);

      setProducts(response.data.products || []);
      setTotalCount(response.data.totalCount || 0);
      setCurrentPage(1); // 새 검색 시 첫 페이지로
      console.log('✅ 상품 검색 성공:', response.data);
      console.log(`⏱️  검색 소요 시간: ${response.data.searchTime}초`);

    } catch (err) {
      const errorMessage = err.response?.data?.message || '상품 검색에 실패했습니다';
      setError(errorMessage);
      console.error('❌ 상품 검색 실패:', err);

    } finally {
      setLoading(false);
    }
  };

  /**
   * AI 분석 실행 (todolist 3일차) - 전국 단위 검색
   */
  const handleAIAnalysis = async () => {
    if (products.length === 0) {
      setError('먼저 검색을 실행해주세요');
      return;
    }

    setAiLoading(true);
    setError(null);

    try {
      const requestBody = {
        query: searchQuery,
        maxResults: 10,
      };

      console.log('🤖 AI 분석 요청:', requestBody);

      const response = await axios.post(`${API_URL}/api/ai/analyze`, requestBody);

      setAiAnalysis(response.data);
      setShowAiAnalysis(true);
      console.log('✅ AI 분석 성공:', response.data);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'AI 분석에 실패했습니다';
      setError(errorMessage);
      console.error('❌ AI 분석 실패:', err);

    } finally {
      setAiLoading(false);
    }
  };

  /**
   * AI 제안 필터 적용 (todolist 3일차) - 가격 필터만
   */
  const handleApplyAIFilter = (filter) => {
    if (filter.type === 'priceRange') {
      setPriceRange({
        min: filter.value.min.toString(),
        max: filter.value.max.toString(),
      });
      
      // 필터 적용 후 자동으로 재검색
      setTimeout(() => {
        document.querySelector('button[type="submit"]')?.click();
      }, 100);
    }
  };

  /**
   * 관련 키워드 클릭 (todolist 3일차)
   */
  const handleKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    setShowAiAnalysis(false);
    setAiAnalysis(null);
    
    // 키워드로 자동 검색
    setTimeout(() => {
      document.querySelector('button[type="submit"]')?.click();
    }, 100);
  };

  /**
   * 가격 포맷팅
   */
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  /**
   * 시간 포맷팅
   */
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  /**
   * 페이지네이션 (todolist 2일차)
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 변경 시 맨 위로
  };

  return (
    <div style={styles.container}>
      {/* 검색 폼 */}
      <div style={styles.searchSection}>
        <h2 style={styles.title}>🔍 중고 상품 검색</h2>
        
        <form onSubmit={handleSearch} style={styles.searchForm}>
          {/* 검색어 입력 */}
          <div style={styles.searchInputGroup}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="찾으시는 상품을 입력하세요 (예: 아이폰, 노트북, 자전거)"
              style={styles.searchInput}
            />
            <button type="submit" disabled={loading} style={styles.searchButton}>
              {loading ? '검색 중...' : '검색'}
            </button>
            {/* AI 추천 버튼 (todolist 3일차) */}
            <button
              type="button"
              onClick={handleAIAnalysis}
              disabled={aiLoading || products.length === 0}
              style={products.length > 0 ? styles.aiButton : styles.aiButtonDisabled}
            >
              {aiLoading ? '🤖 분석 중...' : '🤖 AI 추천 받기'}
            </button>
          </div>

          {/* 필터 - 전국 단위 검색 */}
          <div style={styles.filterGroup}>
            {/* 가격 범위 */}
            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>최저가</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                placeholder="0"
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>최고가</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                placeholder="1000000"
                style={styles.filterInput}
              />
            </div>
          </div>
        </form>
      </div>

      {/* 에러 표시 (UI/UX 개선 - todolist 4일차) */}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            setError(null);
            if (searchQuery.trim()) {
              handleSearch({ preventDefault: () => {} });
            }
          }} 
        />
      )}

      {/* 로딩 스피너 & 스켈레톤 UI (UI/UX 개선 - todolist 4일차) */}
      {loading && <SkeletonLoader count={12} />}
      {aiLoading && (
        <div style={styles.aiLoadingBox}>
          <p>🤖 AI가 상품을 분석하고 있습니다...</p>
        </div>
      )}

      {/* AI 분석 결과 (todolist 3일차) */}
      {showAiAnalysis && aiAnalysis && (
        <div style={styles.aiResultSection}>
          <div style={styles.aiHeader}>
            <h2 style={styles.aiTitle}>🤖 AI 분석 결과</h2>
            <button
              onClick={() => setShowAiAnalysis(false)}
              style={styles.closeButton}
            >
              ✕ 닫기
            </button>
          </div>

          {/* AI 인사이트 카드 */}
          <AIInsightCard insights={aiAnalysis.insights} />

          {/* 추천 필터 */}
          <SuggestedFilters
            suggestedFilters={aiAnalysis.suggestedFilters}
            onApplyFilter={handleApplyAIFilter}
          />

          {/* 관련 키워드 */}
          <RelatedKeywords
            keywords={aiAnalysis.relatedKeywords}
            currentQuery={searchQuery}
            onKeywordClick={handleKeywordClick}
          />

          {/* 상세 시장 인사이트 */}
          <MarketInsights
            insights={aiAnalysis.insights}
            totalProducts={aiAnalysis.totalProducts}
          />

          {/* AI 추천 상품 */}
          {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
            <div style={styles.aiRecommendations}>
              <h3 style={styles.recommendationTitle}>
                ⭐ AI 추천 상품 TOP {aiAnalysis.recommendations.length}
              </h3>
              <div style={styles.productsGrid}>
                {aiAnalysis.recommendations.map((rec) => (
                  <a
                    key={rec.product.id}
                    href={rec.product.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.productCard}
                  >
                    {/* AI 점수 배지 */}
                    <div style={styles.aiScoreBadge}>
                      🤖 {rec.score}점
                    </div>

                    <div style={styles.productTitle}>{rec.product.title}</div>
                    <div style={styles.productPrice}>{formatPrice(rec.product.price)}</div>
                    <div style={styles.productLocation}>📍 {rec.product.location}</div>
                    <div style={styles.productTime}>⏰ {formatTime(rec.product.createdAt)}</div>
                    
                    {/* AI 추천 이유 */}
                    <div style={styles.aiReasons}>
                      {rec.reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} style={styles.aiReason}>
                          ✓ {reason}
                        </div>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 검색 결과 */}
      {!loading && products.length > 0 && !showAiAnalysis && (
        <>
          <div style={styles.resultHeader}>
            <h3 style={styles.resultTitle}>
              검색 결과 <span style={styles.resultCount}>{totalCount}개</span>
            </h3>
            {totalPages > 1 && (
              <p style={styles.pageInfo}>
                {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, products.length)} 표시 중
              </p>
            )}
          </div>

          <div style={styles.productsGrid}>
            {currentProducts.map((product) => (
              <a
                key={product.id}
                href={product.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.productCard}
              >
                {/* 상품 이미지 */}
                <div style={styles.productImageWrapper}>
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  ) : (
                    <div style={styles.noImage}>이미지 없음</div>
                  )}
                  {product.status === 'sold' && (
                    <div style={styles.soldBadge}>거래완료</div>
                  )}
                  {product.status === 'reserved' && (
                    <div style={styles.reservedBadge}>예약중</div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div style={styles.productInfo}>
                  <h4 style={styles.productTitle}>{product.title}</h4>
                  <p style={styles.productPrice}>{formatPrice(product.price)}</p>
                  <p style={styles.productLocation}>{product.location}</p>
                  <p style={styles.productTime}>{formatTime(product.createdAt)}</p>
                </div>
              </a>
            ))}
          </div>

          {/* 페이지네이션 (todolist 2일차) */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* 검색 결과 없음 (검색 버튼 클릭 후에만 표시) */}
      {!loading && products.length === 0 && hasSearched && (
        <EmptyState
          icon="🔍"
          title="검색 결과가 없습니다"
          message={`"${searchQuery}"에 대한 상품을 찾을 수 없습니다`}
          suggestions={[
            '검색어의 철자를 확인해보세요',
            '더 일반적인 검색어로 시도해보세요',
            '가격 범위를 넓혀보세요',
            '다른 키워드로 검색해보세요'
          ]}
        />
      )}

      {/* 안내 메시지 */}
      {!searchQuery && (
        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>💡 검색 팁</h3>
          <ul style={styles.infoList}>
            <li>상품명을 간단하게 입력해보세요 (예: 아이폰, 갤럭시, 에어팟)</li>
            <li>🌏 전국 단위 검색으로 더 많은 상품을 찾을 수 있어요</li>
            <li>가격 범위를 설정하면 더 정확한 검색이 가능해요</li>
            <li>상품을 클릭하면 원본 거래 페이지로 이동합니다</li>
            <li>🤖 AI 추천 기능으로 최적의 상품을 찾아보세요</li>
          </ul>
        </div>
      )}
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
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  searchForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  searchInputGroup: {
    display: 'flex',
    gap: '10px',
  },
  searchInput: {
    flex: 1,
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  searchButton: {
    padding: '15px 40px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  filterGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  filterItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  filterSelect: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  filterInput: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
  },
  errorBox: {
    padding: '20px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#c00',
    textAlign: 'center',
  },
  resultHeader: {
    marginBottom: '20px',
  },
  resultTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  resultCount: {
    color: '#2563eb',
    marginLeft: '10px',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  productCard: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    padding: '15px',
  },
  productImageWrapper: {
    position: 'relative',
    width: '100%',
    paddingBottom: '75%',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  productImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#999',
    fontSize: '14px',
  },
  soldBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '5px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    borderRadius: '4px',
  },
  reservedBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '5px 12px',
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    borderRadius: '4px',
  },
  productInfo: {
    padding: '15px',
  },
  productTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  productPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#2563eb',
  },
  productLocation: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  productTime: {
    fontSize: '12px',
    color: '#999',
  },
  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  noResultsHint: {
    marginTop: '10px',
    color: '#666',
    fontSize: '14px',
  },
  infoBox: {
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  infoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '15px',
    lineHeight: '2',
    color: '#666',
  },
  // AI 관련 스타일 (todolist 3일차) - Damoa 파란색 테마
  aiButton: {
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#1e40af',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  aiButtonDisabled: {
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#999',
    backgroundColor: '#e0e0e0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
    whiteSpace: 'nowrap',
  },
  aiLoadingBox: {
    padding: '30px',
    backgroundColor: '#eff6ff',
    border: '2px solid #2563eb',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#1e40af',
    fontWeight: '500',
  },
  aiResultSection: {
    marginBottom: '30px',
  },
  aiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '1px solid #dbeafe',
  },
  aiTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e40af',
  },
  closeButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#fff',
    border: '2px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  aiRecommendations: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  recommendationTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  aiScoreBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '6px 12px',
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    borderRadius: '16px',
    zIndex: 1,
  },
  aiReasons: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#555',
  },
  aiReason: {
    marginBottom: '4px',
    lineHeight: '1.4',
  },
};

// CSS 애니메이션 및 트랜지션 추가 (UI/UX 개선 - todolist 4일차)
if (!document.getElementById('product-search-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'product-search-animations';
  styleSheet.textContent = `
    /* 상품 카드 호버 효과 */
    a[style*="productCard"]:hover {
      transform: translateY(-5px) !important;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
    }

    /* 검색 인풋 포커스 효과 - Damoa 파란색 */
    input[type="text"]:focus,
    input[type="number"]:focus,
    select:focus {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
    }

    /* 버튼 호버 효과 */
    button:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
    }

    button:not(:disabled):active {
      transform: translateY(0);
    }

    /* 상품 이미지 호버 효과 */
    img[alt]:hover {
      transform: scale(1.05);
      transition: transform 0.3s ease;
    }

    /* 페이드 인 애니메이션 */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 상품 그리드 애니메이션 */
    div[style*="productsGrid"] > a {
      animation: fadeInUp 0.4s ease-out backwards;
    }

    div[style*="productsGrid"] > a:nth-child(1) { animation-delay: 0.05s; }
    div[style*="productsGrid"] > a:nth-child(2) { animation-delay: 0.1s; }
    div[style*="productsGrid"] > a:nth-child(3) { animation-delay: 0.15s; }
    div[style*="productsGrid"] > a:nth-child(4) { animation-delay: 0.2s; }
    div[style*="productsGrid"] > a:nth-child(5) { animation-delay: 0.25s; }
    div[style*="productsGrid"] > a:nth-child(6) { animation-delay: 0.3s; }
    div[style*="productsGrid"] > a:nth-child(7) { animation-delay: 0.35s; }
    div[style*="productsGrid"] > a:nth-child(8) { animation-delay: 0.4s; }
    div[style*="productsGrid"] > a:nth-child(9) { animation-delay: 0.45s; }
    div[style*="productsGrid"] > a:nth-child(10) { animation-delay: 0.5s; }
    div[style*="productsGrid"] > a:nth-child(11) { animation-delay: 0.55s; }
    div[style*="productsGrid"] > a:nth-child(12) { animation-delay: 0.6s; }

    /* 스크롤 부드럽게 */
    * {
      scroll-behavior: smooth;
    }

    /* 배지 펄스 효과 */
    div[style*="soldBadge"],
    div[style*="reservedBadge"] {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProductSearch;

