/**
 * 즐겨찾기 Repository
 * 트랜잭션을 통한 동시성 제어
 */

import { Pool, PoolClient } from 'pg';
import { Favorite, ProductData } from '../types';

export class FavoriteRepository {
  constructor(private pool: Pool) {}

  /**
   * 즐겨찾기 추가 (트랜잭션 적용)
   */
  async addFavorite(userId: string, productId: string, productData: ProductData): Promise<Favorite> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. 이미 즐겨찾기한 상품인지 확인 (FOR UPDATE로 락 걸기)
      const checkQuery = `
        SELECT id FROM favorites 
        WHERE user_id = $1 AND product_id = $2
        FOR UPDATE
      `;
      const checkResult = await client.query(checkQuery, [userId, productId]);

      if (checkResult.rows.length > 0) {
        await client.query('ROLLBACK');
        throw new Error('이미 즐겨찾기한 상품입니다');
      }

      // 2. 즐겨찾기 추가
      const insertQuery = `
        INSERT INTO favorites (user_id, product_id, product_data)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await client.query(insertQuery, [
        userId,
        productId,
        JSON.stringify(productData)
      ]);

      await client.query('COMMIT');

      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        product_id: row.product_id,
        product_data: typeof row.product_data === 'string' ? JSON.parse(row.product_data) : row.product_data,
        created_at: row.created_at
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 즐겨찾기 삭제
   */
  async deleteFavorite(userId: string, productId: string): Promise<boolean> {
    const query = `
      DELETE FROM favorites 
      WHERE user_id = $1 AND product_id = $2
      RETURNING id
    `;
    
    const result = await this.pool.query(query, [userId, productId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 사용자의 즐겨찾기 목록 조회
   */
  async getFavoritesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Favorite[]> {
    const query = `
      SELECT * FROM favorites 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await this.pool.query(query, [userId, limit, offset]);
    
    return result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      product_id: row.product_id,
      product_data: typeof row.product_data === 'string' ? JSON.parse(row.product_data) : row.product_data,
      created_at: row.created_at
    }));
  }

  /**
   * 사용자의 즐겨찾기 총 개수
   */
  async getFavoritesCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM favorites 
      WHERE user_id = $1
    `;
    
    const result = await this.pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * 특정 상품의 즐겨찾기 수 (트랜잭션 적용)
   */
  async getProductFavoriteCount(productId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM favorites 
      WHERE product_id = $1
    `;
    
    const result = await this.pool.query(query, [productId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * 여러 상품의 즐겨찾기 수 일괄 조회 (성능 최적화)
   */
  async getProductsFavoriteCount(productIds: string[]): Promise<Map<string, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const query = `
      SELECT product_id, COUNT(*) as count 
      FROM favorites 
      WHERE product_id = ANY($1)
      GROUP BY product_id
    `;
    
    const result = await this.pool.query(query, [productIds]);
    
    const countMap = new Map<string, number>();
    result.rows.forEach(row => {
      countMap.set(row.product_id, parseInt(row.count));
    });
    
    return countMap;
  }

  /**
   * 사용자가 특정 상품을 즐겨찾기했는지 확인
   */
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const query = `
      SELECT id FROM favorites 
      WHERE user_id = $1 AND product_id = $2
    `;
    
    const result = await this.pool.query(query, [userId, productId]);
    return result.rows.length > 0;
  }

  /**
   * 여러 상품에 대한 즐겨찾기 여부 일괄 조회 (성능 최적화)
   */
  async areFavorites(userId: string, productIds: string[]): Promise<Set<string>> {
    if (productIds.length === 0) {
      return new Set();
    }

    const query = `
      SELECT product_id FROM favorites 
      WHERE user_id = $1 AND product_id = ANY($2)
    `;
    
    const result = await this.pool.query(query, [userId, productIds]);
    
    return new Set(result.rows.map(row => row.product_id));
  }
}

