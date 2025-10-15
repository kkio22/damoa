/**
 * 크롤링 라우트
 */

import { Router } from 'express';
import { CrawlingController } from '../controller/crawling.controller';

export class CrawlingRoutes {
  public router: Router;
  private controller: CrawlingController;

  constructor(controller: CrawlingController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  /**
   * 라우트 초기화
   */
  private initializeRoutes(): void {
    /**
     * POST /api/crawling/trigger
     * 크롤링 트리거 - 완료 후 응답
     * 
     * Request Body:
     * {
     *   "locations": ["역삼동", "논현동"]  // 생략 시 전체 지역
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "크롤링이 완료되었습니다",
     *   "data": {
     *     "totalProducts": 98,
     *     "locations": ["역삼동", "논현동"],
     *     "duration": 6
     *   }
     * }
     */
    this.router.post('/trigger', this.controller.triggerCrawling);

    /**
     * GET /api/crawling/stats
     * Redis 통계 조회
     */
    this.router.get('/stats', this.controller.getStats);

    /**
     * GET /api/crawling/products
     * 전체 상품 조회
     */
    this.router.get('/products', this.controller.getAllProducts);

    /**
     * GET /api/crawling/products/:location
     * 지역별 상품 조회
     */
    this.router.get('/products/:location', this.controller.getProductsByLocation);
  }

  /**
   * 라우터 반환
   */
  getRouter(): Router {
    return this.router;
  }
}

