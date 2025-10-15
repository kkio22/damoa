/**
 * 크롤링 모듈 진입점
 * Express 앱에서 import하여 사용
 */

import { Container } from './utils/container';

// 싱글톤 컨테이너
let container: Container | null = null;

/**
 * 크롤링 모듈 초기화
 */
export const initCrawlingModule = async (): Promise<Container> => {
  if (!container) {
    console.log('🚀 크롤링 모듈 초기화 중...');
    container = new Container();

    // Redis 연결
    const redisClient = container.getRedisClient();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // 크롤링 스케줄러 초기화 (todolist 3일차)
    const scheduler = container.getCrawlingScheduler();
    
    // 환경변수로 스케줄러 제어
    const enableScheduler = process.env.ENABLE_CRAWLER_SCHEDULER === 'true';
    
    if (enableScheduler) {
      scheduler.scheduleDailyCrawling(); // 매일 자정
      scheduler.startAll();
      console.log('✅ 크롤링 스케줄러 활성화 (매일 자정)');
    } else {
      console.log('⏸️  크롤링 스케줄러 비활성화 (ENABLE_CRAWLER_SCHEDULER=true로 활성화)');
    }

    console.log('✅ 크롤링 모듈 초기화 완료');
  }

  return container;
};

/**
 * 크롤링 모듈 컨테이너 반환
 */
export const getCrawlingContainer = (): Container => {
  if (!container) {
    throw new Error('크롤링 모듈이 초기화되지 않았습니다. initCrawlingModule()을 먼저 호출하세요.');
  }
  return container;
};

/**
 * 크롤링 모듈 종료
 */
export const shutdownCrawlingModule = async (): Promise<void> => {
  if (container) {
    await container.close();
    container = null;
    console.log('✅ 크롤링 모듈 종료 완료');
  }
};

// 타입 및 클래스 export
export * from './types';
export { Container } from './utils/container';

