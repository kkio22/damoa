# 🚀 Google Cloud Platform 배포 가이드

SmartTrade MVP를 Google Cloud Platform에 배포하는 완전한 가이드입니다.

---

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [GCP 프로젝트 설정](#2-gcp-프로젝트-설정)
3. [Cloud SQL 설정](#3-cloud-sql-설정-postgresql)
4. [Memory Store 설정](#4-memory-store-설정-redis)
5. [Secret Manager 설정](#5-secret-manager-설정)
6. [Artifact Registry 설정](#6-artifact-registry-설정)
7. [Cloud Run 배포](#7-cloud-run-배포)
8. [CI/CD 설정](#8-cicd-설정)
9. [모니터링 설정](#9-모니터링-설정)
10. [비용 최적화](#10-비용-최적화)

---

## 1. 사전 준비

### 필요한 도구 설치

```bash
# gcloud CLI 설치 (macOS)
brew install --cask google-cloud-sdk

# gcloud 초기화
gcloud init

# Docker 설치 확인
docker --version

# Git 설치 확인
git --version
```

### GCP 계정 및 결제 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 결제 계정 연결 (무료 크레딧 $300 사용 가능)

---

## 2. GCP 프로젝트 설정

### 프로젝트 ID 설정

```bash
# 프로젝트 ID 환경변수 설정
export GCP_PROJECT_ID="your-project-id"
export REGION="asia-northeast3"  # 서울 리전

# gcloud 설정
gcloud config set project $GCP_PROJECT_ID
gcloud config set compute/region $REGION
```

### 필요한 API 활성화

```bash
# Cloud Run API
gcloud services enable run.googleapis.com

# Cloud SQL API
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com

# Memory Store API
gcloud services enable redis.googleapis.com

# Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Cloud Build API (CI/CD용)
gcloud services enable cloudbuild.googleapis.com

# Container Registry API
gcloud services enable containerregistry.googleapis.com
```

---

## 3. Cloud SQL 설정 (PostgreSQL)

### PostgreSQL 인스턴스 생성

```bash
# Cloud SQL 인스턴스 생성
gcloud sql instances create smarttrade-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=$REGION \
  --network=default \
  --no-assign-ip \
  --database-flags=max_connections=100

# 데이터베이스 생성
gcloud sql databases create smarttrade_prod \
  --instance=smarttrade-db

# 사용자 생성
gcloud sql users create smarttrade_user \
  --instance=smarttrade-db \
  --password=YOUR_SECURE_PASSWORD
```

### Cloud SQL Proxy 설정 (로컬 테스트용)

```bash
# Cloud SQL Proxy 다운로드
wget https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy

# Proxy 실행
./cloud_sql_proxy -instances=$GCP_PROJECT_ID:$REGION:smarttrade-db=tcp:5432
```

### 연결 정보 확인

```bash
# Connection Name 확인
gcloud sql instances describe smarttrade-db \
  --format='value(connectionName)'

# 예시: your-project-id:asia-northeast3:smarttrade-db
```

---

## 4. Memory Store 설정 (Redis)

### Redis 인스턴스 생성

```bash
# Memory Store Redis 인스턴스 생성
gcloud redis instances create smarttrade-redis \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_7_0 \
  --tier=basic

# 인스턴스 정보 확인
gcloud redis instances describe smarttrade-redis \
  --region=$REGION
```

### Redis 연결 정보 확인

```bash
# Host 확인
gcloud redis instances describe smarttrade-redis \
  --region=$REGION \
  --format='value(host)'

# Port 확인 (기본 6379)
gcloud redis instances describe smarttrade-redis \
  --region=$REGION \
  --format='value(port)'
```

---

## 5. Secret Manager 설정

### Secret 생성

```bash
# PostgreSQL 비밀번호
echo -n "YOUR_SECURE_DB_PASSWORD" | \
  gcloud secrets create DB_PASSWORD \
  --data-file=- \
  --replication-policy="automatic"

# Redis 비밀번호 (Memory Store Basic은 인증 없음)
echo -n "" | \
  gcloud secrets create REDIS_PASSWORD \
  --data-file=- \
  --replication-policy="automatic"

# OpenAI API Key
echo -n "YOUR_OPENAI_API_KEY" | \
  gcloud secrets create OPENAI_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

# JWT Secret
echo -n "YOUR_JWT_SECRET" | \
  gcloud secrets create JWT_SECRET \
  --data-file=- \
  --replication-policy="automatic"
```

### Secret 권한 설정

```bash
# Cloud Run 서비스 계정에 Secret 접근 권한 부여
PROJECT_NUMBER=$(gcloud projects describe $GCP_PROJECT_ID --format='value(projectNumber)')

gcloud secrets add-iam-policy-binding DB_PASSWORD \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 6. Artifact Registry 설정

### Registry 생성

```bash
# Docker 이미지 저장소 생성
gcloud artifacts repositories create smarttrade \
  --repository-format=docker \
  --location=$REGION \
  --description="SmartTrade Docker images"

# Docker 인증 설정
gcloud auth configure-docker $REGION-docker.pkg.dev
```

---

## 7. Cloud Run 배포

### 방법 1: 배포 스크립트 사용 (권장)

```bash
# 스크립트 실행 권한 부여
chmod +x deploy-gcp.sh
chmod +x backend/scripts/redis-backup.sh
chmod +x backend/scripts/redis-restore.sh

# 배포 실행
export GCP_PROJECT_ID="your-project-id"
./deploy-gcp.sh
```

### 방법 2: 수동 배포

```bash
# Backend 배포
gcloud run deploy smarttrade-backend \
  --image=asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-backend:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,PORT=8080,DB_HOST=/cloudsql/$GCP_PROJECT_ID:$REGION:smarttrade-db" \
  --set-secrets="DB_PASSWORD=DB_PASSWORD:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest" \
  --set-cloudsql-instances=$GCP_PROJECT_ID:$REGION:smarttrade-db

# Frontend 배포
gcloud run deploy smarttrade-frontend \
  --image=asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-frontend:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=80 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=5
```

### 서비스 URL 확인

```bash
# Backend URL
gcloud run services describe smarttrade-backend \
  --region=$REGION \
  --format='value(status.url)'

# Frontend URL
gcloud run services describe smarttrade-frontend \
  --region=$REGION \
  --format='value(status.url)'
```

---

## 8. CI/CD 설정

### GitHub Actions 사용

1. **GitHub Secrets 설정**

   - Repository → Settings → Secrets and variables → Actions
   - 다음 Secrets 추가:
     - `GCP_PROJECT_ID`: GCP 프로젝트 ID
     - `GCP_SA_KEY`: 서비스 계정 JSON 키
     - `CLOUD_SQL_CONNECTION_NAME`: Cloud SQL 연결 이름

2. **서비스 계정 생성 및 키 다운로드**

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

3. **GitHub Actions 워크플로우 사용**

   - `.github/workflows/ci-cd.yml` 파일이 자동으로 실행됩니다.
   - `main` 브랜치에 push하면 자동 배포됩니다.

### Cloud Build 사용 (대안)

```bash
# Cloud Build 트리거 생성
gcloud builds triggers create github \
  --name="smarttrade-deploy" \
  --repo-name="smarttrade" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml"
```

---

## 9. 모니터링 설정

### Cloud Monitoring 대시보드

```bash
# 로그 확인
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=smarttrade-backend" \
  --limit=50 \
  --format=json

# 실시간 로그 스트리밍
gcloud alpha run services logs read smarttrade-backend \
  --region=$REGION \
  --follow
```

### Uptime Checks 설정

```bash
# Cloud Console에서 설정:
# Monitoring > Uptime Checks > Create Uptime Check
# - Backend: https://your-backend-url.run.app/health
# - Frontend: https://your-frontend-url.run.app
```

---

## 10. 비용 최적화

### 예상 월 비용 (MVP)

| 서비스 | 사양 | 예상 비용 |
|--------|------|-----------|
| Cloud Run (Backend) | 1vCPU, 1GB RAM, 1-10 instances | ~$20-50 |
| Cloud Run (Frontend) | 1vCPU, 512MB RAM, 1-5 instances | ~$10-20 |
| Cloud SQL (PostgreSQL) | db-f1-micro | ~$10 |
| Memory Store (Redis) | 1GB Basic | ~$45 |
| **총 예상 비용** | | **~$85-125/월** |

### 비용 절감 팁

1. **Auto-scaling 최적화**
   ```bash
   # 최소 인스턴스를 0으로 설정 (Cold Start 발생)
   --min-instances=0
   ```

2. **개발 환경 분리**
   - 개발/스테이징은 더 작은 인스턴스 사용
   - 사용하지 않을 때는 중지

3. **무료 티어 활용**
   - Cloud Run: 월 200만 요청 무료
   - Cloud Storage: 5GB 무료
   - Cloud Build: 일 120분 무료

---

## 📊 배포 후 확인 사항

### 1. 헬스체크

```bash
# Backend
curl https://your-backend-url.run.app/health

# Frontend
curl https://your-frontend-url.run.app
```

### 2. 데이터베이스 마이그레이션

```bash
# Cloud Run에서 마이그레이션 실행 (자동)
# 또는 수동 실행:
gcloud run jobs create smarttrade-migrate \
  --image=asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/smarttrade/smarttrade-backend:latest \
  --region=$REGION \
  --command="npx" \
  --args="ts-node,scripts/migrate.ts" \
  --set-cloudsql-instances=$GCP_PROJECT_ID:$REGION:smarttrade-db

gcloud run jobs execute smarttrade-migrate --region=$REGION
```

### 3. 크롤링 테스트

```bash
# Backend URL 확인
BACKEND_URL=$(gcloud run services describe smarttrade-backend --region=$REGION --format='value(status.url)')

# 크롤링 트리거
curl -X POST "$BACKEND_URL/api/crawling/trigger"
```

---

## 🔧 문제 해결

### Cloud SQL 연결 오류

```bash
# Cloud SQL Proxy 연결 확인
gcloud sql instances describe smarttrade-db

# Cloud Run 서비스 계정 권한 확인
gcloud projects get-iam-policy $GCP_PROJECT_ID
```

### Memory Store 연결 오류

```bash
# Redis 인스턴스 상태 확인
gcloud redis instances describe smarttrade-redis --region=$REGION

# VPC 네트워크 확인
gcloud compute networks describe default
```

### 배포 실패

```bash
# Cloud Build 로그 확인
gcloud builds list --limit=10

# 상세 로그 확인
gcloud builds log BUILD_ID
```

---

## 📚 추가 리소스

- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Cloud SQL 문서](https://cloud.google.com/sql/docs)
- [Memory Store 문서](https://cloud.google.com/memorystore/docs/redis)
- [Secret Manager 문서](https://cloud.google.com/secret-manager/docs)

---

**🎉 배포 완료! SmartTrade MVP가 프로덕션 환경에서 실행됩니다!** 🚀

