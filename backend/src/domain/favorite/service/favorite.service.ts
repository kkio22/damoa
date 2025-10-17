/**
 * 즐겨찾기 Service
 * 비즈니스 로직 처리
 */

import { FavoriteRepository } from '../repository/favorite.repository';
import {
  AddFavoriteRequest,
  FavoriteResponse,
  FavoriteListResponse,
  AddFavoriteResponse,
  DeleteFavoriteResponse,
  FavoriteCountResponse,
  ProductData
} from '../types';

export class FavoriteService {
  constructor(private favoriteRepo: FavoriteRepository) {}

  /**
   * 즐겨찾기 추가
   */
  async addFavorite(userId: string, request: AddFavoriteRequest): Promise<AddFavoriteResponse> {
    try {
      // 입력 검증
      this.validateProductData(request.product_data);

      // 즐겨찾기 추가
      const favorite = await this.favoriteRepo.addFavorite(
        userId,
        request.product_id,
        request.product_data
      );

      // 즐겨찾기 수 조회
      const favoriteCount = await this.favoriteRepo.getProductFavoriteCount(request.product_id);

      return {
        success: true,
        message: '즐겨찾기에 추가되었습니다',
        favorite: {
          id: favorite.id,
          product_id: favorite.product_id,
          product_data: favorite.product_data,
          favorite_count: favoriteCount,
          created_at: favorite.created_at
        }
      };

    } catch (error: any) {
      if (error.message === '이미 즐겨찾기한 상품입니다') {
        throw error;
      }
      throw new Error('즐겨찾기 추가 중 오류가 발생했습니다');
    }
  }

  /**
   * 즐겨찾기 삭제
   */
  async deleteFavorite(userId: string, productId: string): Promise<DeleteFavoriteResponse> {
    const deleted = await this.favoriteRepo.deleteFavorite(userId, productId);

    if (!deleted) {
      throw new Error('즐겨찾기를 찾을 수 없습니다');
    }

    return {
      success: true,
      message: '즐겨찾기가 삭제되었습니다'
    };
  }

  /**
   * 즐겨찾기 목록 조회
   */
  async getFavorites(userId: string, page: number = 1, limit: number = 20): Promise<FavoriteListResponse> {
    const offset = (page - 1) * limit;

    // 즐겨찾기 목록 조회
    const favorites = await this.favoriteRepo.getFavoritesByUserId(userId, limit, offset);

    // 총 개수 조회
    const total = await this.favoriteRepo.getFavoritesCount(userId);

    // 각 상품의 즐겨찾기 수 조회
    const productIds = favorites.map(f => f.product_id);
    const favoriteCounts = await this.favoriteRepo.getProductsFavoriteCount(productIds);

    const favoriteResponses: FavoriteResponse[] = favorites.map(favorite => ({
      id: favorite.id,
      product_id: favorite.product_id,
      product_data: favorite.product_data,
      favorite_count: favoriteCounts.get(favorite.product_id) || 0,
      created_at: favorite.created_at
    }));

    return {
      success: true,
      favorites: favoriteResponses,
      total
    };
  }

  /**
   * 상품의 즐겨찾기 수 조회
   */
  async getFavoriteCount(productId: string): Promise<FavoriteCountResponse> {
    const count = await this.favoriteRepo.getProductFavoriteCount(productId);

    return {
      product_id: productId,
      count
    };
  }

  /**
   * 여러 상품의 즐겨찾기 수 조회
   */
  async getFavoriteCounts(productIds: string[]): Promise<FavoriteCountResponse[]> {
    const counts = await this.favoriteRepo.getProductsFavoriteCount(productIds);

    return productIds.map(productId => ({
      product_id: productId,
      count: counts.get(productId) || 0
    }));
  }

  /**
   * 사용자가 특정 상품을 즐겨찾기했는지 확인
   */
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    return await this.favoriteRepo.isFavorite(userId, productId);
  }

  /**
   * 여러 상품에 대한 즐겨찾기 여부 확인
   */
  async areFavorites(userId: string, productIds: string[]): Promise<Map<string, boolean>> {
    const favoriteSet = await this.favoriteRepo.areFavorites(userId, productIds);

    const result = new Map<string, boolean>();
    productIds.forEach(productId => {
      result.set(productId, favoriteSet.has(productId));
    });

    return result;
  }

  /**
   * 상품 데이터 검증
   */
  private validateProductData(productData: ProductData): void {
    if (!productData.id || !productData.title || !productData.price || !productData.url || !productData.platform) {
      throw new Error('상품 정보가 올바르지 않습니다');
    }
  }
}

