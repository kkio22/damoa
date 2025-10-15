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
     * AI 상품 분석
     * 
     * Request Body:
     *   {
     *     "query": "아이폰",
     *     "locations": ["역삼동", "논현동"] (optional),
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
  }

  /**
   * 라우터 반환
   */
  getRouter(): Router {
    return this.router;
  }
}

