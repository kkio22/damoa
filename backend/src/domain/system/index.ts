/**
 * 시스템 상태 모듈 엔트리 포인트 (todolist 3일차)
 */

import { Pool } from 'pg';
import { createClient } from 'redis';
import { SystemService } from './service/system.service';
import { SystemController } from './controller/system.controller';
import { SystemRoutes } from './routes/system.routes';
import { CrawlingRepository } from '../crawling/repository/crawling.repository';
import { CrawlingLogRepository } from '../crawling/repository/crawling-log.repository';
import { SearchLogRepository } from '../crawling/repository/search-log.repository';
import { AreaRepository } from '../crawling/repository/area.repository';
import { CrawlingScheduler } from '../crawling/scheduler/crawling.scheduler';

export class SystemContainer {
  private systemService: SystemService;
  private controller: SystemController;
  private routes: SystemRoutes;

  constructor(
    pgPool: Pool,
    redisClient: ReturnType<typeof createClient>,
    crawlingRepo: CrawlingRepository,
    crawlingLogRepo: CrawlingLogRepository,
    searchLogRepo: SearchLogRepository,
    areaRepo: AreaRepository,
    scheduler?: CrawlingScheduler
  ) {
    // 서비스 초기화
    this.systemService = new SystemService(
      pgPool,
      redisClient,
      crawlingRepo,
      crawlingLogRepo,
      searchLogRepo,
      areaRepo,
      scheduler
    );

    // 컨트롤러 초기화
    this.controller = new SystemController(this.systemService);

    // 라우트 초기화
    this.routes = new SystemRoutes(this.controller);

    console.log('✅ 시스템 상태 모듈 초기화 완료');
  }

  /**
   * 시스템 라우트 반환
   */
  getRoutes(): SystemRoutes {
    return this.routes;
  }

  /**
   * 시스템 서비스 반환
   */
  getSystemService(): SystemService {
    return this.systemService;
  }
}

// 타입 내보내기
export * from './types';

