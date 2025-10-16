/**
 * 시스템 상태 서비스 (todolist 3일차)
 */

import { Pool } from 'pg';
import { createClient } from 'redis';
import { SystemStatus, ServiceStatus, CrawlingStatus, SystemStatistics } from '../types';
import { CrawlingRepository } from '../../crawling/repository/crawling.repository';
import { CrawlingLogRepository } from '../../crawling/repository/crawling-log.repository';
import { SearchLogRepository } from '../../crawling/repository/search-log.repository';
import { AreaRepository } from '../../crawling/repository/area.repository';
import { CrawlingScheduler } from '../../crawling/scheduler/crawling.scheduler';

export class SystemService {
  private pgPool: Pool;
  private redisClient: ReturnType<typeof createClient>;
  private crawlingRepo: CrawlingRepository;
  private crawlingLogRepo: CrawlingLogRepository;
  private searchLogRepo: SearchLogRepository;
  private areaRepo: AreaRepository;
  private scheduler?: CrawlingScheduler;
  private startTime: number;

  constructor(
    pgPool: Pool,
    redisClient: ReturnType<typeof createClient>,
    crawlingRepo: CrawlingRepository,
    crawlingLogRepo: CrawlingLogRepository,
    searchLogRepo: SearchLogRepository,
    areaRepo: AreaRepository,
    scheduler?: CrawlingScheduler
  ) {
    this.pgPool = pgPool;
    this.redisClient = redisClient;
    this.crawlingRepo = crawlingRepo;
    this.crawlingLogRepo = crawlingLogRepo;
    this.searchLogRepo = searchLogRepo;
    this.areaRepo = areaRepo;
    this.scheduler = scheduler;
    this.startTime = Date.now();
  }

  /**
   * 전체 시스템 상태 조회
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const [services, crawling, statistics] = await Promise.all([
      this.getServiceStatus(),
      this.getCrawlingStatus(),
      this.getStatistics(),
    ]);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services,
      crawling,
      statistics,
    };
  }

  /**
   * 서비스 상태 확인
   */
  private async getServiceStatus(): Promise<ServiceStatus> {
    // PostgreSQL 상태
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await this.pgPool.query('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      console.error('PostgreSQL 연결 실패:', error);
    }

    // Redis 상태
    let cacheStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      if (this.redisClient.isOpen) {
        await this.redisClient.ping();
        cacheStatus = 'connected';
      }
    } catch (error) {
      console.error('Redis 연결 실패:', error);
    }

    return {
      backend: {
        status: 'healthy',
        version: '1.0.0',
      },
      database: {
        status: dbStatus,
        type: 'PostgreSQL',
      },
      cache: {
        status: cacheStatus,
        type: 'Redis',
      },
    };
  }

  /**
   * 크롤링 상태 조회
   */
  private async getCrawlingStatus(): Promise<CrawlingStatus> {
    // 스케줄러 상태
    const schedulerEnabled = process.env.ENABLE_CRAWLER_SCHEDULER === 'true';
    const schedulerInfo = this.scheduler?.getSchedulerInfo();
    
    // 최근 크롤링 로그 조회
    let recentLogs: Array<{
      id: number;
      platform: string;
      status: string;
      total_products: number;
      duration: number;
      started_at: string;
    }> = [];
    let lastCrawl = undefined;

    try {
      const logs = await this.crawlingLogRepo.getRecentLogs(5);
      recentLogs = logs.map(log => ({
        id: log.id!,
        platform: log.platform,
        status: log.status,
        total_products: log.totalProducts, // camelCase로 접근
        duration: log.duration || 0,
        started_at: log.startedAt?.toISOString() || '', // camelCase로 접근
      }));

      // 마지막 크롤링 정보
      if (logs.length > 0 && logs[0].status === 'completed') {
        lastCrawl = {
          timestamp: logs[0].completedAt?.toISOString() || logs[0].startedAt?.toISOString() || '', // camelCase
          status: 'success' as const,
          totalProducts: logs[0].totalProducts, // camelCase
          duration: logs[0].duration || 0,
        };
      }
    } catch (error) {
      console.error('크롤링 로그 조회 실패:', error);
    }

    return {
      scheduler: {
        enabled: schedulerEnabled,
        running: schedulerInfo?.running || false,
        nextRun: schedulerEnabled ? '매일 자정 (00:00)' : undefined,
      },
      lastCrawl,
      recentLogs,
    };
  }

  /**
   * 시스템 통계 조회
   */
  private async getStatistics(): Promise<SystemStatistics> {
    // Redis 통계 (플랫폼 기반으로 변경)
    let redisStats = {
      totalPlatforms: 0,
      totalProducts: 0,
    };
    try {
      const stats = await this.crawlingRepo.getStats();
      redisStats = {
        totalPlatforms: stats.totalPlatforms,
        totalProducts: stats.totalProducts,
      };
    } catch (error) {
      console.error('Redis 통계 조회 실패:', error);
    }

    // PostgreSQL 통계
    let dbStats = {
      totalAreas: 0,
      totalSearchLogs: 0,
      totalCrawlingLogs: 0,
    };
    try {
      const [areasResult, searchLogsResult, crawlingLogsResult] = await Promise.all([
        this.pgPool.query('SELECT COUNT(*) as count FROM areas'),
        this.pgPool.query('SELECT COUNT(*) as count FROM search_logs'),
        this.pgPool.query('SELECT COUNT(*) as count FROM crawling_logs'),
      ]);

      dbStats = {
        totalAreas: parseInt(areasResult.rows[0]?.count || '0'),
        totalSearchLogs: parseInt(searchLogsResult.rows[0]?.count || '0'),
        totalCrawlingLogs: parseInt(crawlingLogsResult.rows[0]?.count || '0'),
      };
    } catch (error) {
      console.error('PostgreSQL 통계 조회 실패:', error);
    }

    // 검색 통계
    let searchStats = {
      totalSearches: dbStats.totalSearchLogs,
      popularKeywords: [] as Array<{ query: string; count: number }>,
    };
    try {
      const popular = await this.searchLogRepo.getPopularSearches(5);
      searchStats.popularKeywords = popular;
    } catch (error) {
      console.error('검색 통계 조회 실패:', error);
    }

    return {
      redis: redisStats,
      database: dbStats,
      search: searchStats,
    };
  }
}

