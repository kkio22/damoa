/**
 * 시스템 상태 라우트 (todolist 3일차)
 */

import { Router } from 'express';
import { SystemController } from '../controller/system.controller';

export class SystemRoutes {
  public router: Router;
  private controller: SystemController;

  constructor(controller: SystemController) {
    this.controller = controller;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * GET /api/system/status
     * 전체 시스템 상태 조회
     * 
     * Response:
     * {
     *   "success": true,
     *   "timestamp": "2025-10-15T12:00:00.000Z",
     *   "uptime": 3600,
     *   "services": {...},
     *   "crawling": {...},
     *   "statistics": {...}
     * }
     */
    this.router.get('/status', this.controller.getStatus);

    /**
     * GET /api/system/health
     * 간단한 헬스체크 (빠른 응답)
     */
    this.router.get('/health', this.controller.getHealth);
  }

  /**
   * 라우터 반환
   */
  getRouter(): Router {
    return this.router;
  }
}

