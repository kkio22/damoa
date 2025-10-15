# 🛒 당근마켓 지역(동) 기반 상품 크롤러

당근마켓에서 지역(동)별 중고 상품을 수집해서 Redis에 저장하는 Node.js 기반 크롤러입니다.

## 📋 프로젝트 개요

### 목적
당근마켓의 지역별 상품 데이터를 자동으로 수집하여 Redis에 캐싱

### 주요 기능
1. ✅ 지역 정보 수동 등록 (PostgreSQL)
2. ✅ 당근마켓 REST API로 상품 크롤링
3. ✅ Redis에 지역별로 저장 (`역삼동:items`)
4. ✅ 상품 검색 API 제공

---

## 🛠️ 기술 스택

- **백엔드**: Node.js + TypeScript + Express
- **데이터베이스**: PostgreSQL (지역 정보, 로그)
- **캐시**: Redis (상품 데이터)
- **크롤링**: Axios (당근마켓 REST API)
- **배포**: Docker + Docker Compose

---

## 🚀 빠른 시작

### 1. Docker 실행

```bash
# 환경변수 설정
cat > .env << 'EOF'
DB_PASSWORD=smarttrade2024
REACT_APP_API_URL=http://localhost:3000
EOF

# Docker 시작
docker-compose up -d --build && sleep 30
```

### 2. 테이블 생성

```bash
# PostgreSQL 접속
docker-compose exec postgres psql -U postgres -d smarttrade
```

SQL 실행:
```sql
CREATE TABLE IF NOT EXISTS areas (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

\q
```

### 3. 지역 등록

```bash
curl -X POST http://localhost:3000/api/areas/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "areas": [
      {"id": "6035", "name": "역삼동"},
      {"id": "6034", "name": "논현동"},
      {"id": "6033", "name": "압구정동"}
    ]
  }'
```

### 4. 크롤링 실행

```bash
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{"platform": "daangn", "locations": ["역삼동"]}'
```

### 5. 로그 확인

```bash
docker-compose logs -f backend
```

---

## 📊 데이터 구조

### PostgreSQL - areas 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(50) | 당근마켓 지역 ID (예: "6035") |
| name | VARCHAR(100) | 동 이름 (예: "역삼동") |
| created_at | TIMESTAMP | 생성 시간 |

### Redis 키 구조
```
역삼동:items → [{"title": "아이폰", "price": 500000, ...}, ...]
논현동:items → [{"title": "갤럭시", "price": 400000, ...}, ...]
압구정동:items → [...]
```

---

## 📡 API 엔드포인트

### 지역 관리
- `POST /api/areas` - 지역 추가
- `POST /api/areas/bulk` - 여러 지역 일괄 추가
- `GET /api/areas` - 전체 지역 조회
- `GET /api/areas/stats` - 통계
- `DELETE /api/areas/:id` - 지역 삭제

### 크롤링
- `POST /api/crawling/trigger` - 크롤링 실행
- `GET /api/crawling/status` - 상태 조회

### 상품 검색
- `GET /api/products/search` - 상품 검색
- `GET /api/products/stats` - 통계

---

## 📂 프로젝트 구조

```
backend/src/domain/crawling/
├── controller/        # API 컨트롤러
│   ├── area.controller.ts       # 지역 관리
│   ├── crawling.controller.ts   # 크롤링
│   └── product.controller.ts    # 상품 검색
├── repository/        # 데이터 저장소
│   ├── area.repository.ts       # PostgreSQL (지역)
│   ├── crawling.repository.ts   # Redis (상품)
│   └── crawling-log.repository.ts # PostgreSQL (로그)
├── service/           # 비즈니스 로직
│   ├── area.service.ts          # 지역 관리
│   └── crawling.service.ts      # 크롤링
├── routes/            # API 라우트
│   ├── area.routes.ts
│   ├── crawling.routes.ts
│   └── product.routes.ts
├── config/            # 설정
│   └── database.config.ts
├── types/             # 타입 정의
│   └── index.ts
└── utils/             # 유틸리티
    └── container.ts   # 의존성 주입
```

---

## 📝 지역 ID 찾는 방법

1. 당근마켓 웹사이트 접속
2. 원하는 지역 선택
3. 브라우저 개발자 도구 > Network 탭
4. URL 확인: `?in=역삼동-6035` → ID는 **6035**

---

## 🔧 주요 명령어

```bash
# Docker 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f backend

# Redis 확인
docker-compose exec redis redis-cli
KEYS *:items
GET 역삼동:items

# PostgreSQL 확인  
docker-compose exec postgres psql -U postgres -d smarttrade
SELECT * FROM areas;
\q

# Docker 중지
docker-compose down
```

---

## 📚 상세 가이드

**SIMPLE_GUIDE.md** - 전체 실행 가이드 참고

---

## 📄 라이센스

ISC
