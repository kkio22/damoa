/**
 * 데이터베이스 설정
 */

import { Pool } from 'pg';
import { createClient } from 'redis';

/**
 * PostgreSQL 연결 설정
 */
export const createPostgresPool = (): Pool => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'smarttrade',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20, // 최대 연결 수
    idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
    connectionTimeoutMillis: 2000, // 연결 타임아웃
  });

  // 연결 성공 이벤트
  pool.on('connect', () => {
    console.log('✅ PostgreSQL 연결 성공');
  });

  // 에러 이벤트
  pool.on('error', (err) => {
    console.error('❌ PostgreSQL 연결 오류:', err);
  });

  return pool;
};

/**
 * Redis 클라이언트 생성
 */
export const createRedisClient = () => {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DB || '0'),
  });

  // 연결 성공 이벤트
  client.on('connect', () => {
    console.log('✅ Redis 연결 시도 중...');
  });

  client.on('ready', () => {
    console.log('✅ Redis 연결 성공');
  });

  // 에러 이벤트
  client.on('error', (err) => {
    console.error('❌ Redis 연결 오류:', err);
  });

  return client;
};

/**
 * 데이터베이스 연결 테스트
 */
export const testDatabaseConnections = async (
  pgPool: Pool,
  redisClient: ReturnType<typeof createClient>
): Promise<void> => {
  try {
    // PostgreSQL 연결 테스트
    const pgResult = await pgPool.query('SELECT NOW()');
    console.log('✅ PostgreSQL 연결 테스트 성공:', pgResult.rows[0].now);

    // Redis 연결 테스트
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.ping();
    console.log('✅ Redis 연결 테스트 성공');

  } catch (error) {
    console.error('❌ 데이터베이스 연결 테스트 실패:', error);
    throw error;
  }
};

