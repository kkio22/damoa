# SmartTrade Backend - 크롤링 시스템

당근마켓, 중고나라, 번개장터 등 중고거래 플랫폼의 상품 데이터를 크롤링하고 Redis에 저장하는 백엔드 서비스입니다.

## 📋 주요 기능

- ✅ 당근마켓 상품 크롤링 (지역별)
- ✅ Redis 캐시 저장 (24시간 TTL)
- ✅ PostgreSQL 크롤링 로그 저장
- ✅ REST API를 통한 트리거 방식 크롤링
- ✅ 크롤링 상태 조회 API

## 🛠️ 기술 스택

- **런타임**: Node.js 18+
- **언어**: TypeScript
- **프레임워크**: Express.js
- **데이터베이스**: PostgreSQL (로그 저장)
- **캐시**: Redis (상품 데이터 저장)
- **크롤링**: Puppeteer

## 📦 설치 방법

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smarttrade
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. 데이터베이스 설정

#### PostgreSQL 테이블 생성

```sql
-- crawling_logs 테이블
CREATE TABLE crawling_logs (
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
CREATE INDEX idx_crawling_logs_platform ON crawling_logs(platform);
CREATE INDEX idx_crawling_logs_started_at ON crawling_logs(started_at);
CREATE INDEX idx_crawling_logs_status ON crawling_logs(status);
```

#### Redis 설치 및 실행

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:latest
```

## 🚀 실행 방법

### 개발 모드

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 📡 API 사용법

### 1. 크롤링 트리거 (비동기)

트리거를 주면 백그라운드에서 크롤링이 시작됩니다.

```bash
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "daangn",
    "locations": ["서울특별시", "경기도"]
  }'
```

**응답:**

```json
{
  "success": true,
  "message": "크롤링이 시작되었습니다",
  "jobId": "daangn-1234567890",
  "estimatedTime": 300
}
```

### 2. 크롤링 즉시 실행 (동기)

응답까지 시간이 오래 걸릴 수 있습니다 (5~10분).

```bash
curl -X POST http://localhost:3000/api/crawling/execute \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "daangn",
    "locations": ["서울특별시"]
  }'
```

**응답:**

```json
{
  "success": true,
  "message": "크롤링이 완료되었습니다",
  "data": {
    "platform": "daangn",
    "status": "completed",
    "totalProducts": 1234,
    "newProducts": 1234,
    "updatedProducts": 0,
    "errorCount": 0,
    "duration": 298
  }
}
```

### 3. 크롤링 상태 조회

```bash
curl http://localhost:3000/api/crawling/status
```

**응답:**

```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalCrawls": 10,
      "successRate": 90,
      "avgDuration": 250,
      "totalProducts": 12345
    },
    "recentLogs": [...],
    "currentData": {
      "totalProducts": 5000,
      "lastUpdate": "2024-01-15T10:30:00Z",
      "platformCounts": {
        "daangn": 5000
      }
    }
  }
}
```

### 4. Redis 캐시 초기화

```bash
curl -X DELETE http://localhost:3000/api/crawling/cache
```

### 5. 헬스체크

```bash
curl http://localhost:3000/api/crawling/health
```

## 📂 프로젝트 구조

```
backend/
├── src/
│   ├── domain/
│   │   └── crawling/
│   │       ├── types/              # 타입 정의
│   │       │   └── index.ts
│   │       ├── repository/         # 데이터 저장소
│   │       │   ├── crawling.repository.ts         (Redis)
│   │       │   └── crawling-log.repository.ts     (PostgreSQL)
│   │       ├── service/            # 비즈니스 로직
│   │       │   └── crawling.service.ts
│   │       ├── controller/         # API 컨트롤러
│   │       │   └── crawling.controller.ts
│   │       ├── routes/             # API 라우트
│   │       │   └── crawling.routes.ts
│   │       ├── config/             # 설정
│   │       │   ├── database.config.ts
│   │       │   └── index.ts
│   │       ├── utils/              # 유틸리티
│   │       │   ├── container.ts
│   │       │   └── index.ts
│   │       └── index.ts            # 모듈 진입점
│   ├── app.ts                      # Express 앱
│   └── server.ts                   # 서버 진입점
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔍 크롤링 상세 정보

### 크롤링 데이터 구조

```typescript
interface Product {
  id: string;                    // daangn:123456
  platform: string;              // daangn
  originalId: string;            // 123456
  title: string;                 // 상품 이름
  price: number;                 // 가격
  description: string;           // 상품 설명
  location: string;              // 지역
  originalUrl: string;           // 상품 링크
  imageUrls: string[];           // 상품 사진
  status: string;                // available | sold | reserved
  createdAt: string;             // 크롤링 시간
  updatedAt: string;             // 업데이트 시간
}
```

### Redis 키 구조

```
products:all                      # 전체 상품 (TTL: 24시간)
products:platform:daangn          # 플랫폼별 (TTL: 1시간)
products:location:서울특별시       # 지역별 (TTL: 1시간)
products:category:전자기기         # 카테고리별 (TTL: 1시간)
```

### 크롤링 로그 (PostgreSQL)

- 크롤링 시작/완료 시간
- 수집된 상품 수
- 에러 발생 횟수
- 소요 시간
- 에러 메시지

## ⚙️ 설정

### 크롤링 설정

`src/domain/crawling/service/crawling.service.ts`에서 다음 값을 조정할 수 있습니다:

```typescript
private readonly REQUEST_DELAY = 2000;     // 요청 간 딜레이 (ms)
private readonly MAX_RETRY = 3;            // 재시도 횟수

// 크롤링 대상 지역
private readonly DEFAULT_REGIONS = [
  '서울특별시',
  '경기도',
  '인천광역시',
  // ...
];
```

### Redis TTL 설정

`src/domain/crawling/repository/crawling.repository.ts`에서 TTL 값을 조정할 수 있습니다:

```typescript
private readonly TTL_24_HOURS = 24 * 60 * 60;  // 24시간
private readonly TTL_1_HOUR = 60 * 60;         // 1시간
```

## 🐛 문제 해결

### Puppeteer 설치 오류

```bash
# macOS에서 Puppeteer 의존성 설치
brew install chromium
```

### Redis 연결 오류

```bash
# Redis 실행 확인
redis-cli ping
# PONG 응답이 와야 함
```

### PostgreSQL 연결 오류

```bash
# PostgreSQL 실행 확인
psql -U postgres -c "SELECT version();"
```

## 📝 주의사항

1. **크롤링 윤리**: `robots.txt`를 준수하고 과도한 요청을 하지 마세요
2. **Rate Limiting**: 요청 간 딜레이를 충분히 설정하세요
3. **IP 차단**: 필요시 프록시를 사용하세요
4. **데이터 저장**: Redis는 휘발성이므로 중요한 데이터는 PostgreSQL에 백업하세요

## 📄 라이센스

ISC

