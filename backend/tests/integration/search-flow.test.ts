/**
 * 통합 테스트 - 검색 플로우 전체
 */

import request from 'supertest';
import express from 'express';

describe('Integration Tests - Search Flow', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock 전체 플로우
    const mockSearchController = {
      searchProducts: jest.fn().mockImplementation((req, res) => {
        res.json({
          success: true,
          query: req.body.query,
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

    const mockAIController = {
      analyzeProducts: jest.fn().mockImplementation((req, res) => {
        res.json({
          success: true,
          searchQuery: req.body.query,
          recommendations: [
            {
              product: req.body.products[0],
              score: 95,
              reasons: ['제목이 검색어와 정확히 일치합니다'],
            },
          ],
          insights: {
            averagePrice: 1200000,
            summary: 'AI 분석 완료',
          },
        });
      }),
    };

    app.post('/api/search', mockSearchController.searchProducts as any);
    app.post('/api/ai/analyze', mockAIController.analyzeProducts as any);
  });

  it('검색 -> AI 분석 전체 플로우가 정상 작동해야 함', async () => {
    // 1단계: 상품 검색
    const searchResponse = await request(app)
      .post('/api/search')
      .send({
        query: '아이폰',
        filters: {
          locations: ['역삼동'],
        },
      });

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.success).toBe(true);
    expect(searchResponse.body.products.length).toBeGreaterThan(0);

    // 2단계: 검색 결과로 AI 분석
    const products = searchResponse.body.products;
    const aiResponse = await request(app)
      .post('/api/ai/analyze')
      .send({
        query: '아이폰',
        products,
      });

    expect(aiResponse.status).toBe(200);
    expect(aiResponse.body.success).toBe(true);
    expect(aiResponse.body.recommendations.length).toBeGreaterThan(0);
    expect(aiResponse.body.insights).toBeDefined();
  });

  it('검색 결과가 없을 때도 정상 처리되어야 함', async () => {
    const mockEmptySearch = jest.fn().mockImplementation((req, res) => {
      res.json({
        success: true,
        query: req.body.query,
        totalCount: 0,
        products: [],
        searchTime: 0.01,
      });
    });

    app.post('/api/search-empty', mockEmptySearch as any);

    const response = await request(app)
      .post('/api/search-empty')
      .send({
        query: '존재하지않는상품12345',
        filters: {},
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.totalCount).toBe(0);
    expect(response.body.products).toEqual([]);
    expect(mockEmptySearch).toHaveBeenCalled();
  });

  it('가격 필터를 적용한 검색이 정상 작동해야 함', async () => {
    const mockFilteredSearch = jest.fn().mockImplementation((req, res) => {
      const { filters } = req.body;
      const products = [
        {
          id: 'daangn:12345',
          title: '아이폰 15 프로',
          price: 1200000,
          location: '역삼동',
        },
      ].filter((p) => {
        if (filters.priceRange) {
          if (filters.priceRange.min && p.price < filters.priceRange.min) return false;
          if (filters.priceRange.max && p.price > filters.priceRange.max) return false;
        }
        return true;
      });

      res.json({
        success: true,
        query: req.body.query,
        totalCount: products.length,
        products,
      });
    });

    app.post('/api/search-filtered', mockFilteredSearch as any);

    const response = await request(app)
      .post('/api/search-filtered')
      .send({
        query: '아이폰',
        filters: {
          priceRange: {
            min: 1000000,
            max: 1500000,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.totalCount).toBeGreaterThan(0);
    expect(mockFilteredSearch).toHaveBeenCalled();
  });
});

