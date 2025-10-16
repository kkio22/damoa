# 🕷️ Damoa 크롤링 가이드

## 📌 개요

Damoa는 **플랫폼 기반**으로 중고 거래 데이터를 수집합니다.
- Redis 저장 키: `{platform}:items` (예: `daangn:items`)
- 지역 정보는 PostgreSQL에 저장하여 크롤링 시 활용

---

## 🎯 크롤링 플로우

```
1. 지역 정보를 DB에 등록 (POST /api/areas/bulk)
   ↓
2. 크롤링 실행 (POST /api/crawling/trigger)
   ↓
3. 각 지역별로 당근마켓 API 호출
   ↓
4. 모든 상품을 모아서 플랫폼 단위로 Redis 저장 (daangn:items)
   ↓
5. 검색 API에서 Redis에서 조회
```

---

## 📡 API 사용법

### 1️⃣ 지역 정보 등록

당근마켓 크롤링을 위해서는 먼저 지역 정보를 DB에 저장해야 합니다.

#### 단일 지역 추가
```bash
POST http://34.10.16.64:8080/api/areas
Content-Type: application/json

{
  "id": "6035",
  "name": "역삼동"
}
```

#### 여러 지역 일괄 추가 (추천!)
```bash
POST http://34.10.16.64:8080/api/areas/bulk
Content-Type: application/json

{
  "areas": [
    { "id": "6035", "name": "역삼동" },
    { "id": "6036", "name": "논현동" },
    { "id": "6037", "name": "삼성동" },
    { "id": "6038", "name": "청담동" },
    { "id": "6039", "name": "대치동" }
  ]
}
```

**응답:**
```json
{
  "success": true,
  "inserted": 5,
  "skipped": 0,
  "message": "5개 지역이 추가되었습니다"
}
```

#### 등록된 지역 확인
```bash
GET http://34.10.16.64:8080/api/areas
```

---

### 2️⃣ 당근마켓 크롤링 실행

#### 전체 지역 크롤링
```bash
POST http://34.10.16.64:8080/api/crawling/trigger
Content-Type: application/json

{
  "locations": []
}
```

#### 특정 지역만 크롤링
```bash
POST http://34.10.16.64:8080/api/crawling/trigger
Content-Type: application/json

{
  "locations": ["역삼동", "논현동"]
}
```

**응답:**
```json
{
  "success": true,
  "message": "크롤링이 완료되었습니다",
  "data": {
    "totalProducts": 156,
    "locations": ["역삼동", "논현동", "삼성동"],
    "duration": 12
  }
}
```

**⚠️ 주의사항:**
- 크롤링은 시간이 걸립니다 (지역당 2-5초)
- Postman Timeout을 5분 이상으로 설정하세요
- 한 번에 너무 많은 지역을 크롤링하지 마세요 (Rate Limiting 방지)

---

### 3️⃣ Redis 데이터 확인

#### 통계 확인
```bash
GET http://34.10.16.64:8080/api/crawling/stats
```

**응답:**
```json
{
  "success": true,
  "data": {
    "totalPlatforms": 1,
    "totalProducts": 156,
    "platforms": {
      "daangn": 156
    }
  }
}
```

#### 전체 상품 조회
```bash
GET http://34.10.16.64:8080/api/crawling/products
```

---

## 🔑 Redis 키 구조

### 이전 (지역 기반) ❌
```
역삼동:items → [Product, Product, ...]
논현동:items → [Product, Product, ...]
삼성동:items → [Product, Product, ...]
```

### 현재 (플랫폼 기반) ✅
```
daangn:items → [Product, Product, Product, ...]  // 모든 지역의 당근마켓 상품
bungae:items → [...]  // 향후 번개장터 추가 시
joongna:items → [...]  // 향후 중고나라 추가 시
```

**장점:**
- 플랫폼별로 데이터 관리가 용이
- 검색 API에서 전체 상품 조회 시 효율적
- 향후 다른 플랫폼 추가 시 확장성 좋음

