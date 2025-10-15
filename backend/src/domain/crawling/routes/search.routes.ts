/**
 * 검색 라우트
 * /api/search (todolist 2일차)
 */

import { Router } from 'express';
import { SearchController } from '../controller/search.controller';
import { validateSearchRequest, validateCrawlingParams } from '../../../middlewares/validation.middleware';

export class SearchRoutes {
  public router: Router;
  private controller: SearchController;

  constructor(controller: SearchController) {
    this.router = Router();
    this.controller = controller;
    this.initRoutes();
  }

  private initRoutes(): void {
    /**
     * POST /api/search
     * 상품 검색
     *
     * Request Body:
     * {
     *   "query": "아이폰",
     *   "filters": {
     *     "locations": ["역삼동", "논현동"],
     *     "priceRange": {
     *       "min": 100000,
     *       "max": 500000
     *     },
     *     "status": "available",
     *     "platform": "daangn"
     *   }
     * }
     *
     * Response:
     * {
     *   "success": true,
     *   "totalCount": 25,
     *   "searchTime": 0.12,
     *   "products": [...]
     * }
     */
    this.router.post('/', validateSearchRequest, this.controller.searchProducts);

    /**
     * GET /api/search/recent
     * 최근 검색 로그 조회
     *
     * Query Params:
     * - limit: 조회 개수 (기본값: 10)
     *
     * Response:
     * {
     *   "success": true,
     *   "totalCount": 10,
     *   "logs": [...]
     * }
     */
    this.router.get('/recent', validateCrawlingParams, this.controller.getRecentSearches);

    /**
     * GET /api/search/popular
     * 인기 검색어 조회 (최근 7일)
     *
     * Query Params:
     * - limit: 조회 개수 (기본값: 10)
     *
     * Response:
     * {
     *   "success": true,
     *   "totalCount": 10,
     *   "searches": [
     *     { "query": "아이폰", "count": 45 },
     *     { "query": "맥북", "count": 32 }
     *   ]
     * }
     */
    this.router.get('/popular', validateCrawlingParams, this.controller.getPopularSearches);
  }

  /**
   * 라우터 반환
   */
  getRouter(): Router {
    return this.router;
  }
}

