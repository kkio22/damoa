# 📡 SmartTrade MVP API + UI 통합 명세서

---

## 프로젝트 개요

**SmartTrade MVP**의 핵심 기능인 상품 검색과 AI 분석에 집중한 API 명세와 UI 화면 정의를 통합합니다. 로그인/결제 없이 간단한 검색 기능만 제공합니다.

---

## 🔍 핵심 상품 검색 기능

### 기능: 상품 검색

**📡 API 명세**
- **URL**: POST /api/search
- **인증**: 불필요
- **요청 예시**:
```json
{
  "query": "아이폰 14",
  "filters": {
    "priceRange": {
      "min": 500000,
      "max": 1500000
    },
    "location": "강남구",
    "tradeMethod": "direct"
  },
  "limit": 20
}
```
- **응답 예시**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "daangn_123",
        "title": "아이폰 14 Pro 팝니다",
        "price": 1200000,
        "location": "강남구",
        "platform": "daangn",
        "imageUrl": "https://...",
        "originalUrl": "https://daangn.com/...",
        "createdAt": "2024-01-15T10:30:00Z",
        "status": "available",
        "relevanceScore": 0.95
      }
    ],
    "totalCount": 45,
    "searchTime": 1.2,
    "aiAnalysis": {
      "queryIntent": "스마트폰 구매",
      "suggestedKeywords": ["아이폰 14", "아이폰 13", "갤럭시 S23"],
      "priceTrend": "stable"
    }
  }
}
```
- **상태 코드**:
  - 200: 검색 성공
  - 400: 잘못된 요청
  - 500: 서버 오류

**🎨 UI 명세**
- **페이지**: / (메인 페이지)
- **주요 컴포넌트**:
  - SearchForm: 상품명 입력 및 필터 설정 폼
  - FilterPanel: 가격대, 지역, 거래방식 필터
  - ProductGrid: 검색 결과 그리드 레이아웃
  - ProductCard: 개별 상품 카드
  - LoadingSpinner: 검색 진행 중 스피너
- **상태 관리**:
  - `searchQuery`: 검색어
  - `filters`: 필터 조건
  - `products`: 검색 결과
  - `isLoading`: 검색 진행 중 상태
  - `aiAnalysis`: AI 분석 결과
- **UX 흐름**:
  1. 사용자가 상품명 입력
  2. 필터 조건 설정 (선택사항)
  3. 검색 버튼 클릭 또는 엔터키
  4. AI가 입력을 분석하여 관련 상품 검색
  5. 검색 결과를 카드 형태로 표시
  6. 상품 카드 클릭 시 원본 사이트로 새 탭에서 이동

---

## 🤖 AI 상품 분석 기능

### 기능: AI 상품 분석

**📡 API 명세**
- **URL**: POST /api/ai/analyze
- **인증**: 불필요
- **요청 예시**:
```json
{
  "query": "아이폰 14",
  "context": {
    "userLocation": "서울",
    "searchHistory": ["스마트폰", "전자제품"]
  }
}
```
- **응답 예시**:
```json
{
  "success": true,
  "data": {
    "analysis": {
      "queryIntent": "스마트폰 구매",
      "category": "electronics",
      "confidence": 0.92,
      "suggestedFilters": {
        "priceRange": {
          "min": 800000,
          "max": 1500000,
          "reason": "아이폰 14 시세 분석 결과"
        },
        "locations": ["강남구", "서초구", "송파구"],
        "reason": "서울 주요 거래 지역"
      },
      "relatedKeywords": [
        "아이폰 14 Pro",
        "아이폰 14 Plus",
        "아이폰 13",
        "갤럭시 S23"
      ],
      "marketInsights": {
        "priceTrend": "stable",
        "popularity": "high",
        "avgPrice": 1200000
      }
    }
  }
}
```

**🎨 UI 명세**
- **컴포넌트**: SearchForm 내 AI 분석 결과 표시
- **주요 컴포넌트**:
  - AIInsightCard: AI 분석 결과 카드
  - SuggestedFilters: AI 제안 필터
  - RelatedKeywords: 관련 키워드 태그
  - MarketInsights: 시장 인사이트 표시
- **상태 관리**:
  - `aiAnalysis`: AI 분석 결과
  - `isAnalyzing`: AI 분석 진행 중 상태
- **UX 흐름**:
  1. 사용자가 검색어 입력
  2. AI가 실시간으로 입력 내용 분석
  3. 분석 결과를 카드 형태로 표시
  4. 제안된 필터나 키워드 클릭 시 자동 적용
  5. 검색 실행 시 AI 분석 결과 반영

---

## 📊 데이터 수집 및 관리

### 기능: 크롤링 상태 조회

**📡 API 명세**
- **URL**: GET /api/system/status
- **인증**: 불필요
- **응답 예시**:
```json
{
  "success": true,
  "data": {
    "crawlingStatus": {
      "daangn": {
        "status": "running",
        "lastCrawled": "2024-01-15T10:30:00Z",
        "totalProducts": 150000,
        "newProducts": 1250
      },
      "joonggo": {
        "status": "running",
        "lastCrawled": "2024-01-15T10:25:00Z",
        "totalProducts": 200000,
        "newProducts": 1800
      },
      "bunjang": {
        "status": "running",
        "lastCrawled": "2024-01-15T10:20:00Z",
        "totalProducts": 300000,
        "newProducts": 2200
      }
    },
    "overallStatus": "healthy",
    "totalProducts": 650000,
    "lastUpdate": "2024-01-15T10:30:00Z"
  }
}
```

**🎨 UI 명세**
- **컴포넌트**: Footer 또는 별도 상태 페이지
- **주요 컴포넌트**:
  - StatusIndicator: 전체 상태 표시
  - PlatformStatus: 플랫폼별 상태 카드
  - LastUpdateTime: 마지막 업데이트 시간
- **상태 관리**:
  - `systemStatus`: 시스템 상태 데이터
- **UX 흐름**:
  1. 페이지 로드 시 시스템 상태 자동 조회
  2. 상태 정보를 Footer에 표시
  3. 정기적으로 상태 업데이트

---

## 🔄 공통 API 패턴

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "SEARCH_ERROR",
    "message": "검색 중 오류가 발생했습니다.",
    "details": {
      "query": "검색어가 너무 짧습니다."
    }
  }
}
```

