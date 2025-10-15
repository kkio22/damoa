#!/bin/bash

# Redis 복구 스크립트
# 사용법: ./redis-restore.sh [backup-file]

set -e

# 백업 파일 확인
BACKUP_FILE="${1}"

if [ -z "${BACKUP_FILE}" ]; then
  echo "❌ 사용법: ./redis-restore.sh [backup-file]"
  echo "예시: ./redis-restore.sh ./backups/redis_backup_20241015_120000.rdb"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ 백업 파일을 찾을 수 없습니다: ${BACKUP_FILE}"
  exit 1
fi

# Redis 설정
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"
REDIS_DATA_DIR="${REDIS_DATA_DIR:-/data}"

echo "🔄 Redis 복구 시작..."
echo "📍 Host: ${REDIS_HOST}:${REDIS_PORT}"
echo "📁 Backup File: ${BACKUP_FILE}"

# Redis 중지
echo "⏸️  Redis 중지 중..."
if [ -n "${REDIS_PASSWORD}" ]; then
  redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" -a "${REDIS_PASSWORD}" SHUTDOWN NOSAVE || true
else
  redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" SHUTDOWN NOSAVE || true
fi

sleep 2

# 백업 파일 복사
echo "📋 백업 파일 복사 중..."
cp "${BACKUP_FILE}" "${REDIS_DATA_DIR}/dump.rdb"
chmod 644 "${REDIS_DATA_DIR}/dump.rdb"

echo "✅ 백업 파일 복사 완료"
echo "🚀 Redis를 다시 시작해주세요."
echo ""
echo "Docker Compose 사용 시:"
echo "  docker-compose restart redis"
echo ""
echo "시스템 Redis 사용 시:"
echo "  sudo systemctl start redis-server"
echo ""
echo "✅ Redis 복구 완료!"

