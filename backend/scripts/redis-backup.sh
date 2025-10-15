#!/bin/bash

# Redis 백업 스크립트
# 사용법: ./redis-backup.sh [backup-dir]

set -e

# 기본 백업 디렉토리
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/redis_backup_${TIMESTAMP}.rdb"

# Redis 설정
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"

echo "🔄 Redis 백업 시작..."
echo "📍 Host: ${REDIS_HOST}:${REDIS_PORT}"
echo "📁 Backup Directory: ${BACKUP_DIR}"

# 백업 디렉토리 생성
mkdir -p "${BACKUP_DIR}"

# Redis BGSAVE 실행
if [ -n "${REDIS_PASSWORD}" ]; then
  redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" -a "${REDIS_PASSWORD}" BGSAVE
else
  redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" BGSAVE
fi

echo "⏳ BGSAVE 완료 대기 중..."
sleep 5

# dump.rdb 파일 복사
DUMP_FILE="/data/dump.rdb"

if [ -f "${DUMP_FILE}" ]; then
  cp "${DUMP_FILE}" "${BACKUP_FILE}"
  echo "✅ 백업 완료: ${BACKUP_FILE}"
  
  # 백업 파일 크기 확인
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "📦 백업 파일 크기: ${BACKUP_SIZE}"
  
  # 7일 이상 된 백업 파일 삭제
  find "${BACKUP_DIR}" -name "redis_backup_*.rdb" -type f -mtime +7 -delete
  echo "🗑️  7일 이상 된 백업 파일 삭제 완료"
  
else
  echo "❌ 백업 실패: dump.rdb 파일을 찾을 수 없습니다."
  exit 1
fi

echo "✅ Redis 백업 완료!"

