/**
 * 즐겨찾기 모듈 엔트리 포인트
 */

import { Pool } from 'pg';
import { FavoriteRepository } from './repository/favorite.repository';
import { FavoriteService } from './service/favorite.service';
import { FavoriteController } from './controller/favorite.controller';
import { FavoriteRoutes } from './routes/favorite.routes';

export class FavoriteContainer {
  private repository: FavoriteRepository;
  private service: FavoriteService;
  private controller: FavoriteController;
  private routes: FavoriteRoutes;

  constructor(pool: Pool) {
    // Repository 초기화
    this.repository = new FavoriteRepository(pool);

    // Service 초기화
    this.service = new FavoriteService(this.repository);

    // Controller 초기화
    this.controller = new FavoriteController(this.service);

    // Routes 초기화
    this.routes = new FavoriteRoutes(this.controller);

    console.log('✅ 즐겨찾기 모듈 초기화 완료');
  }

  getRoutes(): FavoriteRoutes {
    return this.routes;
  }

  getService(): FavoriteService {
    return this.service;
  }
}

// 타입 내보내기
export * from './types';

