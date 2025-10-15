# ✅ GCP 배포 체크리스트

SmartTrade MVP를 Google Cloud Platform에 배포하기 위한 단계별 체크리스트입니다.

---

## 📋 배포 전 준비

### 1️⃣ 로컬 환경 확인
- [ ] gcloud CLI 설치 완료
- [ ] Docker 설치 및 실행 확인
- [ ] Git 저장소 정리 (불필요한 파일 제거)
- [ ] 로컬 테스트 완료 (`docker-compose up`)

### 2️⃣ GCP 계정 및 프로젝트
- [ ] Google Cloud 계정 생성
- [ ] 결제 계정 연결 (무료 크레딧 $300)
- [ ] 새 프로젝트 생성
- [ ] 프로젝트 ID 확인 및 메모

### 3️⃣ gcloud 인증
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

---

## 🔧 GCP 리소스 생성

### 1️⃣ API 활성화 (필수)
```bash
# 모든 필요한 API 활성화
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

- [ ] Cloud Run API 활성화
- [ ] Cloud SQL API 활성화
- [ ] Memory Store API 활성화
- [ ] Secret Manager API 활성화
- [ ] Artifact Registry API 활성화
- [ ] Cloud Build API 활성화

### 2️⃣ Artifact Registry 생성
```bash
gcloud artifacts repositories create smarttrade \
  --repository-format=docker \
  --location=asia-northeast3 \
  --description="SmartTrade Docker images"

gcloud auth configure-docker asia-northeast3-docker.pkg.dev
```

- [ ] Docker 저장소 생성
- [ ] Docker 인증 설정

### 3️⃣ Cloud SQL (PostgreSQL) 생성
```bash
gcloud sql instances create smarttrade-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=asia-northeast3 \
  --database-flags=max_connections=100

gcloud sql databases create smarttrade_prod \
  --instance=smarttrade-db

gcloud sql users create smarttrade_user \
  --instance=smarttrade-db \
  --password=YOUR_SECURE_PASSWORD
```

- [ ] PostgreSQL 인스턴스 생성
- [ ] 데이터베이스 생성 (smarttrade_prod)
- [ ] 사용자 생성 (smarttrade_user)
- [ ] Connection Name 메모

### 4️⃣ Memory Store (Redis) 생성
```bash
gcloud redis instances create smarttrade-redis \
  --size=1 \
  --region=asia-northeast3 \
  --redis-version=redis_7_0 \
  --tier=basic
```

- [ ] Redis 인스턴스 생성
- [ ] Redis Host IP 메모
- [ ] Redis Port 확인 (6379)

### 5️⃣ Secret Manager 설정
```bash
# 비밀번호 저장
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create DB_PASSWORD --data-file=-
echo -n "YOUR_OPENAI_API_KEY" | gcloud secrets create OPENAI_API_KEY --data-file=-

# 권한 부여
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding DB_PASSWORD \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

- [ ] DB_PASSWORD Secret 생성
- [ ] OPENAI_API_KEY Secret 생성 (선택사항)
- [ ] Cloud Run 서비스 계정에 권한 부여

---

## 🚀 배포 실행

### 방법 1: 자동 배포 스크립트 (권장)

```bash
# 환경변수 설정
export GCP_PROJECT_ID="your-project-id"
export REGION="asia-northeast3"

# 배포 실행
./deploy-gcp.sh
```

- [ ] 환경변수 설정
- [ ] 배포 스크립트 실행
- [ ] Backend URL 확인 및 메모
- [ ] Frontend URL 확인 및 메모

### 방법 2: 수동 배포

#### Backend 배포
```bash
# 이미지 빌드
docker build -t asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-backend:latest ./backend

# 이미지 푸시
docker push asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-backend:latest

# Cloud Run 배포
gcloud run deploy smarttrade-backend \
  --image=asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-backend:latest \
  --region=asia-northeast3 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --set-secrets="DB_PASSWORD=DB_PASSWORD:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest" \
  --set-cloudsql-instances=$GCP_PROJECT_ID:asia-northeast3:smarttrade-db
```

- [ ] Backend 이미지 빌드
- [ ] Backend 이미지 푸시
- [ ] Backend Cloud Run 배포
- [ ] Backend URL 확인

#### Frontend 배포
```bash
# Backend URL로 환경변수 설정
BACKEND_URL="https://your-backend-url.run.app"

# 이미지 빌드
docker build \
  --build-arg REACT_APP_API_URL=$BACKEND_URL \
  -t asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-frontend:latest \
  ./frontend

# 이미지 푸시
docker push asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-frontend:latest

# Cloud Run 배포
gcloud run deploy smarttrade-frontend \
  --image=asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-frontend:latest \
  --region=asia-northeast3 \
  --platform=managed \
  --allow-unauthenticated \
  --port=80 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=5
```

