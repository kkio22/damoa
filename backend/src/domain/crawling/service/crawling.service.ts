/**
 * 크롤링 서비스
 * 당근마켓 REST API에서 상품 데이터 수집
 */

import axios from 'axios';
import { CrawlingRepository } from '../repository/crawling.repository';
import { AreaRepository } from '../repository/area.repository';
import { CrawlingLogRepository } from '../repository/crawling-log.repository';
import { Product, ProductStatus, DaangnArticle, Area } from '../types';

export class CrawlingService {
  private crawlingRepo: CrawlingRepository;
  private areaRepo: AreaRepository;
  private crawlingLogRepo?: CrawlingLogRepository; // Optional (기존 코드 호환)
  private readonly DAANGN_WEB_URL = 'https://www.daangn.com';
  private readonly MAX_RETRIES = 3; // todolist 3일차: 재시도 횟수
  private readonly RETRY_DELAY = 5000; // todolist 3일차: 재시도 대기 시간 (5초)

  constructor(
    crawlingRepo: CrawlingRepository,
    areaRepo: AreaRepository,
    crawlingLogRepo?: CrawlingLogRepository // Optional parameter
  ) {
    this.crawlingRepo = crawlingRepo;
    this.areaRepo = areaRepo;
    this.crawlingLogRepo = crawlingLogRepo;
  }

