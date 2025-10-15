/**
 * SearchLog Repository
 * search_logs 테이블 관리 (PostgreSQL)
 */

import { Pool } from 'pg';
import { SearchLog } from '../types';

export class SearchLogRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 검색 로그 저장
   */
  async saveLog(log: Omit<SearchLog, 'id' | 'created_at'>): Promise<void> {
    const query = `
      INSERT INTO search_logs (
        query,
        filters,
        result_count,
        search_time,
        ai_analysis,
        user_ip,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [
      log.query,
      log.filters ? JSON.stringify(log.filters) : null,
      log.result_count,
      log.search_time,
      log.ai_analysis ? JSON.stringify(log.ai_analysis) : null,
      log.user_ip || null,
      log.user_agent || null,
    ];

    try {
      await this.pool.query(query, values);
      console.log(`✅ 검색 로그 저장 완료: "${log.query}"`);
    } catch (error) {
      console.error('❌ 검색 로그 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 최근 검색 로그 조회
   */
  async getRecentLogs(limit: number = 10): Promise<SearchLog[]> {
    const query = `
      SELECT * FROM search_logs
      ORDER BY created_at DESC
      LIMIT $1
    `;

    try {
      const result = await this.pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ 검색 로그 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 인기 검색어 조회
   */
  async getPopularSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
    const query = `
      SELECT query, COUNT(*) as count
      FROM search_logs
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT $1
    `;

    try {
      const result = await this.pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ 인기 검색어 조회 실패:', error);
      throw error;
    }
  }
}

