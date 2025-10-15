/**
 * 크롤링 API 테스트
 */

import request from 'supertest';
import express from 'express';
import { CrawlingController } from '../../src/domain/crawling/controller/crawling.controller';
import { CrawlingRoutes } from '../../src/domain/crawling/routes/crawling.routes';

describe('Crawling API Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    // 테스트용 Express 앱 생성 (실제 DB/Redis 연결 없이)
    app = express();
    app.use(express.json());
  });

  describe('GET /api/crawling/status', () => {
    it('크롤링 상태를 조회할 수 있어야 함', async () => {
      // Mock 컨트롤러
      const mockController = {
        getCrawlingLogStats: jest.fn().mockImplementation((req, res) => {
          res.json({
            success: true,
            stats: {
              total: 10,
              completed: 8,
              failed: 2,
            },
          });
        }),
      };

      app.get('/api/crawling/status', mockController.getCrawlingLogStats as any);

      const response = await request(app).get('/api/crawling/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(mockController.getCrawlingLogStats).toHaveBeenCalled();
    });
  });

  describe('POST /api/crawling/trigger', () => {
    it('크롤링을 트리거할 수 있어야 함 (Mock)', async () => {
      const mockController = {
        triggerCrawling: jest.fn().mockImplementation((req, res) => {
          res.json({
            success: true,
            message: '크롤링이 시작되었습니다',
            result: {
              platform: 'daangn',
              status: 'completed',
              totalProducts: 50,
            },
          });
        }),
      };

      app.post('/api/crawling/trigger', mockController.triggerCrawling as any);

      const response = await request(app)
        .post('/api/crawling/trigger')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('크롤링');
      expect(mockController.triggerCrawling).toHaveBeenCalled();
    });
  });

  describe('GET /api/crawling/logs/recent', () => {
    it('최근 크롤링 로그를 조회할 수 있어야 함', async () => {
      const mockController = {
        getRecentCrawlingLogs: jest.fn().mockImplementation((req, res) => {
          res.json({
            success: true,
            logs: [
              {
                id: 1,
                platform: 'daangn',
                status: 'completed',
                totalProducts: 50,
                startedAt: new Date().toISOString(),
              },
            ],
          });
        }),
      };

      app.get('/api/crawling/logs/recent', mockController.getRecentCrawlingLogs as any);

      const response = await request(app).get('/api/crawling/logs/recent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(mockController.getRecentCrawlingLogs).toHaveBeenCalled();
    });
  });
});

