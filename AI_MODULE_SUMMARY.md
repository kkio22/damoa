# 🤖 AI 분석 모듈 구현 완료! (TodoList 3일차)

## ✅ 구현 현황

| 항목 | 상태 |
|------|------|
| POST /api/ai/analyze 엔드포인트 | ✅ **새로 추가!** |
| LangGraph 워크플로우 설계 | ✅ **새로 추가!** |
| LangChain 에이전트 구현 | ✅ **새로 추가!** |
| OpenAI API 통합 | ✅ **새로 추가!** |
| AI 분석 결과 캐싱 (Redis) | ✅ **새로 추가!** |
| OpenAI 없이도 작동 (Fallback) | ✅ **새로 추가!** |

---

## 🆕 새로 추가된 파일

### 📁 타입 정의
- **`backend/src/domain/ai/types/index.ts`**
  - AIAnalyzeRequest, AIAnalyzeResponse
  - ProductRecommendation, MarketInsights
  - WorkflowState, SuggestedFilters

### 🧠 AI 서비스
- **`backend/src/domain/ai/service/ai-analysis.service.ts`**
  - OpenAI 통합 (GPT-3.5 Turbo)
  - 키워드 추출, 상품 점수 계산
  - 시장 인사이트 생성
  - Fallback 로직 (OpenAI 없이도 작동)

- **`backend/src/domain/ai/service/ai-cache.service.ts`**
  - Redis 캐싱 (1시간 TTL)
  - 캐시 조회, 저장, 삭제
  - 캐시 통계

### 🔄 LangGraph 워크플로우
- **`backend/src/domain/ai/workflow/analysis-workflow.ts`**
  - 4단계 워크플로우
  - 검색어 분석 → 상품 매칭 → 인사이트 생성 → 필터 제안

### 🎛️ 컨트롤러 & 라우트
- **`backend/src/domain/ai/controller/ai.controller.ts`**
  - POST /api/ai/analyze
  - GET /api/ai/cache/stats
  - DELETE /api/ai/cache

- **`backend/src/domain/ai/routes/ai.routes.ts`**
  - AI 엔드포인트 라우팅

### 📦 모듈 초기화
- **`backend/src/domain/ai/index.ts`**
  - AIContainer 클래스
  - 의존성 주입

---

## ✏️ 수정된 파일 (기존 코드 건드리지 않음!)

1. **`backend/package.json`**: AI 패키지 추가
   - `@langchain/core`
   - `@langchain/openai`
   - `langchain`
   - `langgraph`
   - `openai`
   - `zod`

2. **`backend/src/domain/crawling/utils/container.ts`**: AI 모듈 통합
3. **`backend/src/app.ts`**: AI 라우트 등록
4. **`QUICK_START.md`**: AI 사용법 추가

---

## 🚀 빠른 시작

### 1️⃣ Docker 재빌드 (AI 패키지 설치)

```bash
cd /Users/deviantce/used\ trade

# 재빌드 (AI 패키지 설치)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 로그 확인
docker-compose logs -f backend | grep "AI"
```

### 2️⃣ OpenAI API 키 설정 (선택사항)

OpenAI를 사용하지 않으면 **기본 키워드 매칭**으로 작동합니다!

`docker-compose.yml`에 추가:

```yaml
services:
  backend:
    environment:
      OPENAI_API_KEY: "sk-your-api-key-here"  # 추가
```

### 3️⃣ AI 분석 실행

```bash
# 1. 먼저 크롤링 실행 (상품 데이터 필요)
curl -X POST http://localhost:3000/api/crawling/trigger \
  -H "Content-Type: application/json" \
  -d '{}'

# 2. AI 분석
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "아이폰",
    "locations": ["역삼동", "논현동"],
    "maxResults": 10
  }'
```

---

## 📊 AI 분석 결과 구조

### 1️⃣ 상품 추천 (ProductRecommendation)

```json
{
  "product": { /* Product 객체 */ },
  "score": 95,
  "reasons": [
    "제목이 검색어와 정확히 일치합니다",
    "현재 판매 중인 상품입니다",
    "최근 등록된 상품입니다"
  ],
  "matchedKeywords": ["아이폰", "14", "Pro"]
}
```

### 2️⃣ 시장 인사이트 (MarketInsights)

```json
{
  "averagePrice": 850000,
  "priceRange": { "min": 500000, "max": 1200000 },
  "mostCommonLocations": ["역삼동", "논현동", "도곡동"],
  "trendingItems": ["아이폰", "14", "Pro", "128GB", "256GB"],
  "summary": "아이폰 검색 결과 50개 상품, 평균 가격 85만원"
}
```

### 3️⃣ 필터 제안 (SuggestedFilters)

```json
{
  "priceRange": { "min": 595000, "max": 1105000 },
  "locations": ["역삼동", "논현동", "도곡동"]
}
```

