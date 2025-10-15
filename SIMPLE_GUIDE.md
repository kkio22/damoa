# 🚀 당근마켓 지역별 상품 크롤러 - 실행 가이드

## 📋 프로젝트 구조

```
당근마켓 REST API
    ↓
PostgreSQL (areas 테이블: id, name)
    ↓
크롤링 서비스
    ↓
Redis (지역명:items)
```

---

## ⚡ 빠른 시작 (5단계)

### 1️⃣ Docker 실행

```bash
# .env 파일 생성
cat > .env << 'EOF'
DB_PASSWORD=smarttrade2024
REACT_APP_API_URL=http://localhost:3000
EOF

# Docker 시작
docker-compose up -d --build

# 30초 대기
sleep 30
```

### 2️⃣ 테이블 생성

```bash
# PostgreSQL 접속
docker-compose exec postgres psql -U postgres -d smarttrade
```

아래 SQL 복사 붙여넣기:

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

### 3️⃣ 지역 정보 등록 (수동)

```bash
# Postman 또는 curl로 지역 추가
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

**예상 응답:**
```json
{
  "success": true,
  "total": 3,
  "inserted": 3,
  "message": "3개 지역이 추가되었습니다"
}
```

### 4️⃣ 지역 확인

```bash
# 저장된 지역 조회
curl http://localhost:3000/api/areas

# 통계
curl http://localhost:3000/api/areas/stats
```

### 5️⃣ 크롤링 실행!

```bash
# 전체 지역 크롤링 (DB에 저장된 모든 지역)
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{}'

# 또는 특정 지역만
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{"locations": ["역삼동", "논현동"]}'
```

### 6️⃣ 로그 확인

```bash
docker-compose logs -f backend
```

**예상 로그:**
```
📂 DB에서 지역 정보 로드 중...
✅ DB에서 3개 지역 로드 완료
📍 크롤링 대상 지역: 3개 동

🔍 역삼동 크롤링 시작...
  🆔 지역 ID: 6035
  🌐 URL: https://www.daangn.com/kr/buy-sell/?in=%EC%97%AD%EC%82%BC%EB%8F%99-6035&_data=...
  📦 API 응답: 50개 상품
✅ 역삼동: 50개 상품 수집

💾 Redis에 데이터 저장 중...
✅ Redis에 3개 지역별 상품 인덱싱 완료 (형식: 지역명:items)
```

### 7️⃣ Redis 확인

```bash
docker-compose exec redis redis-cli

# 키 확인
KEYS *:items

# 역삼동 상품 확인
GET 역삼동:items

exit
```

---

## 📡 API 엔드포인트

### 지역 관리 (/api/areas)

```bash
# 지역 추가 (단일)
POST /api/areas
Body: {"id": "6035", "name": "역삼동"}

# 지역 일괄 추가
POST /api/areas/bulk
Body: {"areas": [{"id": "6035", "name": "역삼동"}, ...]}

# 전체 지역 조회
GET /api/areas

# 통계
GET /api/areas/stats

# 지역 삭제
DELETE /api/areas/{id}
```

### 크롤링 (/api/crawling)

```bash
# 크롤링 트리거 (당근마켓 전용 - platform 불필요!)
POST /api/crawling/trigger
Body: {
  "locations": ["역삼동", "논현동"]  # 생략 시 DB의 모든 지역
}

# 상태 조회
GET /api/crawling/status
```

### 상품 검색 (/api/products)

```bash
# 상품 검색
GET /api/products/search?query=아이폰&location=역삼동

# 통계
GET /api/products/stats
```

---

## 🗄️ 데이터 구조

### PostgreSQL - areas 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(50) | 당근마켓 지역 ID (예: "6035") |
| name | VARCHAR(100) | 동 이름 (예: "역삼동") |
| created_at | TIMESTAMP | 생성 시간 |

### Redis 키 구조

```
역삼동:items → [상품1, 상품2, ...]
논현동:items → [상품3, 상품4, ...]
압구정동:items → [상품5, 상품6, ...]
```

---

## 📝 지역 ID 찾는 방법

1. 당근마켓 웹사이트 접속
2. 원하는 지역 선택
3. 브라우저 개발자 도구 > Network 탭
4. URL에서 확인: `?in=역삼동-6035` → ID는 **6035**

---

## 🎯 확장 방법

### 더 많은 지역 추가

```bash
curl -X POST http://localhost:3000/api/areas/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "areas": [
      {"id": "6036", "name": "청담동"},
      {"id": "6037", "name": "삼성동"},
      {"id": "6038", "name": "대치동"}
    ]
  }'
```

### 전체 지역 크롤링

```bash
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🐛 문제 해결

### 컨테이너 재시작

```bash
docker-compose restart backend
```

### 로그 확인

```bash
docker-compose logs backend | tail -100
```

### 데이터 초기화

```bash
# Redis 초기화
docker-compose exec redis redis-cli FLUSHALL

# PostgreSQL 지역 초기화
docker-compose exec postgres psql -U postgres -d smarttrade -c "DELETE FROM areas;"
```

---

**시작하세요!** 🚀

