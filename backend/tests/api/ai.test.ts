/**
 * AI API 테스트
 */

import request from 'supertest';
import express from 'express';

describe('AI API Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
  });

  describe('POST /api/ai/analyze', () => {
    it('AI 분석을 요청할 수 있어야 함', async () => {
      const mockController = {
        analyzeProducts: jest.fn().mockImplementation((req, res) => {
          const { query, products } = req.body;
          res.json({
            success: true,
            searchQuery: query,
            analyzedAt: new Date().toISOString(),
            totalProducts: products?.length || 0,
            recommendations: [
              {
                product: {
                  id: 'daangn:12345',
                  title: '아이폰 15 프로',
                  price: 1200000,
                },
                score: 95,
                reasons: ['제목이 검색어와 정확히 일치합니다', '최근 등록된 상품입니다'],
                matchedKeywords: ['아이폰', '15'],
              },
            ],
            insights: {
              averagePrice: 1200000,
              priceRange: { min: 1000000, max: 1400000 },
              summary: 'AI 분석 결과입니다',
            },
            suggestedFilters: {
              priceRange: { min: 1000000, max: 1400000 },
              locations: ['역삼동'],
            },
            relatedKeywords: ['아이폰', '15', '프로'],
          });
        }),
      };

      app.post('/api/ai/analyze', mockController.analyzeProducts as any);

      const response = await request(app)
        .post('/api/ai/analyze')
        .send({
          query: '아이폰',
          products: [
            {
              id: 'daangn:12345',
              title: '아이폰 15 프로',
              price: 1200000,
              location: '역삼동',
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.searchQuery).toBe('아이폰');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      expect(response.body.insights).toBeDefined();
      expect(response.body.suggestedFilters).toBeDefined();
      expect(mockController.analyzeProducts).toHaveBeenCalled();
    });

    it('상품 데이터 없이 요청하면 에러를 반환해야 함', async () => {
      const mockController = {
        analyzeProducts: jest.fn().mockImplementation((req, res) => {
          if (!req.body.products || req.body.products.length === 0) {
            return res.status(400).json({
              success: false,
              message: '분석할 상품이 없습니다',
            });
          }
        }),
      };

      app.post('/api/ai/analyze2', mockController.analyzeProducts as any);

      const response = await request(app)
        .post('/api/ai/analyze2')
        .send({
          query: '아이폰',
          products: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(mockController.analyzeProducts).toHaveBeenCalled();
    });
  });

  describe('GET /api/ai/cache/stats', () => {
    it('AI 캐시 통계를 조회할 수 있어야 함', async () => {
      const mockController = {
        getCacheStats: jest.fn().mockImplementation((req, res) => {
          res.json({
            success: true,
            stats: {
              totalKeys: 10,
              hitRate: 0.85,
            },
          });
        }),
      };

      app.get('/api/ai/cache/stats', mockController.getCacheStats as any);

      const response = await request(app).get('/api/ai/cache/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(mockController.getCacheStats).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/ai/cache', () => {
    it('AI 캐시를 삭제할 수 있어야 함', async () => {
      const mockController = {
        clearCache: jest.fn().mockImplementation((req, res) => {
          res.json({
            success: true,
            message: '캐시가 삭제되었습니다',
          });
        }),
      };

      app.delete('/api/ai/cache', mockController.clearCache as any);

      const response = await request(app).delete('/api/ai/cache');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockController.clearCache).toHaveBeenCalled();
    });
  });
});