  /**
   * 당근마켓 크롤링 실행
   */
  async crawlDaangn(locations?: string[]): Promise<{
    success: boolean;
    totalProducts: number;
    locations: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    console.log('\n🚀 당근마켓 크롤링 시작...');

    try {
      // DB에서 지역 정보 가져오기
      console.log('📊 DB에서 지역 정보 조회 중...');
      const allAreas = await this.areaRepo.getAll();
      console.log(`✅ DB 조회 완료: ${allAreas.length}개 지역`);
      
      if (allAreas.length === 0) {
        throw new Error('DB에 지역 정보가 없습니다. areas 테이블에 지역을 먼저 추가하세요.');
      }

      // 특정 지역만 크롤링할지 결정
      let targetAreas = allAreas;
      if (locations && locations.length > 0) {
        targetAreas = allAreas.filter(area => locations.includes(area.name));
        console.log(`📍 대상 지역: ${targetAreas.map(a => a.name).join(', ')}`);
      } else {
        console.log(`📍 대상 지역: 전체 ${allAreas.length}개 지역`);
      }

      if (targetAreas.length === 0) {
        throw new Error('크롤링할 지역이 없습니다.');
      }

      // 각 지역별로 크롤링
      let totalProducts = 0;
      const processedLocations: string[] = [];

      for (const area of targetAreas) {
        console.log(`\n📍 ${area.name} (ID: ${area.id}) 크롤링 중...`);
        
        const products = await this.crawlDaangnByArea(area);
        
        if (products.length > 0) {
          // Redis에 저장
          await this.crawlingRepo.saveProductsByLocation(area.name, products);
          totalProducts += products.length;
          processedLocations.push(area.name);
        }

        // 요청 간격 (Rate Limiting 방지)
        await this.delay(2000); // 2초 대기
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ 크롤링 완료!`);
      console.log(`   - 처리 지역: ${processedLocations.length}개`);
      console.log(`   - 총 상품: ${totalProducts}개`);
      console.log(`   - 소요 시간: ${duration}초`);
      console.log(`${'='.repeat(60)}\n`);

      console.log(`📦 결과 객체 생성 중...`);
      const result = {
        success: true,
        totalProducts,
        locations: processedLocations,
        duration,
      };
      console.log(`✅ 결과 객체 생성 완료:`, result);
      
      return result;

    } catch (error) {
      console.error('❌ 크롤링 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 지역의 당근마켓 상품 크롤링
   */
  private async crawlDaangnByArea(area: Area): Promise<Product[]> {
    const products: Product[] = [];

    try {
      // REST API URL 생성
      const regionParam = encodeURIComponent(`${area.name}-${area.id}`);
      const url = `${this.DAANGN_WEB_URL}/kr/buy-sell/?in=${regionParam}&_data=routes%2Fkr.buy-sell._index`;
      
      console.log(`  🌐 URL: ${url}`);

      // API 호출
      const response = await axios.get(url, {
        headers: {
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        timeout: 30000,
      });

      console.log(`  📡 응답 상태: ${response.status}`);
      console.log(`  📄 응답 데이터 키:`, Object.keys(response.data || {}));

      // JSON 응답 파싱
      const articles: DaangnArticle[] = response.data?.allPage?.fleamarketArticles || [];
      
      console.log(`  📦 API 응답: ${articles.length}개 상품`);
      
      if (articles.length === 0) {
        console.log(`  ⚠️  응답 데이터 구조:`, JSON.stringify(response.data, null, 2).substring(0, 500));
      }

      // Product 형식으로 변환
      articles.forEach((article) => {
        try {
          // 상품 ID 추출
          const urlParts = article.href.split('/');
          const originalId = urlParts[urlParts.length - 2] || article.id;

          // 가격 파싱
          const price = parseFloat(article.price) || 0;

          // 상품 상태 변환
          let status: ProductStatus = 'available';
          if (article.status === 'Sold') {
            status = 'sold';
          } else if (article.status === 'Reserved') {
            status = 'reserved';
          }

          const product: Product = {
            id: `daangn:${originalId}`,
            platform: 'daangn',
            originalId: originalId,
            title: article.title,
            price: price,
            description: article.content || '',
            location: area.name,
            originalUrl: article.href,
            imageUrls: article.thumbnail ? [article.thumbnail] : [],
            status: status,
            createdAt: article.createdAt,
            updatedAt: new Date().toISOString(),
          };

          products.push(product);

        } catch (error) {
          console.error('  ❌ 상품 파싱 오류:', error);
        }
      });

      console.log(`  ✅ ${products.length}개 상품 변환 완료`);

    } catch (error) {
      console.error(`  ❌ API 호출 오류:`, error);
      if (axios.isAxiosError(error)) {
        console.error(`  📡 Status: ${error.response?.status}`);
        console.error(`  📝 Message: ${error.message}`);
      }
    }

    return products;
  }

  /**
   * 딜레이 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Redis 통계 조회
   */
  async getStats() {
    return await this.crawlingRepo.getStats();
  }

  /**
   * 전체 상품 조회
   */
  async getAllProducts(): Promise<Product[]> {
    return await this.crawlingRepo.getAllProducts();
  }

  /**
   * 지역별 상품 조회
   */
  async getProductsByLocation(location: string): Promise<Product[]> {
    return await this.crawlingRepo.getProductsByLocation(location);
  }

  /**
   * 재시도 로직이 포함된 지역별 크롤링 (todolist 3일차)
   */
  private async crawlDaangnByAreaWithRetry(area: Area, retryCount: number = 0): Promise<Product[]> {
    try {
      return await this.crawlDaangnByArea(area);
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        console.log(`  🔄 재시도 (${retryCount + 1}/${this.MAX_RETRIES}) - ${this.RETRY_DELAY / 1000}초 후...`);
        await this.delay(this.RETRY_DELAY);
        return await this.crawlDaangnByAreaWithRetry(area, retryCount + 1);
      }
      
      console.error(`  ❌ 최대 재시도 횟수 초과: ${area.name}`);
      throw error;
    }
  }

  /**
   * 로그 저장이 포함된 크롤링 실행 (todolist 3일차)
   */
  async crawlDaangnWithLogging(locations?: string[]): Promise<{
    success: boolean;
    totalProducts: number;
    locations: string[];
    duration: number;
  }> {
    let logId: number | undefined;
    const startTime = Date.now();

    try {
      // 크롤링 로그 시작
      if (this.crawlingLogRepo) {
        logId = await this.crawlingLogRepo.startLog('daangn');
      }

      // 기존 크롤링 로직 실행
      const result = await this.crawlDaangn(locations);

      // 크롤링 로그 완료
      if (this.crawlingLogRepo && logId) {
        await this.crawlingLogRepo.completeLog(
          logId,
          result.totalProducts,
          result.totalProducts, // new_products (간단히 전체로 설정)
          0, // updated_products
          0, // error_count
          result.duration
        );
      }

      return result;

    } catch (error) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      // 크롤링 로그 실패
      if (this.crawlingLogRepo && logId) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        await this.crawlingLogRepo.failLog(logId, errorMessage, duration);
      }

      throw error;
    }
  }

  /**
   * Redis 데이터 교체 로직 (백업 → 새 데이터 → 교체) - todolist 3일차
   */
  async crawlDaangnWithBackup(locations?: string[]): Promise<{
    success: boolean;
    totalProducts: number;
    locations: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    console.log('\n🔄 Redis 데이터 백업 및 교체 프로세스 시작...');

    try {
      // 1. 기존 데이터 백업
      console.log('📦 기존 Redis 데이터 백업 중...');
      const backupKeys = await this.crawlingRepo.backupAllData();
      console.log(`✅ ${backupKeys.length}개 키 백업 완료`);

      // 2. 새 데이터 크롤링
      console.log('🚀 새 데이터 크롤링 시작...');
      const result = await this.crawlDaangn(locations);

      // 3. 성공 시 백업 삭제
      if (result.success && result.totalProducts > 0) {
        console.log('🗑️  백업 데이터 삭제 중...');
        await this.crawlingRepo.deleteBackupData();
        console.log('✅ 백업 데이터 삭제 완료');
      } else {
        // 4. 실패 시 백업에서 복원
        console.log('⚠️  크롤링 결과가 없습니다. 백업에서 복원 중...');
        await this.crawlingRepo.restoreFromBackup();
        console.log('✅ 백업 데이터 복원 완료');
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);
      console.log(`✅ Redis 데이터 교체 프로세스 완료 (${duration}초)`);

      return {
        ...result,
        duration,
      };

    } catch (error) {
      console.error('❌ Redis 데이터 교체 프로세스 실패:', error);
      
      // 에러 발생 시 백업에서 복원
      try {
        console.log('🔄 백업에서 복원 시도...');
        await this.crawlingRepo.restoreFromBackup();
        console.log('✅ 백업 데이터 복원 완료');
      } catch (restoreError) {
        console.error('❌ 백업 복원 실패:', restoreError);
      }

      throw error;
    }
  }

  /**
   * 크롤링 로그 통계 조회 (todolist 3일차)
   */
  async getCrawlingStats() {
    if (!this.crawlingLogRepo) {
      throw new Error('CrawlingLogRepository가 초기화되지 않았습니다');
    }
    return await this.crawlingLogRepo.getStats();
  }

  /**
   * 최근 크롤링 로그 조회 (todolist 3일차)
   */
  async getRecentCrawlingLogs(limit: number = 10) {
    if (!this.crawlingLogRepo) {
      throw new Error('CrawlingLogRepository가 초기화되지 않았습니다');
    }
    return await this.crawlingLogRepo.getRecentLogs(limit);
  }
}

