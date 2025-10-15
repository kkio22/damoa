/**
 * 검색 서비스
 * Redis에서 상품 검색 + 필터링 로직 (todolist 2일차)
 */

import { CrawlingRepository } from '../repository/crawling.repository';
import { SearchLogRepository } from '../repository/search-log.repository';
import { Product, SearchFilters, SearchRequest, SearchResponse } from '../types';

export class SearchService {
  private crawlingRepo: CrawlingRepository;
  private searchLogRepo: SearchLogRepository;

  constructor(
    crawlingRepo: CrawlingRepository,
    searchLogRepo: SearchLogRepository
  ) {
    this.crawlingRepo = crawlingRepo;
    this.searchLogRepo = searchLogRepo;
  }

  /**
   * 상품 검색 (POST /api/search)
   */
  async searchProducts(
    request: SearchRequest,
    userIp?: string,
    userAgent?: string
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    console.log(`🔍 검색 시작: "${request.query}"`);

    try {
      // 1. Redis에서 전체 상품 조회
      let products = await this.crawlingRepo.getAllProducts();
      console.log(`📦 Redis에서 ${products.length}개 상품 조회 완료`);

      // 2. 검색어로 필터링
      if (request.query && request.query.trim() !== '') {
        const query = request.query.toLowerCase().trim();
        products = products.filter(product => 
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
        console.log(`🔎 검색어 필터링 후: ${products.length}개`);
      }

      // 3. 필터 적용
      if (request.filters) {
        products = this.applyFilters(products, request.filters);
        console.log(`🎯 필터 적용 후: ${products.length}개`);
      }

      // 4. 검색 소요 시간 계산
      const searchTime = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
      console.log(`⏱️  검색 소요 시간: ${searchTime}초`);

      // 5. 검색 로그 저장 (비동기, 에러 무시)
      this.saveSearchLog(
        request.query,
        request.filters,
        products.length,
        searchTime,
        userIp,
        userAgent
      ).catch(err => console.error('검색 로그 저장 실패:', err));

      // 6. 응답 반환
      return {
        success: true,
        totalCount: products.length,
        searchTime,
        products,
      };

    } catch (error) {
      console.error('❌ 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 필터 적용 로직
   */
  private applyFilters(products: Product[], filters: SearchFilters): Product[] {
    let filtered = [...products];

    // 지역 필터
    if (filters.locations && filters.locations.length > 0) {
      filtered = filtered.filter(product =>
        filters.locations!.includes(product.location)
      );
      console.log(`  - 지역 필터 (${filters.locations.join(', ')}): ${filtered.length}개`);
    }

    // 가격 필터
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      
      if (min !== undefined) {
        filtered = filtered.filter(product => product.price >= min);
      }
      
      if (max !== undefined) {
        filtered = filtered.filter(product => product.price <= max);
      }
      
      console.log(`  - 가격 필터 (${min || 0}원 ~ ${max || '∞'}원): ${filtered.length}개`);
    }

    // 거래방식 필터
    if (filters.tradeMethod) {
      filtered = filtered.filter(product =>
        product.tradeMethod === filters.tradeMethod
      );
      console.log(`  - 거래방식 필터 (${filters.tradeMethod}): ${filtered.length}개`);
    }

    // 상품 상태 필터
    if (filters.status) {
      filtered = filtered.filter(product =>
        product.status === filters.status
      );
      console.log(`  - 상태 필터 (${filters.status}): ${filtered.length}개`);
    }

    // 플랫폼 필터
    if (filters.platform) {
      filtered = filtered.filter(product =>
        product.platform === filters.platform
      );
      console.log(`  - 플랫폼 필터 (${filters.platform}): ${filtered.length}개`);
    }

    return filtered;
  }

  /**
   * 검색 로그 저장 (비동기)
   */
  private async saveSearchLog(
    query: string,
    filters: SearchFilters | undefined,
    resultCount: number,
    searchTime: number,
    userIp?: string,
    userAgent?: string
  ): Promise<void> {
    await this.searchLogRepo.saveLog({
      query,
      filters: filters || {},
      result_count: resultCount,
      search_time: searchTime,
      user_ip: userIp,
      user_agent: userAgent,
    });
  }

  /**
   * 최근 검색 로그 조회
   */
  async getRecentSearches(limit: number = 10) {
    return await this.searchLogRepo.getRecentLogs(limit);
  }

  /**
   * 인기 검색어 조회
   */
  async getPopularSearches(limit: number = 10) {
    return await this.searchLogRepo.getPopularSearches(limit);
  }
}

