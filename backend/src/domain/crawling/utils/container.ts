/**
 * 의존성 주입 컨테이너
 * 모든 서비스와 저장소 인스턴스를 생성하고 관리
 */

import { Pool } from 'pg';
import { createClient } from 'redis';
import { AreaRepository } from '../repository/area.repository';
import { CrawlingRepository } from '../repository/crawling.repository';
import { CrawlingLogRepository } from '../repository/crawling-log.repository';
import { SearchLogRepository } from '../repository/search-log.repository';
import { AreaService } from '../service/area.service';
import { CrawlingService } from '../service/crawling.service';
import { SearchService } from '../service/search.service';
import { AreaController } from '../controller/area.controller';
import { CrawlingController } from '../controller/crawling.controller';
import { SearchController } from '../controller/search.controller';
import { AreaRoutes } from '../routes/area.routes';
import { CrawlingRoutes } from '../routes/crawling.routes';
import { SearchRoutes } from '../routes/search.routes';
import { CrawlingScheduler } from '../scheduler/crawling.scheduler';
import { createPostgresPool, createRedisClient } from '../config';
import { AIContainer } from '../../ai'; // todolist 3일차: AI 모듈
import { SystemContainer } from '../../system'; // todolist 3일차: 시스템 상태 모듈

export class Container {
  // 데이터베이스
  private pgPool: Pool;
  private redisClient: ReturnType<typeof createClient>;

  // 저장소
  private areaRepo: AreaRepository;
  private crawlingRepo: CrawlingRepository;
  private crawlingLogRepo: CrawlingLogRepository; // todolist 3일차
  private searchLogRepo: SearchLogRepository;

  // 서비스
  private areaService: AreaService;
  private crawlingService: CrawlingService;
  private searchService: SearchService;

  // 컨트롤러
  private areaController: AreaController;
  private crawlingController: CrawlingController;
  private searchController: SearchController;

  // 라우트
  private areaRoutes: AreaRoutes;
  private crawlingRoutes: CrawlingRoutes;
  private searchRoutes: SearchRoutes;

  // 스케줄러 (todolist 3일차)
  private crawlingScheduler: CrawlingScheduler;

  // AI 모듈 (todolist 3일차)
  private aiContainer: AIContainer;

  // 시스템 상태 모듈 (todolist 3일차)
  private systemContainer: SystemContainer;

  constructor() {
    // 데이터베이스 초기화
    this.pgPool = createPostgresPool();
    this.redisClient = createRedisClient();

    // 저장소 초기화
    this.areaRepo = new AreaRepository(this.pgPool);
    this.crawlingRepo = new CrawlingRepository(this.redisClient);
    this.crawlingLogRepo = new CrawlingLogRepository(this.pgPool); // todolist 3일차
    this.searchLogRepo = new SearchLogRepository(this.pgPool);

    // 서비스 초기화
    this.areaService = new AreaService(this.areaRepo);
    this.crawlingService = new CrawlingService(
      this.crawlingRepo,
      this.areaRepo,
      this.crawlingLogRepo // todolist 3일차: 크롤링 로그 저장
    );
    this.searchService = new SearchService(
      this.crawlingRepo,
      this.searchLogRepo
    );

    // 컨트롤러 초기화
    this.areaController = new AreaController(this.areaService);
    this.crawlingController = new CrawlingController(this.crawlingService);
    this.searchController = new SearchController(this.searchService);

    // 라우트 초기화
    this.areaRoutes = new AreaRoutes(this.areaController);
    this.crawlingRoutes = new CrawlingRoutes(this.crawlingController);
    this.searchRoutes = new SearchRoutes(this.searchController);

    // 스케줄러 초기화 (todolist 3일차)
    this.crawlingScheduler = new CrawlingScheduler(this.crawlingService);

    // AI 모듈 초기화 (todolist 3일차)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    this.aiContainer = new AIContainer(
      this.redisClient,
      this.crawlingRepo,
      openaiApiKey
    );

    // 시스템 상태 모듈 초기화 (todolist 3일차)
    this.systemContainer = new SystemContainer(
      this.pgPool,
      this.redisClient,
      this.crawlingRepo,
      this.crawlingLogRepo,
      this.searchLogRepo,
      this.areaRepo,
      this.crawlingScheduler
    );
  }

  /**
   * PostgreSQL Pool 반환
   */
  getPostgresPool(): Pool {
    return this.pgPool;
  }

  /**
   * Redis 클라이언트 반환
   */
  getRedisClient(): ReturnType<typeof createClient> {
    return this.redisClient;
  }

  /**
   * 지역 라우트 반환
   */
  getAreaRoutes(): AreaRoutes {
    return this.areaRoutes;
  }

  /**
   * 크롤링 라우트 반환
   */
  getCrawlingRoutes(): CrawlingRoutes {
    return this.crawlingRoutes;
  }

  /**
   * 검색 라우트 반환 (todolist 2일차)
   */
  getSearchRoutes(): SearchRoutes {
    return this.searchRoutes;
  }

  /**
   * 크롤링 스케줄러 반환 (todolist 3일차)
   */
  getCrawlingScheduler(): CrawlingScheduler {
    return this.crawlingScheduler;
  }

  /**
   * AI 컨테이너 반환 (todolist 3일차)
   */
  getAIContainer(): AIContainer {
    return this.aiContainer;
  }

  /**
   * 시스템 컨테이너 반환 (todolist 3일차)
   */
  getSystemContainer(): SystemContainer {
    return this.systemContainer;
  }

  /**
   * 연결 종료
   */
  async close(): Promise<void> {
    // 스케줄러 중지 (todolist 3일차)
    this.crawlingScheduler.stopAll();
    
    await this.pgPool.end();
    if (this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
    console.log('✅ 모든 데이터베이스 연결 종료');
  }
}

