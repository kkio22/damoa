/**
 * 크롤링 스케줄러 (todolist 3일차)
 * Node-cron을 사용한 자동 크롤링 스케줄링
 */

import * as cron from 'node-cron';
import { CrawlingService } from '../service/crawling.service';

export class CrawlingScheduler {
  private crawlingService: CrawlingService;
  private tasks: cron.ScheduledTask[] = [];

  constructor(crawlingService: CrawlingService) {
    this.crawlingService = crawlingService;
  }

  /**
   * 매일 자정 크롤링 (todolist 3일차)
   * Cron 표현식: '0 0 * * *' (매일 00:00)
   */
  scheduleDailyCrawling(): void {
    const task = cron.schedule('0 0 * * *', async () => {
      console.log('\n⏰ 스케줄링된 크롤링 시작 (매일 자정)');
      console.log(`현재 시간: ${new Date().toISOString()}`);

      try {
        // 로그 + 백업이 포함된 크롤링 실행
        const result = await this.crawlingService.crawlDaangnWithBackup();
        
        console.log('\n✅ 스케줄링된 크롤링 완료!');
        console.log(`   - 총 상품: ${result.totalProducts}개`);
        console.log(`   - 소요 시간: ${result.duration}초\n`);

      } catch (error) {
        console.error('\n❌ 스케줄링된 크롤링 실패:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul',
    });

    this.tasks.push(task);
    console.log('✅ 크롤링 스케줄러 등록: 매일 자정 (Asia/Seoul)');
  }

  /**
   * 매 4시간마다 크롤링 (옵션)
   * Cron 표현식: 0시, 4시, 8시, 12시, 16시, 20시
   */
  scheduleEvery4Hours(): void {
    const task = cron.schedule('0 */4 * * *', async () => {
      console.log('\n⏰ 스케줄링된 크롤링 시작 (4시간마다)');
      console.log(`현재 시간: ${new Date().toISOString()}`);

      try {
        const result = await this.crawlingService.crawlDaangnWithLogging();
        
        console.log('\n✅ 스케줄링된 크롤링 완료!');
        console.log(`   - 총 상품: ${result.totalProducts}개\n`);

      } catch (error) {
        console.error('\n❌ 스케줄링된 크롤링 실패:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul',
    });

    this.tasks.push(task);
    console.log('✅ 크롤링 스케줄러 등록: 4시간마다 (Asia/Seoul)');
  }

  /**
   * 테스트용: 매 1분마다 크롤링 (개발 환경)
   */
  scheduleEveryMinute(): void {
    const task = cron.schedule('*/1 * * * *', async () => {
      console.log('\n⏰ [테스트] 스케줄링된 크롤링 시작 (1분마다)');
      console.log(`현재 시간: ${new Date().toISOString()}`);

      try {
        const result = await this.crawlingService.crawlDaangnWithLogging();
        
        console.log('\n✅ [테스트] 스케줄링된 크롤링 완료!');
        console.log(`   - 총 상품: ${result.totalProducts}개\n`);

      } catch (error) {
        console.error('\n❌ [테스트] 스케줄링된 크롤링 실패:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul',
    });

    this.tasks.push(task);
    console.log('✅ [테스트] 크롤링 스케줄러 등록: 1분마다 (Asia/Seoul)');
  }

  /**
   * 모든 스케줄러 시작
   */
  startAll(): void {
    this.tasks.forEach(task => task.start());
    console.log(`\n🚀 ${this.tasks.length}개 크롤링 스케줄러 시작!\n`);
  }

  /**
   * 모든 스케줄러 중지
   */
  stopAll(): void {
    this.tasks.forEach(task => task.stop());
    console.log(`\n⏸️  ${this.tasks.length}개 크롤링 스케줄러 중지!\n`);
  }

  /**
   * 현재 등록된 스케줄러 정보
   */
  getSchedulerInfo(): { count: number; running: boolean } {
    return {
      count: this.tasks.length,
      running: this.tasks.length > 0,
    };
  }
}

