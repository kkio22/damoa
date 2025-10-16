/**
 * AI 캐시 서비스 (Redis) - 개선 버전
 * AI 분석 결과 + 벡터 임베딩 캐싱
 */

import { createClient } from 'redis';
import { AIAnalyzeResponse, VectorEmbedding } from '../types';

export class AICacheService {
  private redisClient: ReturnType<typeof createClient>;
  private readonly TTL_1_HOUR = 60 * 60; // 1시간
  private readonly TTL_24_HOURS = 60 * 60 * 24; // 24시간
  private readonly CACHE_PREFIX = 'ai:analysis:';
  private readonly VECTOR_PREFIX = 'ai:vector:';
  private readonly POPULAR_PREFIX = 'ai:popular:';  // 인기 검색어

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

  /**
   * ===== 벡터 임베딩 캐싱 =====
   */

  /**
   * 벡터 임베딩 캐시에 저장
   */
  async setVector(productId: string, embedding: VectorEmbedding): Promise<void> {
    try {
      const key = `${this.VECTOR_PREFIX}${productId}`;
      await this.redisClient.setEx(
        key,
        this.TTL_24_HOURS,  // 24시간 캐시 (벡터는 오래 유지)
        JSON.stringify(embedding)
      );

      console.log(`✅ 벡터 캐시 저장: ${productId}`);
    } catch (error) {
      console.error('벡터 캐시 저장 실패:', error);
    }
  }

  /**
   * 벡터 임베딩 캐시에서 조회
   */
  async getVector(productId: string): Promise<VectorEmbedding | null> {
    try {
      const key = `${this.VECTOR_PREFIX}${productId}`;
      const data = await this.redisClient.get(key);

      if (data) {
        return JSON.parse(data) as VectorEmbedding;
      }

      return null;
    } catch (error) {
      console.error('벡터 캐시 조회 실패:', error);
      return null;
    }
  }

  /**
   * 여러 상품의 벡터 임베딩 배치 저장
   */
  async setVectorBatch(embeddings: VectorEmbedding[]): Promise<void> {
    try {
      const pipeline = this.redisClient.multi();

      embeddings.forEach(embedding => {
        const key = `${this.VECTOR_PREFIX}${embedding.productId}`;
        pipeline.setEx(key, this.TTL_24_HOURS, JSON.stringify(embedding));
      });

      await pipeline.exec();

      console.log(`✅ 벡터 배치 캐시 저장: ${embeddings.length}개`);
    } catch (error) {
      console.error('벡터 배치 캐시 저장 실패:', error);
    }
  }

  /**
   * ===== 인기 검색어 관리 =====
   */

  /**
   * 검색어 카운트 증가
   */
  async incrementSearchCount(query: string): Promise<void> {
    try {
      const normalized = query.toLowerCase().trim();
      const key = `${this.POPULAR_PREFIX}count`;
      
      await this.redisClient.zIncrBy(key, 1, normalized);

      console.log(`✅ 검색어 카운트 증가: "${query}"`);
    } catch (error) {
      console.error('검색어 카운트 증가 실패:', error);
    }
  }

  /**
   * 인기 검색어 TOP N 조회
   */
  async getPopularQueries(topN: number = 10): Promise<Array<{ query: string; count: number }>> {
    try {
      const key = `${this.POPULAR_PREFIX}count`;
      
      // 점수 높은 순으로 조회
      const results = await this.redisClient.zRangeWithScores(key, 0, topN - 1, {
        REV: true,  // 내림차순
      });

      return results.map(item => ({
        query: item.value,
        count: Math.round(item.score),
      }));
    } catch (error) {
      console.error('인기 검색어 조회 실패:', error);
      return [];
    }
  }

  /**
   * ===== 성능 최적화 =====
   */

  /**
   * 캐시 히트율 계산
   */
  async getCacheHitRate(): Promise<{
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    try {
      const hitsKey = 'ai:cache:hits';
      const missesKey = 'ai:cache:misses';

      const hits = parseInt(await this.redisClient.get(hitsKey) || '0');
      const misses = parseInt(await this.redisClient.get(missesKey) || '0');
      const total = hits + misses;

      return {
        hits,
        misses,
        hitRate: total > 0 ? hits / total : 0,
      };
    } catch (error) {
      console.error('캐시 히트율 계산 실패:', error);
      return { hits: 0, misses: 0, hitRate: 0 };
    }
  }

  /**
   * 캐시 히트 기록
   */
  async recordCacheHit(): Promise<void> {
    try {
      await this.redisClient.incr('ai:cache:hits');
    } catch (error) {
      console.error('캐시 히트 기록 실패:', error);
    }
  }

  /**
   * 캐시 미스 기록
   */
  async recordCacheMiss(): Promise<void> {
    try {
      await this.redisClient.incr('ai:cache:misses');
    } catch (error) {
      console.error('캐시 미스 기록 실패:', error);
    }
  }

  /**
   * 벡터 캐시 삭제
   */
  async clearVectorCache(): Promise<void> {
    try {
      const keys = await this.redisClient.keys(`${this.VECTOR_PREFIX}*`);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        console.log(`🗑️  벡터 캐시 삭제: ${keys.length}개`);
      }
    } catch (error) {
      console.error('벡터 캐시 삭제 실패:', error);
    }
  }
}

