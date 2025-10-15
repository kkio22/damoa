/**
 * 검색 컨트롤러
 * POST /api/search (todolist 2일차)
 */

import { Request, Response } from 'express';
import { SearchService } from '../service/search.service';
import { SearchRequest } from '../types';

export class SearchController {
  private searchService: SearchService;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  /**
   * 상품 검색 (POST /api/search)
   */
  searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchRequest: SearchRequest = {
        query: req.body.query || '',
        filters: req.body.filters,
      };

      // 유효성 검사
      if (!searchRequest.query || searchRequest.query.trim() === '') {
        res.status(400).json({
          success: false,
          message: '검색어를 입력해주세요',
        });
        return;
      }

      // 클라이언트 정보
      const userIp = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');

      console.log(`\n🔍 검색 요청: "${searchRequest.query}"`);
      console.log(`📍 필터:`, searchRequest.filters || '없음');

      // 검색 실행
      const result = await this.searchService.searchProducts(
        searchRequest,
        userIp,
        userAgent
      );

      console.log(`✅ 검색 완료: ${result.totalCount}개 결과\n`);

      res.status(200).json(result);

    } catch (error) {
      console.error('❌ 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다',
      });
    }
  };

  /**
   * 최근 검색 로그 조회 (GET /api/search/recent)
   */
  getRecentSearches = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await this.searchService.getRecentSearches(limit);

      res.status(200).json({
        success: true,
        totalCount: logs.length,
        logs,
      });

    } catch (error) {
      console.error('❌ 최근 검색 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '조회 중 오류가 발생했습니다',
      });
    }
  };

  /**
   * 인기 검색어 조회 (GET /api/search/popular)
   */
  getPopularSearches = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const searches = await this.searchService.getPopularSearches(limit);

      res.status(200).json({
        success: true,
        totalCount: searches.length,
        searches,
      });

    } catch (error) {
      console.error('❌ 인기 검색어 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '조회 중 오류가 발생했습니다',
      });
    }
  };
}