### 검색 결과 형식
```json
{
  "success": true,
  "data": {
    "products": [...],
    "totalCount": 100,
    "searchTime": 1.5,
    "aiAnalysis": {...},
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Rate Limiting 헤더
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

## 🎨 UI 컴포넌트 상세 설계

### SearchForm 컴포넌트
```typescript
interface SearchFormProps {
  onSubmit: (searchData: SearchData) => void;
  isLoading: boolean;
  aiAnalysis?: AIAnalysis;
}

interface SearchData {
  query: string;
  filters: {
    priceRange?: { min: number; max: number };
    location?: string;
    tradeMethod?: string;
  };
}
```

### ProductCard 컴포넌트
```typescript
interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  platform: string;
  imageUrl: string;
  originalUrl: string;
  createdAt: string;
  status: 'available' | 'sold' | 'reserved';
  relevanceScore: number;
}
```

### FilterPanel 컴포넌트
```typescript
interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  suggestedFilters?: SuggestedFilters;
}

interface SearchFilters {
  priceRange: { min: number; max: number };
  location: string;
  tradeMethod: string;
}
```

---

## 📱 반응형 디자인

### 모바일 (320px - 768px)
- 검색 폼이 전체 너비로 표시
- 상품 카드가 1열로 배치
- 필터 패널이 모달로 표시

### 태블릿 (768px - 1024px)
- 검색 폼과 필터가 사이드바로 배치
- 상품 카드가 2열로 배치

### 데스크톱 (1024px+)
- 검색 폼이 상단에 고정
- 필터 패널이 좌측 사이드바
- 상품 카드가 3-4열로 배치

---

## 🚀 성능 최적화

### 프론트엔드 최적화
- **이미지 지연 로딩**: 상품 이미지 lazy loading
- **가상화**: 대량 검색 결과 가상 스크롤링
- **캐싱**: 검색 결과 브라우저 캐싱
- **디바운싱**: 검색어 입력 디바운싱 (300ms)

### 백엔드 최적화
- **Redis 캐싱**: 검색 결과 1시간 캐싱
- **인덱싱**: 상품 데이터베이스 인덱스 최적화
- **병렬 처리**: AI 분석 병렬 처리
- **CDN**: 정적 자원 CDN 배포