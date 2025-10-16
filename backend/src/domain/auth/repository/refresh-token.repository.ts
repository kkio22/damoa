/**
 * Refresh Token Repository
 * PostgreSQL에서 Refresh Token 관리
 */

import { Pool } from 'pg';
import { RefreshToken } from '../types';

export class RefreshTokenRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Refresh Token 저장
   */
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, user_id, token, expires_at, created_at, revoked_at, replaced_by_token
    `;

    try {
      const result = await this.pool.query(query, [userId, token, expiresAt]);
      return result.rows[0] as RefreshToken;
    } catch (error) {
      console.error('Refresh Token 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 토큰으로 Refresh Token 찾기
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    const query = `
      SELECT id, user_id, token, expires_at, created_at, revoked_at, replaced_by_token
      FROM refresh_tokens
      WHERE token = $1 AND revoked_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [token]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0] as RefreshToken;
    } catch (error) {
      console.error('Refresh Token 조회 실패:', error);
      throw error;
    }
  }

  /**
   * Refresh Token 폐기 (Revoke)
   */
  async revoke(token: string, replacedByToken?: string): Promise<boolean> {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW(), replaced_by_token = $2
      WHERE token = $1 AND revoked_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [token, replacedByToken || null]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Refresh Token 폐기 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자의 모든 Refresh Token 폐기 (로그아웃 전체 디바이스)
   */
  async revokeAllByUserId(userId: string): Promise<number> {
    const query = `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = $1 AND revoked_at IS NULL
    `;

    try {
      const result = await this.pool.query(query, [userId]);
      return result.rowCount || 0;
    } catch (error) {
      console.error('사용자 Refresh Token 전체 폐기 실패:', error);
      throw error;
    }
  }

  /**
   * 만료된 Refresh Token 정리 (주기적 실행)
   */
  async deleteExpired(): Promise<number> {
    const query = `
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW() OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '7 days')
    `;

    try {
      const result = await this.pool.query(query);
      return result.rowCount || 0;
    } catch (error) {
      console.error('만료된 Refresh Token 정리 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자의 활성 Refresh Token 개수
   */
  async countActiveByUserId(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM refresh_tokens
      WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
    `;

    try {
      const result = await this.pool.query(query, [userId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('활성 Refresh Token 개수 조회 실패:', error);
      throw error;
    }
  }
}

