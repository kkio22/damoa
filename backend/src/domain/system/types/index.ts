/**
 * 시스템 상태 관련 타입 정의 (todolist 3일차)
 */

/**
 * 시스템 상태 응답
 */
export interface SystemStatus {
  success: boolean;
  timestamp: string;
  uptime: number; // 초 단위
  services: ServiceStatus;
  crawling: CrawlingStatus;
  statistics: SystemStatistics;
}

/**
 * 서비스 상태
 */
export interface ServiceStatus {
  backend: {
    status: 'healthy' | 'unhealthy';
    version: string;
  };
  database: {
    status: 'connected' | 'disconnected';
    type: 'PostgreSQL';
  };
  cache: {
    status: 'connected' | 'disconnected';
    type: 'Redis';
  };
}

/**
 * 크롤링 상태
 */
export interface CrawlingStatus {
  scheduler: {
    enabled: boolean;
    running: boolean;
    nextRun?: string;
  };
  lastCrawl?: {
    timestamp: string;
    status: 'success' | 'failed';
    totalProducts: number;
    duration: number;
  };
  recentLogs: CrawlingLogSummary[];
}

/**
 * 크롤링 로그 요약
 */
export interface CrawlingLogSummary {
  id: number;
  platform: string;
  status: string;
  total_products: number;
  duration: number;
  started_at: string;
}

/**
 * 시스템 통계
 */
export interface SystemStatistics {
  redis: {
    totalPlatforms: number;
    totalProducts: number;
    cacheHitRate?: number;
  };
  database: {
    totalAreas: number;
    totalSearchLogs: number;
    totalCrawlingLogs: number;
  };
  search: {
    totalSearches: number;
    popularKeywords: Array<{ query: string; count: number }>;
  };
}