---

## 🗂️ 데이터 구조

### Product 타입
```typescript
{
  id: "daangn:12345",           // 플랫폼:원본ID
  platform: "daangn",            // 플랫폼
  originalId: "12345",           // 원본 상품 ID
  title: "아이폰 14 프로",       // 상품명
  price: 1200000,                // 가격
  description: "...",            // 설명
  location: "역삼동",            // 지역 (당근마켓 크롤링 시 필요)
  originalUrl: "https://...",    // 원본 URL
  imageUrls: ["https://..."],    // 이미지 URL들
  status: "available",           // 상태 (available/sold/reserved)
  createdAt: "2025-01-15T...",   // 생성일
  updatedAt: "2025-01-15T..."    // 수정일
}
```

---

## 🛠️ 당근마켓 지역 ID 찾는 방법

### 방법 1: 브라우저에서 직접 확인
1. https://www.daangn.com 접속
2. 지역 선택 후 중고거래 페이지 이동
3. URL 확인: `https://www.daangn.com/kr/buy-sell/?in=역삼동-6035`
4. `6035`가 지역 ID

### 방법 2: 네트워크 탭에서 확인
1. 개발자 도구 (F12) → Network 탭
2. 당근마켓에서 지역 선택
3. API 요청 확인
4. Request Payload에서 `region_id` 확인

---

## 🚀 빠른 시작 예제

### Postman Collection

#### 1. 지역 등록
```http
POST http://34.10.16.64:8080/api/areas/bulk
Content-Type: application/json

{
  "areas": [
    { "id": "6035", "name": "역삼동" },
    { "id": "6036", "name": "논현동" }
  ]
}
```

#### 2. 크롤링 실행
```http
POST http://34.10.16.64:8080/api/crawling/trigger
Content-Type: application/json

{
  "locations": ["역삼동", "논현동"]
}
```

#### 3. 결과 확인
```http
GET http://34.10.16.64:8080/api/crawling/stats
GET http://34.10.16.64:8080/api/search
```

---

## 📝 추가 플랫폼 추가 시

향후 번개장터나 중고나라 등 다른 플랫폼을 추가할 때:

1. 새로운 크롤링 서비스 생성 (예: `crawlBungae()`)
2. `saveProductsByPlatform('bungae', products)` 호출
3. Redis에 `bungae:items`로 저장
4. 검색 API는 자동으로 모든 플랫폼 데이터 조회

```typescript
// 예시
await this.crawlingRepo.saveProductsByPlatform('bungae', products);
await this.crawlingRepo.saveProductsByPlatform('joongna', products);
```

---

## 🔧 문제 해결

### 크롤링이 실패하는 경우
1. 지역 정보가 DB에 없는 경우 → `/api/areas/bulk`로 먼저 등록
2. 당근마켓 API 변경 → URL 및 파싱 로직 확인
3. Rate Limiting → 요청 간격 조정 (현재 2초)

### Redis 데이터가 없는 경우
1. 크롤링이 완료되었는지 확인
2. `/api/crawling/stats`로 통계 확인
3. Redis 연결 상태 확인

---

## 📊 모니터링

### 크롤링 로그 확인
```bash
GET http://34.10.16.64:8080/api/system/logs
```

### Redis 메모리 사용량
```bash
GET http://34.10.16.64:8080/api/system/health
```

---

## ✨ 요약

1. **지역 정보 등록**: `POST /api/areas/bulk`
2. **크롤링 실행**: `POST /api/crawling/trigger`
3. **데이터 확인**: `GET /api/crawling/stats`
4. **Redis 구조**: `{platform}:items` (예: `daangn:items`)
5. **검색 사용**: 기존 검색 API 그대로 사용 가능!

이제 Postman으로 데이터를 쉽게 긁어올 수 있습니다! 🎉

