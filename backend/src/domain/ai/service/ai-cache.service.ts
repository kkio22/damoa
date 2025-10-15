/**
 * AI 캐시 서비스 (Redis) - todolist 3일차
 * AI 분석 결과 캐싱
 */

import { createClient } from 'redis';
import { AIAnalyzeResponse } from '../types';

export class AICacheService {
  private redisClient: ReturnType<typeof createClient>;
  private readonly TTL_1_HOUR = 60 * 60; // 1시간
  private readonly CACHE_PREFIX = 'ai:analysis:';

  constructor(redisClient: ReturnType<typeof createClient>) {
    this.redisClient = redisClient;
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(query: string, productCount: number): string {
    const normalized = query.toLowerCase().trim();
    return `${this.CACHE_PREFIX}${normalized}:${productCount}`;
  }

  /**
   * 캐시에서 조회
   */
  async get(query: string, productCount: number): Promise<AIAnalyzeResponse | null> {
    try {
      const key = this.generateCacheKey(query, productCount);
      const data = await this.redisClient.get(key);

      if (data) {
        console.log(`✅ AI 캐시 히트: "${query}"`);
        return JSON.parse(data) as AIAnalyzeResponse;
      }

      console.log(`❌ AI 캐시 미스: "${query}"`);
      return null;

    } catch (error) {
      console.error('AI 캐시 조회 실패:', error);
      return null;
    }
  }

  /**
   * 캐시에 저장
   */
  async set(query: string, productCount: number, result: AIAnalyzeResponse): Promise<void> {
    try {
      const key = this.generateCacheKey(query, productCount);
      await this.redisClient.setEx(
        key,
        this.TTL_1_HOUR,
        JSON.stringify(result)
      );

      console.log(`✅ AI 캐시 저장: "${query}" (TTL: ${this.TTL_1_HOUR}초)`);

    } catch (error) {
      console.error('AI 캐시 저장 실패:', error);
    }
  }

  /**
   * 캐시 삭제
   */
  async delete(query: string, productCount: number): Promise<void> {
    try {
      const key = this.generateCacheKey(query, productCount);
      await this.redisClient.del(key);

      console.log(`🗑️  AI 캐시 삭제: "${query}"`);

    } catch (error) {
      console.error('AI 캐시 삭제 실패:', error);
    }
  }

  /**
   * 모든 AI 캐시 삭제
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await this.redisClient.keys(`${this.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        console.log(`🗑️  AI 캐시 전체 삭제: ${keys.length}개`);
      }
    } catch (error) {
      console.error('AI 캐시 전체 삭제 실패:', error);
    }
  }

  /**
   * 캐시 통계
   */
  async getStats(): Promise<{
    totalCached: number;
    cacheKeys: string[];
  }> {
    try {
      const keys = await this.redisClient.keys(`${this.CACHE_PREFIX}*`);
      
      return {
        totalCached: keys.length,
        cacheKeys: keys.map(k => k.replace(this.CACHE_PREFIX, '')),
      };

    } catch (error) {
      console.error('AI 캐시 통계 조회 실패:', error);
      return {
        totalCached: 0,
        cacheKeys: [],
      };
    }
  }
}

