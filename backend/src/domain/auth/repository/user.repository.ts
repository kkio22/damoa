/**
 * 사용자 Repository
 * PostgreSQL에서 사용자 데이터 CRUD
 */

import { Pool } from 'pg';
import { User, UserResponse } from '../types';

export class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 이메일로 사용자 찾기 (로그인/중복 체크)
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, phone, password_hash, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    try {
      const result = await this.pool.query(query, [email]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0] as User;
    } catch (error) {
      console.error('이메일로 사용자 찾기 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 사용자 찾기
   */
  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, name, phone, password_hash, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0] as User;
    } catch (error) {
      console.error('ID로 사용자 찾기 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 생성 (회원가입)
   */
  async create(
    email: string,
    passwordHash: string,
    name: string,
    phone: string
  ): Promise<UserResponse> {
    const query = `
      INSERT INTO users (email, password_hash, name, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email, name, phone, created_at
    `;
    
    try {
      const result = await this.pool.query(query, [email, passwordHash, name, phone]);
      return result.rows[0] as UserResponse;
    } catch (error) {
      console.error('사용자 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  async update(
    id: string,
    updates: Partial<Pick<User, 'name' | 'phone'>>
  ): Promise<UserResponse | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name) {
      fields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }

    if (updates.phone) {
      fields.push(`phone = $${paramIndex}`);
      values.push(updates.phone);
      paramIndex++;
    }

    if (fields.length === 0) {
      const user = await this.findById(id);
      if (!user) return null;
      return this.toUserResponse(user);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, phone, created_at
    `;

    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0] as UserResponse;
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 삭제
   */
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM users WHERE id = $1`;
    
    try {
      const result = await this.pool.query(query, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * User -> UserResponse 변환 (비밀번호 제거)
   */
  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      created_at: user.created_at,
    };
  }
}