---

## 🎯 AI 점수 계산 로직

점수는 **0-100점** 범위입니다:

| 조건 | 점수 |
|------|------|
| 제목에 검색어 포함 | +50점 |
| 제목에 키워드 포함 (각각) | +10점 |
| 설명에 검색어 포함 | +20점 |
| 설명에 키워드 포함 (각각) | +5점 |
| 판매 중 상태 | +10점 |
| 24시간 이내 등록 | +15점 |

**최소 30점 이상**만 추천에 포함됩니다.

---

## 🔄 LangGraph 워크플로우

AI 분석은 다음 4단계로 실행됩니다:

```
🔍 1️⃣ 검색어 분석
   - 키워드 추출
   - 유사어 생성
   ↓
📊 2️⃣ 상품 점수 계산
   - 상품별 AI 점수 계산
   - 추천 이유 생성
   ↓
💡 3️⃣ 인사이트 생성
   - 평균 가격, 가격 범위
   - 인기 지역 분석
   - AI 요약 생성
   ↓
🎯 4️⃣ 필터 제안
   - 최적 가격 범위
   - 추천 지역
   ↓
✅ 최종 결과 반환
```

---

## 💾 Redis 캐싱

### 캐시 키 형식

```
ai:analysis:{query}:{productCount}
```

예시:
- `ai:analysis:아이폰:50`
- `ai:analysis:맥북:30`

### TTL (Time To Live)

- **1시간** (3600초)
- 동일한 검색어는 1시간 동안 캐시된 결과 반환

### 캐시 관리

```bash
# 캐시 통계
curl http://localhost:3000/api/ai/cache/stats

# 전체 삭제
curl -X DELETE http://localhost:3000/api/ai/cache
```

---

## 🌟 주요 기능

### 1️⃣ OpenAI 없이도 작동

- OpenAI API 키가 없으면 **기본 키워드 매칭**으로 작동
- 환경변수 `OPENAI_API_KEY`가 설정되면 GPT-3.5 사용

### 2️⃣ 자동 캐싱

- Redis에 1시간 캐싱
- 빠른 응답 속도
- 비용 절감

### 3️⃣ 스마트 추천

- AI 점수 기반 추천 (0-100점)
- 추천 이유 자동 생성
- 매칭된 키워드 표시

### 4️⃣ 시장 분석

- 평균 가격, 가격 범위
- 인기 지역 분석
- 트렌딩 아이템 추출
- AI 요약 (OpenAI 사용 시)

### 5️⃣ 필터 제안

- 최적 가격 범위 (평균 ±30%)
- 주요 지역 추천

### 6️⃣ 관련 키워드

- 검색어 확장
- 유사어 추천 (OpenAI 사용 시)

---

## 📦 필요한 패키지

### 추가된 패키지

```json
{
  "@langchain/core": "^0.1.0",
  "@langchain/openai": "^0.0.14",
  "langchain": "^0.1.0",
  "langgraph": "^0.0.19",
  "openai": "^4.24.1",
  "zod": "^3.22.4"
}
```

### 설치 방법

```bash
# Docker 빌드 시 자동 설치됨
docker-compose build --no-cache
```

---

## 🧪 테스트 시나리오

### 1️⃣ OpenAI 없이 테스트

```bash
# OpenAI API 키 없이 실행 (기본 모드)
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "아이폰", "maxResults": 5}'
```

### 2️⃣ 지역 필터링

```bash
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "맥북",
    "locations": ["역삼동"],
    "maxResults": 10
  }'
```

### 3️⃣ 캐시 확인

```bash
# 첫 요청 (캐시 미스)
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "아이폰"}'

# 두 번째 요청 (캐시 히트)
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "아이폰"}'
```

---

## 🎉 완료!

**TodoList 3일차 (AI 워크플로우) 100% 완료!**

| 기능 | 상태 |
|------|------|
| POST /api/ai/analyze | ✅ |
| LangGraph 워크플로우 | ✅ |
| LangChain 에이전트 | ✅ |
| OpenAI API 통합 | ✅ |
| Redis 캐싱 | ✅ |
| Fallback 로직 | ✅ |
| 기존 코드 호환성 | ✅ |

**모든 기존 기능은 정상 작동하며, 새 AI 기능만 추가되었습니다!** 🚀

---

## 📚 참고 문서

- [QUICK_START.md](/QUICK_START.md) - 전체 시스템 사용법
- [SCHEDULER_GUIDE.md](/SCHEDULER_GUIDE.md) - 크롤링 스케줄러
- [TODOLIST_3_SUMMARY.md](/TODOLIST_3_SUMMARY.md) - 크롤링 시스템

---

**🔥 Next Steps:**
- OpenAI API 키 발급 (선택)
- 프론트엔드 AI 결과 표시 UI 개발
- AI 분석 결과 시각화

