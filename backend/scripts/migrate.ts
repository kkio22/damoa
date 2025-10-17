/**
 * 데이터베이스 마이그레이션 스크립트
 * PostgreSQL 테이블 생성
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'smarttrade',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

/**
 * areas 테이블 생성 (지역 정보)
 */
const createAreasTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS areas (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_areas_name ON areas(name);
  `;

  try {
    await pool.query(query);
    console.log('✅ areas 테이블 생성 완료');
  } catch (error) {
    console.error('❌ areas 테이블 생성 실패:', error);
    throw error;
  }
};

/**
 * crawling_logs 테이블 생성
 */
const createCrawlingLogsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS crawling_logs (
      id BIGSERIAL PRIMARY KEY,
      platform VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      total_products INTEGER DEFAULT 0,
      new_products INTEGER DEFAULT 0,
      updated_products INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      duration INTEGER,
      error_message TEXT,
      started_at TIMESTAMP NOT NULL,
      completed_at TIMESTAMP
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_crawling_logs_platform ON crawling_logs(platform);
    CREATE INDEX IF NOT EXISTS idx_crawling_logs_started_at ON crawling_logs(started_at);
    CREATE INDEX IF NOT EXISTS idx_crawling_logs_status ON crawling_logs(status);
    CREATE INDEX IF NOT EXISTS idx_crawling_logs_platform_time ON crawling_logs(platform, started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_crawling_logs_status_duration ON crawling_logs(status, duration);

    -- 체크 제약조건 추가
    ALTER TABLE crawling_logs 
      DROP CONSTRAINT IF EXISTS chk_total_products_positive,
      DROP CONSTRAINT IF EXISTS chk_new_products_positive,
      DROP CONSTRAINT IF EXISTS chk_duration_positive;

    ALTER TABLE crawling_logs 
      ADD CONSTRAINT chk_total_products_positive CHECK (total_products >= 0),
      ADD CONSTRAINT chk_new_products_positive CHECK (new_products >= 0),
      ADD CONSTRAINT chk_duration_positive CHECK (duration >= 0);
  `;

  try {
    await pool.query(query);
    console.log('✅ crawling_logs 테이블 생성 완료');
  } catch (error) {
    console.error('❌ crawling_logs 테이블 생성 실패:', error);
    throw error;
  }
};

/**
 * search_logs 테이블 생성
 */
const createSearchLogsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS search_logs (
      id BIGSERIAL PRIMARY KEY,
      query VARCHAR(500) NOT NULL,
      filters JSON,
      result_count INTEGER DEFAULT 0,
      search_time DECIMAL(5,2),
      ai_analysis JSON,
      user_ip VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
    CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_search_logs_result_count ON search_logs(result_count);
    CREATE INDEX IF NOT EXISTS idx_search_logs_query_time ON search_logs(query, created_at DESC);

    -- 체크 제약조건 추가
    ALTER TABLE search_logs 
      DROP CONSTRAINT IF EXISTS chk_result_count_positive,
      DROP CONSTRAINT IF EXISTS chk_search_time_positive;

    ALTER TABLE search_logs 
      ADD CONSTRAINT chk_result_count_positive CHECK (result_count >= 0),
      ADD CONSTRAINT chk_search_time_positive CHECK (search_time >= 0);
  `;

  try {
    await pool.query(query);
    console.log('✅ search_logs 테이블 생성 완료');
  } catch (error) {
    console.error('❌ search_logs 테이블 생성 실패:', error);
    throw error;
  }
};

/**
 * users 테이블 생성 (회원가입/로그인)
 */
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

    -- 이메일 형식 체크
    ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS chk_email_format;

    ALTER TABLE users 
      ADD CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
  `;

  try {
    await pool.query(query);
    console.log('✅ users 테이블 생성 완료');
  } catch (error) {
    console.error('❌ users 테이블 생성 실패:', error);
    throw error;
  }
};

/**
 * refresh_tokens 테이블 생성 (Refresh Token 관리)
 */
const createRefreshTokensTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      revoked_at TIMESTAMP,
      replaced_by_token VARCHAR(500)
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
  `;

  try {
    await pool.query(query);
    console.log('✅ refresh_tokens 테이블 생성 완료');
  } catch (error) {
    console.error('❌ refresh_tokens 테이블 생성 실패:', error);
    throw error;
  }
};

/**
 * favorites 테이블 생성 (즐겨찾기)
 */
const createFavoritesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS favorites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id VARCHAR(500) NOT NULL,
      product_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

    -- 중복 방지 (한 사용자가 같은 상품을 중복 즐겨찾기 불가)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique_user_product 
      ON favorites(user_id, product_id);
  `;

  try {
    await pool.query(query);
    console.log('✅ favorites 테이블 생성 완료');
  } catch (error) {
    console.error('❌ favorites 테이블 생성 실패:', error);
    throw error;
  }
};

/**
 * 마이그레이션 실행
 */
const runMigration = async () => {
  try {
    console.log('🚀 데이터베이스 마이그레이션 시작...\n');

    // 연결 테스트
    const result = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL 연결 성공:', result.rows[0].now);
    console.log('');

    // 테이블 생성
    await createAreasTable();
    await createCrawlingLogsTable();
    await createSearchLogsTable();
    await createUsersTable();
    await createRefreshTokensTable();
    await createFavoritesTable();

    console.log('\n✅ 마이그레이션 완료!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error);
    process.exit(1);

  } finally {
    await pool.end();
  }
};

// 마이그레이션 실행
runMigration();

