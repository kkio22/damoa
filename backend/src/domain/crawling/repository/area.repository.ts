/**
 * 지역(동) 정보 PostgreSQL 저장소
 * 간단한 구조: id, name만 저장
 */

import { Pool } from 'pg';

export interface Area {
  id: string;          // 당근마켓 지역 ID (예: "6035")
  name: string;        // 동 이름 (예: "역삼동")
  createdAt?: Date;
}

export class AreaRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 지역 추가 (중복 방지)
   */
  async insert(area: Area): Promise<void> {
    const query = `
      INSERT INTO areas (id, name)
      VALUES ($1, $2)
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      await this.pool.query(query, [area.id, area.name]);
      console.log(`✅ 지역 추가: ${area.name} (ID: ${area.id})`);
    } catch (error) {
      console.error(`❌ 지역 추가 실패:`, error);
      throw error;
    }
  }

  /**
   * 여러 지역 일괄 추가
   */
  async bulkInsert(areas: Area[]): Promise<number> {
    if (areas.length === 0) {
      return 0;
    }

    let insertedCount = 0;

    for (const area of areas) {
      try {
        await this.insert(area);
        insertedCount++;
      } catch (error) {
        console.error(`❌ ${area.name} 추가 실패, 계속 진행...`);
      }
    }

    console.log(`✅ ${insertedCount}/${areas.length}개 지역 추가 완료`);
    return insertedCount;
  }

  /**
   * 전체 지역 조회
   */
  async getAll(): Promise<Area[]> {
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM areas
      ORDER BY name
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows as Area[];
    } catch (error) {
      console.error('❌ 지역 조회 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 지역 조회
   */
  async getById(id: string): Promise<Area | null> {
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM areas
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0 ? (result.rows[0] as Area) : null;
    } catch (error) {
      console.error('❌ 지역 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 이름으로 지역 조회
   */
  async getByName(name: string): Promise<Area | null> {
    const query = `
      SELECT id, name, created_at as "createdAt"
      FROM areas
      WHERE name = $1
    `;

    try {
      const result = await this.pool.query(query, [name]);
      return result.rows.length > 0 ? (result.rows[0] as Area) : null;
    } catch (error) {
      console.error('❌ 지역 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 지역 개수 조회
   */
  async count(): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM areas`;

    try {
      const result = await this.pool.query(query);
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error('❌ 개수 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 지역 삭제
   */
  async deleteById(id: string): Promise<boolean> {
    const query = `DELETE FROM areas WHERE id = $1`;

    try {
      const result = await this.pool.query(query, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('❌ 지역 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 전체 삭제
   */
  async deleteAll(): Promise<number> {
    const query = `DELETE FROM areas`;

    try {
      const result = await this.pool.query(query);
      const deletedCount = result.rowCount || 0;
      console.log(`✅ ${deletedCount}개 지역 삭제 완료`);
      return deletedCount;
    } catch (error) {
      console.error('❌ 전체 삭제 실패:', error);
      throw error;
    }
  }
}

