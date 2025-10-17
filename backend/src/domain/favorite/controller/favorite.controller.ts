/**
 * 즐겨찾기 Controller
 * 요청/응답 처리
 */

import { Request, Response } from 'express';
import { FavoriteService } from '../service/favorite.service';

export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  /**
   * POST /api/favorites
   * 즐겨찾기 추가
   */
  addFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '로그인이 필요합니다'
        });
        return;
      }

      const { product_id, product_data } = req.body;

      if (!product_id || !product_data) {
        res.status(400).json({
          success: false,
          message: '상품 정보가 필요합니다'
        });
        return;
      }

      const result = await this.favoriteService.addFavorite(userId, {
        product_id,
        product_data
      });

      res.status(201).json(result);

    } catch (error: any) {
      if (error.message === '이미 즐겨찾기한 상품입니다') {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message === '상품 정보가 올바르지 않습니다') {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      console.error('❌ 즐겨찾기 추가 실패:', error);
      res.status(500).json({
        success: false,
        message: '즐겨찾기 추가 중 오류가 발생했습니다'
      });
    }
  };

  /**
   * DELETE /api/favorites/:productId
   * 즐겨찾기 삭제
   */
  deleteFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '로그인이 필요합니다'
        });
        return;
      }

      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: '상품 ID가 필요합니다'
        });
        return;
      }

      const result = await this.favoriteService.deleteFavorite(userId, productId);

      res.json(result);

    } catch (error: any) {
      if (error.message === '즐겨찾기를 찾을 수 없습니다') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      console.error('❌ 즐겨찾기 삭제 실패:', error);
      res.status(500).json({
        success: false,
        message: '즐겨찾기 삭제 중 오류가 발생했습니다'
      });
    }
  };

  /**
   * GET /api/favorites
   * 즐겨찾기 목록 조회
   */
  getFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '로그인이 필요합니다'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.favoriteService.getFavorites(userId, page, limit);

      res.json(result);

    } catch (error) {
      console.error('❌ 즐겨찾기 목록 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '즐겨찾기 목록 조회 중 오류가 발생했습니다'
      });
    }
  };

  /**
   * GET /api/favorites/count/:productId
   * 상품의 즐겨찾기 수 조회
   */
  getFavoriteCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: '상품 ID가 필요합니다'
        });
        return;
      }

      const result = await this.favoriteService.getFavoriteCount(productId);

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ 즐겨찾기 수 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '즐겨찾기 수 조회 중 오류가 발생했습니다'
      });
    }
  };

  /**
   * POST /api/favorites/counts
   * 여러 상품의 즐겨찾기 수 일괄 조회
   */
  getFavoriteCounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { product_ids } = req.body;

      if (!Array.isArray(product_ids)) {
        res.status(400).json({
          success: false,
          message: '상품 ID 배열이 필요합니다'
        });
        return;
      }

      const result = await this.favoriteService.getFavoriteCounts(product_ids);

      res.json({
        success: true,
        counts: result
      });

    } catch (error) {
      console.error('❌ 즐겨찾기 수 일괄 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '즐겨찾기 수 조회 중 오류가 발생했습니다'
      });
    }
  };

  /**
   * GET /api/favorites/check/:productId
   * 즐겨찾기 여부 확인
   */
  checkFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.json({
          success: true,
          is_favorite: false
        });
        return;
      }

      const { productId } = req.params;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: '상품 ID가 필요합니다'
        });
        return;
      }

      const isFavorite = await this.favoriteService.isFavorite(userId, productId);

      res.json({
        success: true,
        is_favorite: isFavorite
      });

    } catch (error) {
      console.error('❌ 즐겨찾기 확인 실패:', error);
      res.status(500).json({
        success: false,
        message: '즐겨찾기 확인 중 오류가 발생했습니다'
      });
    }
  };
}

