/**
 * Crawling Log Repository
 * crawling_logs 테이블 관리 (PostgreSQL) - todolist 3일차
 */

import { Pool } from 'pg';
import { CrawlingLog } from '../types';

export class CrawlingLogRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 크롤링 시작 로그 생성
   */
  async startLog(platform: string): Promise<number> {
    const query = `
      INSERT INTO crawling_logs (
        platform,
        status,
        started_at
      ) VALUES ($1, $2, $3)
      RETURNING id
    `;

    try {
      const result = await this.pool.query(query, [
        platform,
        'running',
        new Date(),
      ]);
      
      const logId = result.rows[0].id;
      console.log(`✅ 크롤링 로그 시작 (ID: ${logId})`);
      return logId;
      
    } catch (error) {
      console.error('❌ 크롤링 로그 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 크롤링 완료 로그 업데이트
   */
  async completeLog(
    logId: number,
    totalProducts: number,
    newProducts: number,
    updatedProducts: number,
    errorCount: number,
    duration: number
  ): Promise<void> {
    const query = `
      UPDATE crawling_logs
      SET
        status = 'completed',
        total_products = $1,
        new_products = $2,
        updated_products = $3,
        error_count = $4,
        duration = $5,
        completed_at = $6
      WHERE id = $7
    `;

    try {
      await this.pool.query(query, [
        totalProducts,
        newProducts,
        updatedProducts,
        errorCount,
        duration,
        new Date(),
        logId,
      ]);
      
      console.log(`✅ 크롤링 로그 완료 (ID: ${logId})`);
      
    } catch (error) {
      console.error('❌ 크롤링 로그 완료 실패:', error);
      throw error;
    }
  }

  /**
   * 크롤링 실패 로그 업데이트
   */
  async failLog(logId: number, errorMessage: string, duration: number): Promise<void> {
    const query = `
      UPDATE crawling_logs
      SET
        status = 'failed',
        error_message = $1,
        duration = $2,
        completed_at = $3
      WHERE id = $4
    `;

    try {
      await this.pool.query(query, [
        errorMessage,
        duration,
        new Date(),
        logId,
      ]);
      
      console.log(`❌ 크롤링 로그 실패 (ID: ${logId})`);
      
    } catch (error) {
      console.error('❌ 크롤링 로그 실패 업데이트 실패:', error);
    }
  }

  /**
   * 최근 크롤링 로그 조회
   */
  async getRecentLogs(limit: number = 10): Promise<CrawlingLog[]> {
    const query = `
      SELECT * FROM crawling_logs
      ORDER BY started_at DESC
      LIMIT $1
    `;

    try {
      const result = await this.pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ 크롤링 로그 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 크롤링 통계 조회
   */
  async getStats(): Promise<{
    totalCrawlings: number;
    successRate: number;
    averageDuration: number;
    totalProducts: number;
  }> {
    const query = `
      SELECT
        COUNT(*) as total_crawlings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
        AVG(duration) as avg_duration,
        SUM(total_products) as total_products
      FROM crawling_logs
      WHERE started_at >= NOW() - INTERVAL '30 days'
    `;

    try {
      const result = await this.pool.query(query);
      const row = result.rows[0];
      
      return {
        totalCrawlings: parseInt(row.total_crawlings) || 0,
        successRate: row.total_crawlings > 0 
          ? Math.round((row.successful / row.total_crawlings) * 100)
          : 0,
        averageDuration: Math.round(parseFloat(row.avg_duration)) || 0,
        totalProducts: parseInt(row.total_products) || 0,
      };
    } catch (error) {
      console.error('❌ 크롤링 통계 조회 실패:', error);
      throw error;
    }
  }
}

