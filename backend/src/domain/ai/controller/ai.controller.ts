/**
 * AI 분석 컨트롤러 (todolist 3일차)
 */

import { Request, Response } from 'express';
import { AIAnalysisService } from '../service/ai-analysis.service';
import { AICacheService } from '../service/ai-cache.service';
import { CrawlingRepository } from '../../crawling/repository/crawling.repository';
import { AIAnalyzeRequest } from '../types';

export class AIController {
  private aiService: AIAnalysisService;
  private cacheService: AICacheService;
  private crawlingRepo: CrawlingRepository;

  constructor(
    aiService: AIAnalysisService,
    cacheService: AICacheService,
    crawlingRepo: CrawlingRepository
  ) {
    this.aiService = aiService;
    this.cacheService = cacheService;
    this.crawlingRepo = crawlingRepo;
  }

  /**
   * POST /api/ai/analyze
   * AI 상품 분석 (캐싱 포함)
   */
  analyzeProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, locations, maxResults } = req.body;

      if (!query || query.trim() === '') {
        res.status(400).json({
          success: false,
          message: '검색어를 입력해주세요',
        });
        return;
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`🤖 AI 분석 요청: "${query}"`);
      console.log(`⏰ 시작 시간: ${new Date().toISOString()}`);
      console.log(`${'='.repeat(60)}\n`);

      // 1. Redis에서 상품 데이터 가져오기
      let products = await this.crawlingRepo.getAllProducts();
      console.log(`📦 전체 상품: ${products.length}개`);

      // 2. 지역 필터링 (옵션)
      if (locations && Array.isArray(locations) && locations.length > 0) {
        products = products.filter(p => locations.includes(p.location));
        console.log(`📍 지역 필터링 후: ${products.length}개`);
      }

      if (products.length === 0) {
        res.status(404).json({
          success: false,
          message: '분석할 상품이 없습니다. 먼저 크롤링을 실행해주세요.',
        });
        return;
      }

      // 3. 캐시 확인
      const cached = await this.cacheService.get(query, products.length);
      if (cached) {
        console.log('✅ 캐시된 결과 반환\n');
        res.status(200).json(cached);
        return;
      }

      // 4. AI 분석 실행
      const request: AIAnalyzeRequest = {
        query,
        products,
        maxResults: maxResults || 10,
      };

      const result = await this.aiService.analyzeProducts(request);

      // 5. 캐시 저장
      await this.cacheService.set(query, products.length, result);

      console.log('✅ AI 분석 완료\n');
      res.status(200).json(result);

    } catch (error) {
      console.error('❌ AI 분석 실패:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      });
    }
  };

  /**
   * GET /api/ai/cache/stats
   * AI 캐시 통계
   */
  getCacheStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.cacheService.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ AI 캐시 통계 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  };

  /**
   * DELETE /api/ai/cache
   * AI 캐시 전체 삭제
   */
  clearCache = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.cacheService.clearAll();
      res.status(200).json({
        success: true,
        message: 'AI 캐시가 모두 삭제되었습니다',
      });
    } catch (error) {
      console.error('❌ AI 캐시 삭제 실패:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  };
}

