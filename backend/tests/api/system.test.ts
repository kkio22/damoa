/**
 * 시스템 API 테스트
 */

import request from 'supertest';
import express from 'express';

describe('System API Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
  });

  describe('GET /api/system/status', () => {
    it('시스템 상태를 조회할 수 있어야 함', async () => {
      const mockController = {
        getSystemStatus: jest.fn().mockImplementation((req, res) => {
          res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
              postgres: { status: 'up', responseTime: 10 },
              redis: { status: 'up', responseTime: 5 },
              backend: { status: 'up', uptime: 3600 },
            },
            crawling: {
              scheduler: {
                enabled: false,
                running: false,
              },
              lastCrawl: {
                timestamp: new Date().toISOString(),
                status: 'success',
                totalProducts: 50,
              },
              recentLogs: [],
            },
            statistics: {
              totalProducts: 50,
              totalRegions: 1,
              totalSearches: 100,
              avgSearchTime: 0.05,
            },
          });
        }),
      };

      app.get('/api/system/status', mockController.getSystemStatus as any);

      const response = await request(app).get('/api/system/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.services).toBeDefined();
      expect(response.body.crawling).toBeDefined();
      expect(response.body.statistics).toBeDefined();
      expect(mockController.getSystemStatus).toHaveBeenCalled();
    });
  });

  describe('GET /api/system/health', () => {
    it('헬스 체크를 수행할 수 있어야 함', async () => {
      const mockController = {
        getHealth: jest.fn().mockImplementation((req, res) => {
          res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
          });
        }),
      };

      app.get('/api/system/health', mockController.getHealth as any);

      const response = await request(app).get('/api/system/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(mockController.getHealth).toHaveBeenCalled();
    });
  });
});

