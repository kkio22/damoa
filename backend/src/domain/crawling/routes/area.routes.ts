/**
 * 지역(동) 정보 라우트
 */

import { Router } from 'express';
import { AreaController } from '../controller/area.controller';

export class AreaRoutes {
  private router: Router;
  private controller: AreaController;

  constructor(controller: AreaController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  /**
   * 라우트 초기화
   */
  private initializeRoutes(): void {
    // 지역 추가
    this.router.post('/', this.controller.addArea);

    // 여러 지역 일괄 추가
    this.router.post('/bulk', this.controller.addAreas);

    // 전체 지역 조회
    this.router.get('/', this.controller.getAllAreas);

    // 지역 통계
    this.router.get('/stats', this.controller.getStats);

    // 지역 삭제
    this.router.delete('/:id', this.controller.deleteArea);
  }

  /**
   * 라우터 반환
   */
  getRouter(): Router {
    return this.router;
  }
}