- [ ] Frontend 이미지 빌드
- [ ] Frontend 이미지 푸시
- [ ] Frontend Cloud Run 배포
- [ ] Frontend URL 확인

---

## 🧪 배포 후 테스트

### 1️⃣ 헬스체크
```bash
# Backend 헬스체크
curl https://your-backend-url.run.app/health

# Frontend 헬스체크
curl https://your-frontend-url.run.app
```

- [ ] Backend 헬스체크 통과
- [ ] Frontend 접속 확인

### 2️⃣ API 테스트
```bash
# 지역 정보 조회
curl https://your-backend-url.run.app/api/areas

# 크롤링 트리거
curl -X POST https://your-backend-url.run.app/api/crawling/trigger

# 검색 테스트
curl -X POST https://your-backend-url.run.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"아이폰","filters":{"locations":["역삼동"]}}'
```

- [ ] 지역 정보 API 작동
- [ ] 크롤링 트리거 작동
- [ ] 검색 API 작동

### 3️⃣ Frontend 기능 테스트
- [ ] 검색 기능 작동
- [ ] 필터 적용 작동
- [ ] AI 분석 작동
- [ ] 페이지네이션 작동
- [ ] 반응형 디자인 확인

---

## 🔄 CI/CD 설정 (선택사항)

### GitHub Actions 설정

1. **서비스 계정 생성**
```bash
# 서비스 계정 생성
gcloud iam service-accounts create github-actions \
  --description="GitHub Actions deployment" \
  --display-name="GitHub Actions"

# 권한 부여
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# JSON 키 생성
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com
```

- [ ] GitHub Actions 서비스 계정 생성
- [ ] 필요한 권한 부여
- [ ] JSON 키 다운로드

2. **GitHub Secrets 설정**
   - Repository → Settings → Secrets and variables → Actions

- [ ] `GCP_PROJECT_ID` Secret 추가
- [ ] `GCP_SA_KEY` Secret 추가 (JSON 키 전체 내용)
- [ ] `CLOUD_SQL_CONNECTION_NAME` Secret 추가

3. **워크플로우 확인**
- [ ] `.github/workflows/ci-cd.yml` 파일 확인
- [ ] `main` 브랜치에 push하여 자동 배포 테스트

---

## 📊 모니터링 설정

### Cloud Monitoring

```bash
# 로그 확인
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=smarttrade-backend" \
  --limit=50

# 실시간 로그 스트리밍
gcloud alpha run services logs read smarttrade-backend \
  --region=asia-northeast3 \
  --follow
```

- [ ] Cloud Logging 확인
- [ ] 에러 로그 모니터링 설정
- [ ] Uptime Check 설정 (선택사항)
- [ ] 알림 설정 (선택사항)

---

## 🔒 보안 점검

- [ ] Secret Manager에 민감 정보 저장 확인
- [ ] Cloud SQL Private IP 사용 확인
- [ ] Memory Store Private IP 사용 확인
- [ ] CORS 설정 확인 (Frontend URL만 허용)
- [ ] Rate Limiting 작동 확인
- [ ] HTTPS 강제 확인

---

## 💰 비용 확인

- [ ] Cloud Run 요금 확인
- [ ] Cloud SQL 요금 확인
- [ ] Memory Store 요금 확인
- [ ] 예산 알림 설정 (선택사항)

예상 월 비용: **$85-125**
- Cloud Run (Backend): $20-50
- Cloud Run (Frontend): $10-20
- Cloud SQL: $10
- Memory Store: $45

---

## 📝 배포 정보 기록

### 배포 URL
```
Backend:  https://_______________________.run.app
Frontend: https://_______________________.run.app
```

### 리소스 정보
```
Project ID:       _______________________
Cloud SQL:        _______________________:asia-northeast3:smarttrade-db
Redis Host:       _______________________
Artifact Registry: asia-northeast3-docker.pkg.dev/_______________________/smarttrade
```

### 배포 날짜
```
최초 배포: ____________
마지막 업데이트: ____________
```

---

## 🎉 배포 완료!

축하합니다! SmartTrade MVP가 Google Cloud Platform에 성공적으로 배포되었습니다! 🚀

### 다음 단계
1. [ ] 커스텀 도메인 연결 (선택사항)
2. [ ] SSL 인증서 설정 확인
3. [ ] 사용자 피드백 수집
4. [ ] 성능 모니터링 및 최적화
5. [ ] 추가 기능 개발

