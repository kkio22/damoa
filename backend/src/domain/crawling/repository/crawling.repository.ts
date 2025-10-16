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
   * 플랫폼별 상품 저장
   * Key: {platform}:items
   * Value: [Product, Product, ...]
   */
  async saveProductsByPlatform(platform: string, products: Product[]): Promise<void> {
    await this.ensureConnection();

    const key = `${platform}:items`;
    const value = JSON.stringify(products);

    await this.redisClient.setEx(key, this.TTL_24_HOURS, value);
    console.log(`✅ Redis 저장: ${key} - ${products.length}개 상품`);
  }

  /**
   * 플랫폼별 상품 조회
   */
  async getProductsByPlatform(platform: string): Promise<Product[]> {
    await this.ensureConnection();

    const key = `${platform}:items`;
    const data = await this.redisClient.get(key);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as Product[];
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
   * 모든 플랫폼의 상품 조회
   */
  async getAllProducts(): Promise<Product[]> {
    await this.ensureConnection();

    // *:items 패턴으로 모든 플랫폼 키 찾기 (daangn:items, bungae:items 등)
    const keys = await this.redisClient.keys('*:items');
    const allProducts: Product[] = [];

    for (const key of keys) {
      // backup 키는 제외
      if (key.includes(':backup')) continue;
      
      const data = await this.redisClient.get(key);
      if (data) {
        const products = JSON.parse(data) as Product[];
        allProducts.push(...products);
      }
    }

    return allProducts;
  }

  /**
   * 특정 플랫폼 데이터 삭제
   */
  async deleteProductsByPlatform(platform: string): Promise<void> {
    await this.ensureConnection();

    const key = `${platform}:items`;
    await this.redisClient.del(key);
    console.log(`🗑️  Redis 삭제: ${key}`);
  }

  /**
   * 특정 지역 데이터 삭제 (하위 호환성)
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
    // backup 키는 제외
    const dataKeys = keys.filter(key => !key.includes(':backup'));
    
    if (dataKeys.length > 0) {
      await this.redisClient.del(dataKeys);
      console.log(`🗑️  Redis 삭제: ${dataKeys.length}개 플랫폼 데이터`);
    }
  }

  /**
   * Redis 통계
   */
  async getStats(): Promise<{
    totalPlatforms: number;
    totalProducts: number;
    platforms: { [platform: string]: number };
  }> {
    await this.ensureConnection();

    const keys = await this.redisClient.keys('*:items');
    // backup 키 제외
    const dataKeys = keys.filter(key => !key.includes(':backup'));
    const platforms: { [platform: string]: number } = {};
    let totalProducts = 0;

    for (const key of dataKeys) {
      const platform = key.replace(':items', '');
      const data = await this.redisClient.get(key);
      if (data) {
        const products = JSON.parse(data) as Product[];
        platforms[platform] = products.length;
        totalProducts += products.length;
      }
    }

    return {
      totalPlatforms: dataKeys.length,
      totalProducts,
      platforms,
    };
  }

  /**
   * Redis 데이터 백업 (todolist 3일차)
   * 모든 *:items 키를 *:items:backup으로 복사
   */
  async backupAllData(): Promise<string[]> {
    await this.ensureConnection();

    const keys = await this.redisClient.keys('*:items');
    // 이미 백업 키는 제외
    const dataKeys = keys.filter(key => !key.includes(':backup'));
    const backupKeys: string[] = [];

    for (const key of dataKeys) {
      const backupKey = `${key}:backup`;
      const data = await this.redisClient.get(key);
      
      if (data) {
        await this.redisClient.setEx(backupKey, this.TTL_24_HOURS, data);
        backupKeys.push(backupKey);
      }
    }

    console.log(`✅ Redis 백업: ${backupKeys.length}개 플랫폼 키`);
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

