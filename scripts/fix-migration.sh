#!/bin/bash
# VM에서 실행할 마이그레이션 스크립트

echo "🔧 데이터베이스 마이그레이션 실행 중..."

# Backend 컨테이너에서 마이그레이션 실행
sudo docker compose -f docker-compose.prod.yml exec -T backend npx ts-node scripts/migrate.ts

echo ""
echo "✅ 마이그레이션 완료!"
echo ""
echo "📊 테이블 확인:"
sudo docker compose -f docker-compose.prod.yml exec -T postgres psql -U smarttrade_user -d smarttrade_prod -c "\dt"

