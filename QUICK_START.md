# 🚀 빠른 시작 가이드

## 📋 목차
1. [Docker 빌드 & 실행](#1-docker-빌드--실행)
2. [DB 테이블 생성](#2-db-테이블-생성)
3. [지역 정보 등록](#3-지역-정보-등록)
4. [크롤링 실행](#4-크롤링-실행)
5. [결과 확인](#5-결과-확인)
6. [검색 기능 사용 (todolist 2일차)](#6-검색-기능-사용-todolist-2일차-)
7. [프론트엔드 사용 (todolist 2일차)](#7-프론트엔드-사용-todolist-2일차-)

---

## 1. Docker 빌드 & 실행

### 🧹 Clean Build (처음 또는 에러 발생 시)

```bash
# 프로젝트 루트로 이동
cd /Users/deviantce/used\ trade

# 기존 컨테이너, 볼륨, 이미지 모두 삭제
docker-compose down -v --rmi all

# 캐시 없이 새로 빌드
docker-compose build --no-cache

# 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f backend
```

### ✅ 성공 로그 예시

```
✅ PostgreSQL 연결 성공
📊 Running database migration...
✅ areas 테이블 생성 완료
✅ crawling_logs 테이블 생성 완료
✅ search_logs 테이블 생성 완료
✅ 마이그레이션 완료!
🚀 Starting server...
✅ Redis 연결 성공
🚀 Server is running!
```

---

## 2. DB 테이블 생성

### ✅ 자동 생성됨!

Docker Compose 실행 시 **자동으로 테이블이 생성**됩니다.  
별도 작업 필요 없음!

### 확인하고 싶다면:

```bash
# PostgreSQL 접속
docker-compose exec postgres psql -U postgres -d smarttrade

# 테이블 목록 확인
\dt

# areas 테이블 구조 확인
\d areas

# 종료
\q
```

---

## 3. 지역 정보 등록

### 📍 지역 추가 (Postman 또는 curl)

```bash
# 역삼동, 논현동 추가
curl -X POST http://localhost:3000/api/areas/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "areas": [
      {"id": "6035", "name": "역삼동"},
      {"id": "6034", "name": "논현동"},
      {"id": "6033", "name": "도곡동"}
    ]
  }'
```

### ✅ 응답 예시

```json
{
  "success": true,
  "message": "3개 지역이 추가되었습니다",
  "count": 3
}
```

### 📋 지역 목록 확인

```bash
curl http://localhost:3000/api/areas
```

---

## 4. 크롤링 실행

### 🚀 방법 1: 전체 지역 크롤링

```bash
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 🎯 방법 2: 특정 지역만 크롤링

```bash
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "locations": ["역삼동", "논현동"]
  }'
```

### ✅ 응답 예시 (크롤링 완료 후)

```json
{
  "success": true,
  "message": "크롤링이 완료되었습니다",
  "data": {
    "totalProducts": 98,
    "locations": ["역삼동", "논현동"],
    "duration": 6
  }
}
```

**⚠️ 주의:** 크롤링이 완료될 때까지 대기하므로 응답까지 수 초~수 분이 걸릴 수 있습니다.

### 📊 로그 확인

```bash
docker-compose logs -f backend
```

**기대 로그:**
```
📡 크롤링 트리거 수신
📍 대상 지역: 역삼동, 논현동
🚀 크롤링 시작 [Job ID: daangn-1729000000000]
🚀 당근마켓 크롤링 시작...
📍 대상 지역: 2개 지역

📍 역삼동 (ID: 6035) 크롤링 중...
  🌐 URL: https://www.daangn.com/kr/buy-sell/?in=역삼동-6035&_data=root
  📦 API 응답: 46개 상품
  ✅ 46개 상품 변환 완료
✅ Redis 저장: 역삼동:items - 46개 상품

📍 논현동 (ID: 6034) 크롤링 중...
  🌐 URL: https://www.daangn.com/kr/buy-sell/?in=논현동-6034&_data=root
  📦 API 응답: 52개 상품
  ✅ 52개 상품 변환 완료
✅ Redis 저장: 논현동:items - 52개 상품

✅ 크롤링 완료!
   - 처리 지역: 2개
   - 총 상품: 98개
   - 소요 시간: 6초
```

---

## 5. 결과 확인

### 📊 통계 조회

```bash
curl http://localhost:3000/api/crawling/stats
```

**응답:**
```json
{
  "success": true,
  "data": {
    "totalLocations": 2,
    "totalProducts": 98,
    "locations": {
      "역삼동": 46,
      "논현동": 52
    }
  }
}
```

### 📍 지역별 상품 조회

```bash
curl http://localhost:3000/api/crawling/products/역삼동
```

**응답:**
```json
{
  "success": true,
  "location": "역삼동",
  "totalCount": 46,
  "products": [
    {
      "id": "daangn:s5cgkgp68ajv",
      "platform": "daangn",
      "originalId": "s5cgkgp68ajv",
      "title": "DMOOK 남성 슬림핏 카고 바지",
      "price": 15000,
      "description": "DMOOK 남성 슬림핏 카고 바지입니다...",
      "location": "역삼동",
      "originalUrl": "https://www.daangn.com/kr/buy-sell/...",
      "imageUrls": ["https://img.kr.gcp-karroter.net/..."],
      "status": "available",
      "createdAt": "2025-10-14T11:32:01.451+09:00",
      "updatedAt": "2025-10-14T12:00:00.000Z"
    }
  ]
}
```

### 🔍 전체 상품 조회

```bash
curl http://localhost:3000/api/crawling/products
```

---

## 🎯 Redis 데이터 구조

```
Key: 역삼동:items
Value: [
  { title: "상품1", price: 15000, ... },
  { title: "상품2", price: 20000, ... },
  ...
]

Key: 논현동:items
Value: [
  { title: "상품A", price: 10000, ... },
  { title: "상품B", price: 30000, ... },
  ...
]
```

---

## 6. 검색 기능 사용 (todolist 2일차) ✅

### 🔍 기본 검색

```bash
# 검색어로 상품 검색
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "아이폰"
  }'
```

### ✅ 응답 예시

```json
{
  "success": true,
  "totalCount": 12,
  "searchTime": 0.15,
  "products": [
    {
      "id": "daangn:123456",
      "platform": "daangn",
      "title": "아이폰 14 Pro",
      "price": 850000,
      "description": "상태 좋은 아이폰 판매합니다",
      "location": "역삼동",
      "status": "available",
      "imageUrls": ["https://..."],
      "originalUrl": "https://www.daangn.com/...",
      "createdAt": "2025-10-15T10:00:00Z",
      "updatedAt": "2025-10-15T10:00:00Z"
    }
  ]
}
```

### 🎯 필터링 검색 (가격, 지역, 상태)

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "아이폰",
    "filters": {
      "locations": ["역삼동", "논현동"],
      "priceRange": {
        "min": 500000,
        "max": 1000000
      },
      "status": "available",
      "platform": "daangn"
    }
  }'
```

### 📊 최근 검색 로그 조회

```bash
# 최근 10개 검색 로그
curl http://localhost:3000/api/search/recent?limit=10
```

### 🔥 인기 검색어 조회 (최근 7일)

```bash
# 상위 10개 인기 검색어
curl http://localhost:3000/api/search/popular?limit=10
```

### ✅ 응답 예시

```json
{
  "success": true,
  "totalCount": 10,
  "searches": [
    { "query": "아이폰", "count": 45 },
    { "query": "맥북", "count": 32 },
    { "query": "갤럭시", "count": 28 }
  ]
}
```

---

## 7. 프론트엔드 사용 (todolist 2일차) ✅

### 🌐 Docker로 실행 (권장)

프론트엔드는 이미 `docker-compose up` 실행 시 자동으로 시작됩니다!

```bash
# 브라우저에서 접속
http://localhost
```

### 💻 로컬 개발 모드

```bash
# 프론트엔드 폴더로 이동
cd frontend

# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm start

# 브라우저에서 자동으로 http://localhost:3001 열림
```

### 🎨 주요 기능

1. **검색 입력**: 상품명 입력 (예: 아이폰, 맥북)
2. **지역 필터**: 동 단위 선택 (역삼동, 논현동 등)
3. **가격 필터**: 최저가 ~ 최고가 범위 설정
4. **로딩 스피너**: 검색 중 애니메이션 표시
5. **상품 카드**: 이미지, 제목, 가격, 지역, 시간 표시
6. **페이지네이션**: 페이지당 12개 상품, 이전/다음 버튼
7. **반응형**: 모바일/태블릿/데스크톱 대응

### 🔍 사용 예시

1. 검색어 입력: "아이폰"
2. 지역 선택: "역삼동"
3. 최저가: "100000", 최고가: "500000"
4. 검색 버튼 클릭
5. 결과 확인 (페이지당 12개 상품 표시)
6. 페이지네이션으로 다음 페이지 이동
7. 상품 클릭 시 당근마켓으로 이동

---

## 📚 API 목록

### 지역 관리
- `POST /api/areas/bulk` - 지역 일괄 추가
- `GET /api/areas` - 전체 지역 조회
- `DELETE /api/areas` - 전체 지역 삭제
- `GET /api/areas/stats` - 지역 통계

### 크롤링
- `POST /api/crawling/trigger` - 크롤링 실행 (완료 후 응답)
- `GET /api/crawling/stats` - Redis 통계
- `GET /api/crawling/products` - 전체 상품 조회
- `GET /api/crawling/products/:location` - 지역별 상품 조회

### 검색 (todolist 2일차) ✅
- `POST /api/search` - 상품 검색 (필터링 포함)
- `GET /api/search/recent` - 최근 검색 로그 조회
- `GET /api/search/popular` - 인기 검색어 조회

### 시스템
- `GET /health` - 헬스체크

---

## 🤖 크롤링 스케줄러 (todolist 3일차) ✅

### 자동 크롤링 활성화

Docker Compose 환경변수를 추가하여 매일 자정 자동 크롤링을 활성화합니다:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      ENABLE_CRAWLER_SCHEDULER: "true"  # 추가
```

또는 명령어로 실행:

```bash
docker-compose up -d --build
```

### 스케줄 옵션

1. **매일 자정** (기본): `scheduleDailyCrawling()`
2. **4시간마다**: `scheduleEvery4Hours()`  
3. **테스트용 (1분마다)**: `scheduleEveryMinute()`

### 로그 확인

```bash
# 스케줄러 로그 확인
docker-compose logs -f backend | grep "스케줄링"
```

### 수동 트리거 (기존 방식)

```bash
# 여전히 수동으로도 가능
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🤖 AI 분석 기능 (todolist 3일차) ✅

### AI 분석 API 사용

AI 기능은 **OpenAI API 키 없이도 작동**합니다! (기본 키워드 매칭)  
OpenAI를 사용하려면 환경변수에 API 키를 추가하세요.

#### 1️⃣ OpenAI API 키 설정 (선택사항)

`docker-compose.yml`에 환경변수 추가:

```yaml
services:
  backend:
    environment:
      OPENAI_API_KEY: "sk-your-api-key-here"  # 추가
```

또는 Docker 실행 시:

```bash
export OPENAI_API_KEY="sk-your-api-key-here"
docker-compose up -d --build
```

#### 2️⃣ AI 분석 실행

```bash
# POST /api/ai/analyze
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "아이폰",
    "locations": ["역삼동", "논현동"],
    "maxResults": 10
  }'
```

#### 3️⃣ 응답 예시

```json
{
  "success": true,
  "searchQuery": "아이폰",
  "analyzedAt": "2025-10-15T12:00:00.000Z",
  "totalProducts": 50,
  "recommendations": [
    {
      "product": {
        "id": "abc123",
        "title": "아이폰 14 Pro 256GB",
        "price": 900000,
        "location": "역삼동",
        ...
      },
      "score": 95,
      "reasons": [
        "제목이 검색어와 정확히 일치합니다",
        "현재 판매 중인 상품입니다",
        "최근 등록된 상품입니다"
      ],
      "matchedKeywords": ["아이폰", "14", "Pro"]
    }
  ],
  "insights": {
    "averagePrice": 850000,
    "priceRange": { "min": 500000, "max": 1200000 },
    "mostCommonLocations": ["역삼동", "논현동"],
    "trendingItems": ["아이폰", "14", "Pro"],
    "summary": "아이폰 검색 결과 50개 상품, 평균 가격 85만원"
  },
  "suggestedFilters": {
    "priceRange": { "min": 595000, "max": 1105000 },
    "locations": ["역삼동", "논현동", "도곡동"]
  },
  "relatedKeywords": ["아이폰", "iPhone", "애플"]
}
```

#### 4️⃣ AI 캐시 확인

```bash
# 캐시 통계 조회
curl http://localhost:3000/api/ai/cache/stats

# 캐시 전체 삭제
curl -X DELETE http://localhost:3000/api/ai/cache
```

### AI 기능 특징

✅ **자동 캐싱**: 동일한 검색어는 Redis에 1시간 캐싱  
✅ **스마트 추천**: AI 점수 기반 상품 추천 (0-100점)  
✅ **시장 인사이트**: 평균 가격, 가격 범위, 인기 지역 분석  
✅ **필터 제안**: AI가 최적의 필터 조합 제안  
✅ **관련 키워드**: 검색어 확장 및 유사어 추천  
✅ **OpenAI 없이도 작동**: 기본 키워드 매칭으로 fallback

### LangGraph 워크플로우

AI 분석은 다음 4단계 워크플로우로 실행됩니다:

```
1️⃣ 검색어 분석 (키워드 추출)
    ↓
2️⃣ 상품 점수 계산 (AI 매칭)
    ↓
3️⃣ 인사이트 생성 (시장 분석)
    ↓
4️⃣ 필터 제안 (최적화)
```

---

## 📈 시스템 상태 모니터링 (todolist 3일차) ✅

### 시스템 상태 조회

```bash
# GET /api/system/status
curl http://localhost:3000/api/system/status
```

### 응답 예시

```json
{
  "success": true,
  "timestamp": "2025-10-15T12:00:00.000Z",
  "uptime": 3600,
  "services": {
    "backend": {
      "status": "healthy",
      "version": "1.0.0"
    },
    "database": {
      "status": "connected",
      "type": "PostgreSQL"
    },
    "cache": {
      "status": "connected",
      "type": "Redis"
    }
  },
  "crawling": {
    "scheduler": {
      "enabled": true,
      "running": true,
      "nextRun": "매일 자정 (00:00)"
    },
    "lastCrawl": {
      "timestamp": "2025-10-15T00:00:00.000Z",
      "status": "success",
      "totalProducts": 150,
      "duration": 45
    },
    "recentLogs": [...]
  },
  "statistics": {
    "redis": {
      "totalLocations": 10,
      "totalProducts": 500
    },
    "database": {
      "totalAreas": 10,
      "totalSearchLogs": 50,
      "totalCrawlingLogs": 5
    },
    "search": {
      "totalSearches": 50,
      "popularKeywords": [
        {"query": "아이폰", "count": 15},
        {"query": "맥북", "count": 10}
      ]
    }
  }
}
```

### 간단한 헬스체크

```bash
# GET /api/system/health
curl http://localhost:3000/api/system/health
```

### 프론트엔드 모니터링 UI

SystemMonitor 컴포넌트가 제공됩니다:
- 📊 실시간 시스템 상태
- 🔄 자동 새로고침 (30초)
- 🕷️ 크롤링 상태 및 로그
- 📈 시스템 통계
- 🔍 인기 검색어

**사용 방법**: `frontend/src/components/SystemMonitor.jsx` 임포트

---

## 🛠️ 문제 해결

### 컨테이너가 시작되지 않음
```bash
docker-compose logs backend
docker-compose logs postgres
docker-compose logs redis
```

### DB 연결 오류
```bash
# 컨테이너 재시작
docker-compose restart backend
```

### Redis 연결 오류
```bash
# Redis 컨테이너 확인
docker-compose ps redis
docker-compose restart redis
```

### 크롤링이 안 됨
1. **지역이 등록되었는지 확인**: `curl http://localhost:3000/api/areas`
2. **로그 확인**: `docker-compose logs -f backend`
3. **당근마켓 URL 확인**: 브라우저에서 직접 접속해보기

---

## 🎉 완료!

이제 시스템이 정상 작동합니다!

**다음 단계:**
1. 더 많은 지역 추가
2. 주기적 크롤링 설정 (Cron Job 또는 GitHub Actions)
3. 프론트엔드 연결

