/**
 * 크롤링 컨트롤러
 * Postman에서 트리거하는 API 제공
 */

import { Request, Response } from 'express';
import { CrawlingService } from '../service/crawling.service';

export class CrawlingController {
  private crawlingService: CrawlingService;

  constructor(crawlingService: CrawlingService) {
    this.crawlingService = crawlingService;
  }

  /**
   * 크롤링 트리거 (POST /api/crawling/trigger)
   * Postman에서 호출 - 크롤링 완료 후 응답
   */
  triggerCrawling = async (req: Request, res: Response): Promise<void> => {
    try {
      const { locations } = req.body;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`📡 크롤링 트리거 수신`);
      console.log(`⏰ 시작 시간: ${new Date().toISOString()}`);
      
      if (locations && Array.isArray(locations) && locations.length > 0) {
        console.log(`📍 대상 지역: ${locations.join(', ')}`);
      } else {
        console.log(`📍 대상 지역: 전체`);
      }
      console.log(`${'='.repeat(60)}\n`);

      console.log(`🚀 crawlDaangn() 호출 시작...`);
      // 크롤링 실행 (완료될 때까지 대기)
      const result = await this.crawlingService.crawlDaangn(locations);
      console.log(`✅ crawlDaangn() 완료!`);

      // 완료 후 응답 반환
      res.status(200).json({
        success: true,
        message: '크롤링이 완료되었습니다',
        data: {
          totalProducts: result.totalProducts,
          locations: result.locations,
          duration: result.duration,
        },
      });
      console.log(`✅ 응답 전송 완료!\n`);

    } catch (error) {
      console.error('\n❌❌❌ 크롤링 실행 오류 ❌❌❌');
      console.error('Error:', error);
      if (error instanceof Error) {
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
      }
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      });
      console.error(`❌ 에러 응답 전송 완료\n`);
    }
  };


  /**
   * Redis 통계 조회 (GET /api/crawling/stats)
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.crawlingService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });

    } catch (error) {
      console.error('❌ 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      });
    }
  };

  /**
   * 전체 상품 조회 (GET /api/crawling/products)
   */
  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.crawlingService.getAllProducts();

      res.status(200).json({
        success: true,
        totalCount: products.length,
        products: products,
      });

    } catch (error) {
      console.error('❌ 상품 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      });
    }
  };

  /**
   * 지역별 상품 조회 (GET /api/crawling/products/:location)
   */
  getProductsByLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { location } = req.params;
      const products = await this.crawlingService.getProductsByLocation(location);

      res.status(200).json({
        success: true,
        location: location,
        totalCount: products.length,
        products: products,
      });

    } catch (error) {
      console.error('❌ 지역별 상품 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      });
    }
  };
}

