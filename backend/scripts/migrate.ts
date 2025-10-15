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

