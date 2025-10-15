/**
 * 테스트 환경 설정
 */

// 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'smarttrade_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.ENABLE_CRAWLER_SCHEDULER = 'false'; // 테스트 시 스케줄러 비활성화

// 타임아웃 설정
jest.setTimeout(30000);

// 전역 테스트 후처리
afterAll(async () => {
  // 필요시 리소스 정리
  await new Promise(resolve => setTimeout(resolve, 500));
});

