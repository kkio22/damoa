/**
 * 서버 진입점
 */

import dotenv from 'dotenv';
import App from './app';
import { shutdownCrawlingModule } from './domain/crawling';

// 환경변수 로드
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');

/**
 * 서버 시작
 */
const startServer = async () => {
  try {
    const app = new App();
    await app.initializeRoutes();
    app.listen(PORT);

  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 */
const shutdown = async () => {
  console.log('\n⏳ 서버 종료 중...');
  
  try {
    await shutdownCrawlingModule();
    console.log('✅ 서버 종료 완료');
    process.exit(0);
  } catch (error) {
    console.error('❌ 서버 종료 실패:', error);
    process.exit(1);
  }
};

// 시그널 핸들러
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// 에러 핸들러
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown();
});

// 서버 시작
startServer();

