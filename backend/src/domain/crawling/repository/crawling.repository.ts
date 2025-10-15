/**
 * 크롤링 데이터 저장소 (Redis)
 * 지역별 상품 데이터를 Redis에 저장
 */

import { createClient } from 'redis';
import { Product } from '../types';

export class CrawlingRepository {
  private redisClient: ReturnType<typeof createClient>;
  private readonly TTL_24_HOURS = 60 * 60 * 24; // 24시간

  constructor(redisClient: ReturnType<typeof createClient>) {
    this.redisClient = redisClient;
  }

  /**
   * Redis 연결 확인
   */
  private async ensureConnection(): Promise<void> {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
  }

  /**
   * 지역별 상품 저장
   * Key: {지역명}:items
   * Value: [Product, Product, ...]
   */
  async saveProductsByLocation(location: string, products: Product[]): Promise<void> {
    await this.ensureConnection();

    const key = `${location}:items`;
    const value = JSON.stringify(products);

    await this.redisClient.setEx(key, this.TTL_24_HOURS, value);
    console.log(`✅ Redis 저장: ${key} - ${products.length}개 상품`);
  }

  /**
   * 지역별 상품 조회
   */
  async getProductsByLocation(location: string): Promise<Product[]> {
    await this.ensureConnection();

    const key = `${location}:items`;
    const data = await this.redisClient.get(key);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as Product[];
  }

  /**
   * 모든 지역의 상품 조회
   */
  async getAllProducts(): Promise<Product[]> {
    await this.ensureConnection();

    // *:items 패턴으로 모든 지역 키 찾기
    const keys = await this.redisClient.keys('*:items');
    const allProducts: Product[] = [];

    for (const key of keys) {
      const data = await this.redisClient.get(key);
      if (data) {
        const products = JSON.parse(data) as Product[];
        allProducts.push(...products);
      }
    }

    return allProducts;
  }

  /**
   * 특정 지역 데이터 삭제
   */
  async deleteProductsByLocation(location: string): Promise<void> {
    await this.ensureConnection();

    const key = `${location}:items`;
    await this.redisClient.del(key);
    console.log(`🗑️  Redis 삭제: ${key}`);
  }

  /**
   * 모든 상품 데이터 삭제
   */
  async clearAllProducts(): Promise<void> {
    await this.ensureConnection();

    const keys = await this.redisClient.keys('*:items');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
      console.log(`🗑️  Redis 삭제: ${keys.length}개 지역 데이터`);
    }
  }

  /**
   * Redis 통계
   */
  async getStats(): Promise<{
    totalLocations: number;
    totalProducts: number;
    locations: { [location: string]: number };
  }> {
    await this.ensureConnection();

    const keys = await this.redisClient.keys('*:items');
    const locations: { [location: string]: number } = {};
    let totalProducts = 0;

    for (const key of keys) {
      const location = key.replace(':items', '');
      const data = await this.redisClient.get(key);
      if (data) {
        const products = JSON.parse(data) as Product[];
        locations[location] = products.length;
        totalProducts += products.length;
      }
    }

    return {
      totalLocations: keys.length,
      totalProducts,
      locations,
    };
  }

  /**
   * Redis 데이터 백업 (todolist 3일차)
   * 모든 *:items 키를 *:items:backup으로 복사
   */
  async backupAllData(): Promise<string[]> {
    await this.ensureConnection();

    const keys = await this.redisClient.keys('*:items');
    const backupKeys: string[] = [];

    for (const key of keys) {
      const backupKey = `${key}:backup`;
      const data = await this.redisClient.get(key);
      
      if (data) {
        await this.redisClient.setEx(backupKey, this.TTL_24_HOURS, data);
        backupKeys.push(backupKey);
      }
    }

    console.log(`✅ Redis 백업: ${backupKeys.length}개 키`);
    return backupKeys;
  }

  /**
   * 백업에서 복원 (todolist 3일차)
   */
  async restoreFromBackup(): Promise<void> {
    await this.ensureConnection();

    const backupKeys = await this.redisClient.keys('*:items:backup');

    for (const backupKey of backupKeys) {
      const originalKey = backupKey.replace(':backup', '');
      const data = await this.redisClient.get(backupKey);
      
      if (data) {
        await this.redisClient.setEx(originalKey, this.TTL_24_HOURS, data);
      }
    }

    console.log(`✅ Redis 복원: ${backupKeys.length}개 키`);
  }

  /**
   * 백업 데이터 삭제 (todolist 3일차)
   */
  async deleteBackupData(): Promise<void> {
    await this.ensureConnection();

    const backupKeys = await this.redisClient.keys('*:items:backup');
    if (backupKeys.length > 0) {
      await this.redisClient.del(backupKeys);
      console.log(`🗑️  백업 데이터 삭제: ${backupKeys.length}개 키`);
    }
  }
}

