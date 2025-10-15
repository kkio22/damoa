/**
 * AI 모듈 엔트리 포인트 (todolist 3일차)
 */

import { createClient } from 'redis';
import { Pool } from 'pg';
import { AIAnalysisService } from './service/ai-analysis.service';
import { AICacheService } from './service/ai-cache.service';
import { AIController } from './controller/ai.controller';
import { AIRoutes } from './routes/ai.routes';
import { CrawlingRepository } from '../crawling/repository/crawling.repository';

export class AIContainer {
  private aiService: AIAnalysisService;
  private cacheService: AICacheService;
  private controller: AIController;
  private routes: AIRoutes;

  constructor(
    redisClient: ReturnType<typeof createClient>,
    crawlingRepo: CrawlingRepository,
    openaiApiKey?: string
  ) {
    // 서비스 초기화
    this.aiService = new AIAnalysisService(openaiApiKey);
    this.cacheService = new AICacheService(redisClient);

    // 컨트롤러 초기화
    this.controller = new AIController(
      this.aiService,
      this.cacheService,
      crawlingRepo
    );

    // 라우트 초기화
    this.routes = new AIRoutes(this.controller);

    console.log('✅ AI 모듈 초기화 완료');
  }

  /**
   * AI 라우트 반환
   */
  getRoutes(): AIRoutes {
    return this.routes;
  }

  /**
   * AI 서비스 반환
   */
  getAIService(): AIAnalysisService {
    return this.aiService;
  }
}

// 타입 내보내기
export * from './types';

