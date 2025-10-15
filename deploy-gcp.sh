#!/bin/bash

# Google Cloud Platform 배포 스크립트
# 사용법: ./deploy-gcp.sh

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 SmartTrade GCP 배포 시작${NC}"
echo ""

# 1. 환경 변수 확인
echo -e "${YELLOW}1️⃣ 환경 변수 확인${NC}"

if [ -z "$GCP_PROJECT_ID" ]; then
  echo -e "${RED}❌ GCP_PROJECT_ID 환경 변수가 설정되지 않았습니다.${NC}"
  echo "export GCP_PROJECT_ID=your-project-id"
  exit 1
fi

echo "✅ Project ID: $GCP_PROJECT_ID"

# 기본값 설정
REGION="${REGION:-asia-northeast3}"
BACKEND_IMAGE="asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-backend"
FRONTEND_IMAGE="asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-frontend"

echo "✅ Region: $REGION"
echo ""

# 2. gcloud 인증 확인
echo -e "${YELLOW}2️⃣ gcloud 인증 확인${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" > /dev/null 2>&1; then
  echo -e "${RED}❌ gcloud 인증이 필요합니다.${NC}"
  echo "gcloud auth login"
  exit 1
fi
echo "✅ gcloud 인증 완료"
echo ""

# 3. 프로젝트 설정
echo -e "${YELLOW}3️⃣ gcloud 프로젝트 설정${NC}"
gcloud config set project "$GCP_PROJECT_ID"
echo "✅ 프로젝트 설정 완료"
echo ""

# 4. Docker 인증
echo -e "${YELLOW}4️⃣ Docker 인증 설정${NC}"
gcloud auth configure-docker asia-northeast3-docker.pkg.dev
echo "✅ Docker 인증 완료"
echo ""

# 5. Backend 이미지 빌드
echo -e "${YELLOW}5️⃣ Backend Docker 이미지 빌드${NC}"
docker build -t "$BACKEND_IMAGE:latest" ./backend
echo "✅ Backend 이미지 빌드 완료"
echo ""

# 6. Frontend 이미지 빌드
echo -e "${YELLOW}6️⃣ Frontend Docker 이미지 빌드${NC}"

# Backend URL 가져오기 (이미 배포된 경우)
BACKEND_URL=$(gcloud run services describe smarttrade-backend \
  --region="$REGION" \
  --format='value(status.url)' 2>/dev/null || echo "http://localhost:8080")

docker build \
  --build-arg REACT_APP_API_URL="$BACKEND_URL" \
  -t "$FRONTEND_IMAGE:latest" \
  ./frontend
echo "✅ Frontend 이미지 빌드 완료"
echo ""

# 7. 이미지 푸시
echo -e "${YELLOW}7️⃣ Docker 이미지 푸시${NC}"
docker push "$BACKEND_IMAGE:latest"
docker push "$FRONTEND_IMAGE:latest"
echo "✅ 이미지 푸시 완료"
echo ""

# 8. Backend 배포
echo -e "${YELLOW}8️⃣ Backend Cloud Run 배포${NC}"
gcloud run deploy smarttrade-backend \
  --image="$BACKEND_IMAGE:latest" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --quiet

BACKEND_URL=$(gcloud run services describe smarttrade-backend \
  --region="$REGION" \
  --format='value(status.url)')

echo "✅ Backend 배포 완료: $BACKEND_URL"
echo ""

# 9. Frontend 배포
echo -e "${YELLOW}9️⃣ Frontend Cloud Run 배포${NC}"
gcloud run deploy smarttrade-frontend \
  --image="$FRONTEND_IMAGE:latest" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=80 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=5 \
  --quiet

FRONTEND_URL=$(gcloud run services describe smarttrade-frontend \
  --region="$REGION" \
  --format='value(status.url)')

echo "✅ Frontend 배포 완료: $FRONTEND_URL"
echo ""

# 10. 헬스체크
echo -e "${YELLOW}🔟 헬스체크${NC}"
echo "⏳ 서비스 시작 대기 중... (30초)"
sleep 30

echo "Backend 헬스체크..."
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
  echo "✅ Backend 정상"
else
  echo "⚠️  Backend 응답 없음 (나중에 다시 확인하세요)"
fi

echo "Frontend 헬스체크..."
if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
  echo "✅ Frontend 정상"
else
  echo "⚠️  Frontend 응답 없음 (나중에 다시 확인하세요)"
fi
echo ""

# 배포 완료
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📊 배포 정보${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Backend:  ${GREEN}$BACKEND_URL${NC}"
echo -e "Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 단계:"
echo "1. Cloud SQL 및 Memory Store(Redis) 설정"
echo "2. Secret Manager에 환경변수 저장"
echo "3. 커스텀 도메인 연결"
echo "4. HTTPS/SSL 설정 확인"
echo ""

