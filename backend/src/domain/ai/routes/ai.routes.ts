/**
 * AI 분석 라우트 (todolist 3일차)
 */

import { Router } from 'express';
import { AIController } from '../controller/ai.controller';

export class AIRoutes {
  public router: Router;
  private controller: AIController;

  constructor(controller: AIController) {
    this.controller = controller;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * POST /api/ai/analyze
     * AI 상품 분석 (전국 단위)
     * 
     * Request Body:
     *   {
     *     "query": "아이폰",
     *     "maxResults": 10 (optional)
     *   }
     * 
     * Response:
     *   {
     *     "success": true,
     *     "searchQuery": "아이폰",
     *     "analyzedAt": "2025-10-15T12:00:00.000Z",
     *     "totalProducts": 50,
     *     "recommendations": [...],
     *     "insights": {...},
     *     "suggestedFilters": {...},
     *     "relatedKeywords": [...]
     *   }
     */
    this.router.post('/analyze', this.controller.analyzeProducts);

    /**
     * GET /api/ai/cache/stats
     * AI 캐시 통계 조회
     */
    this.router.get('/cache/stats', this.controller.getCacheStats);

    /**
     * DELETE /api/ai/cache
     * AI 캐시 전체 삭제
     */
    this.router.delete('/cache', this.controller.clearCache);

    /**
     * GET /api/ai/popular-queries?limit=10
     * 인기 검색어 TOP N 조회 (신규!)
     */
    this.router.get('/popular-queries', this.controller.getPopularQueries);

    /**
     * GET /api/ai/cache/hit-rate
     * 캐시 히트율 조회 (신규!)
     */
    this.router.get('/cache/hit-rate', this.controller.getCacheHitRate);
  }

  /**
   * 라우터 반환
   */
  getRouter(): Router {
    return this.router;
  }
}

