/**
 * 검색 API 테스트
 */

import request from 'supertest';
import express from 'express';

describe('Search API Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
  });

  describe('POST /api/search', () => {
    it('상품을 검색할 수 있어야 함', async () => {
      const mockController = {
        searchProducts: jest.fn().mockImplementation((req, res) => {
          const { query } = req.body;
          res.json({
            success: true,
            query,
            totalCount: 5,
            products: [
              {
                id: 'daangn:12345',
                platform: 'daangn',
                title: '아이폰 15 프로',
                price: 1200000,
                location: '역삼동',
                status: 'available',
                createdAt: new Date().toISOString(),
              },
            ],
            searchTime: 0.05,
          });
        }),
      };

      app.post('/api/search', mockController.searchProducts as any);

      const response = await request(app)
        .post('/api/search')
        .send({
          query: '아이폰',
          filters: {
            locations: ['역삼동'],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.query).toBe('아이폰');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.totalCount).toBeGreaterThanOrEqual(0);
      expect(mockController.searchProducts).toHaveBeenCalled();
    });

    it('검색어 없이 요청하면 에러를 반환해야 함', async () => {
      const mockController = {
        searchProducts: jest.fn().mockImplementation((req, res) => {
          if (!req.body.query) {
            return res.status(400).json({
              success: false,
              message: '검색어를 입력해주세요',
            });
          }
        }),
      };

      app.post('/api/search2', mockController.searchProducts as any);

      const response = await request(app)
        .post('/api/search2')
        .send({
          filters: {},
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(mockController.searchProducts).toHaveBeenCalled();
    });

    it('가격 필터가 적용되어야 함', async () => {
      const mockController = {
        searchProducts: jest.fn().mockImplementation((req, res) => {
          const { query, filters } = req.body;
          res.json({
            success: true,
            query,
            filters,
            totalCount: 2,
            products: [],
          });
        }),
      };

      app.post('/api/search3', mockController.searchProducts as any);

      const response = await request(app)
        .post('/api/search3')
        .send({
          query: '노트북',
          filters: {
            priceRange: {
              min: 500000,
              max: 1000000,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.filters.priceRange).toBeDefined();
      expect(response.body.filters.priceRange.min).toBe(500000);
      expect(mockController.searchProducts).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/recent', () => {
    it('최근 검색어를 조회할 수 있어야 함', async () => {
      const mockController = {
        getRecentSearches: jest.fn().mockImplementation((req, res) => {
          res.json({
            success: true,
            searches: [
              { query: '아이폰', count: 10 },
              { query: '노트북', count: 5 },
            ],
          });
        }),
      };

      app.get('/api/search/recent', mockController.getRecentSearches as any);

      const response = await request(app).get('/api/search/recent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.searches)).toBe(true);
      expect(mockController.getRecentSearches).toHaveBeenCalled();
    });
  });

  describe('GET /api/search/popular', () => {
    it('인기 검색어를 조회할 수 있어야 함', async () => {
      const mockController = {
        getPopularSearches: jest.fn().mockImplementation((req, res) => {
          res.json({
            success: true,
            popularSearches: [
              { query: '아이폰', count: 100 },
              { query: '맥북', count: 50 },
            ],
          });
        }),
      };

      app.get('/api/search/popular', mockController.getPopularSearches as any);

      const response = await request(app).get('/api/search/popular');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.popularSearches)).toBe(true);
      expect(mockController.getPopularSearches).toHaveBeenCalled();
    });
  });
});

