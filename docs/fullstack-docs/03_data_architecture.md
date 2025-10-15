# 🗄️ SmartTrade MVP 데이터 아키텍처 통합 설계서

---

## 프로젝트 개요

**SmartTrade MVP**의 데이터베이스 설계와 프론트엔드 상태 관리를 통합하여 정의합니다. 로그인/결제 없이 핵심 검색 기능에 집중한 간단한 구조로 설계되었습니다. PostgreSQL을 메인 데이터베이스로, Redis를 캐시 저장소로 활용하며, 프론트엔드는 간단한 상태 관리로 구현합니다.

---

## 🗄️ 데이터베이스 설계

### 📊 PostgreSQL 메인 데이터베이스

> **MVP 설계 변경**: 크롤링된 상품 데이터는 PostgreSQL에 영구 저장하지 않고 Redis 캐싱만 사용합니다. 매일 자정에 전체 데이터를 새로 크롤링하여 Redis를 갱신하는 방식으로 단순화했습니다.

#### 테이블: search_logs
- 설명: 검색 로그 테이블 (분석용)

| 컬럼명         | 타입           | 제약조건                    | 설명                    |
|----------------|----------------|----------------------------|-------------------------|
| id             | BIGINT         | PK, Auto Increment         | 검색 로그 ID            |
| query          | VARCHAR(500)   | NOT NULL                   | 검색어                  |
| filters        | JSON           | NULL                       | 적용된 필터 조건        |
| result_count   | INTEGER        | DEFAULT 0                  | 검색 결과 수            |
| search_time    | DECIMAL(5,2)   | NULL                       | 검색 소요 시간 (초)     |
| ai_analysis    | JSON           | NULL                       | AI 분석 결과            |
| user_ip        | VARCHAR(45)    | NULL                       | 사용자 IP (익명화)      |
| user_agent     | TEXT           | NULL                       | 사용자 에이전트         |
| created_at     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP  | 검색 시간               |

#### 테이블: crawling_logs
- 설명: 크롤링 작업 로그 테이블

| 컬럼명         | 타입           | 제약조건                    | 설명                    |
|----------------|----------------|----------------------------|-------------------------|
| id             | BIGINT         | PK, Auto Increment         | 로그 ID                 |
| platform       | VARCHAR(50)    | NOT NULL                   | 플랫폼명                 |
| status         | VARCHAR(50)    | NOT NULL                   | 크롤링 상태             |
| total_products | INTEGER        | DEFAULT 0                  | 총 상품 수              |
| new_products   | INTEGER        | DEFAULT 0                  | 신규 상품 수            |
| updated_products| INTEGER       | DEFAULT 0                  | 업데이트된 상품 수      |
| error_count    | INTEGER        | DEFAULT 0                  | 에러 수                 |
| duration       | INTEGER        | NULL                       | 크롤링 소요 시간 (초)    |
| error_message  | TEXT           | NULL                       | 에러 메시지             |
| started_at     | TIMESTAMP      | NOT NULL                   | 시작 시간               |
| completed_at   | TIMESTAMP      | NULL                       | 완료 시간               |

### 🔗 테이블 관계도

```
search_logs (독립 테이블)
crawling_logs (독립 테이블)
```

> **설계 변경**: products 테이블을 제거하고 Redis만 사용하므로 테이블 간 관계가 단순화되었습니다.

### 📈 인덱스 설계

```sql
-- 검색 로그 최적화를 위한 인덱스
CREATE INDEX idx_search_logs_query ON search_logs(query);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX idx_search_logs_result_count ON search_logs(result_count);

-- 크롤링 로그 최적화를 위한 인덱스
CREATE INDEX idx_crawling_logs_platform ON crawling_logs(platform);
CREATE INDEX idx_crawling_logs_started_at ON crawling_logs(started_at);
CREATE INDEX idx_crawling_logs_status ON crawling_logs(status);
```

> **설계 변경**: products 테이블 관련 인덱스를 제거하고 로그 테이블에만 집중했습니다.

---

## 🚀 Redis 캐시 설계

> **MVP 핵심 설계**: 모든 상품 데이터는 Redis에만 저장되며, 매일 자정에 전체 데이터를 새로 크롤링하여 갱신합니다.

### 📦 캐시 키 구조

#### 상품 데이터 캐싱 (메인 저장소)
```
products:all → 전체 상품 데이터 (TTL: 24시간, 매일 자정 갱신)
products:search:{hash} → 검색 결과 캐시 (TTL: 1시간)
products:category:{category} → 카테고리별 상품 목록 (TTL: 1시간)
products:location:{location} → 지역별 상품 목록 (TTL: 1시간)
products:platform:{platform} → 플랫폼별 상품 목록 (TTL: 1시간)
products:popular → 인기 상품 목록 (TTL: 30분)
```

#### 상품 상세 정보 캐싱
```
product:detail:{platform}:{id} → 개별 상품 상세 정보 (TTL: 2시간)
product:images:{platform}:{id} → 상품 이미지 정보 (TTL: 4시간)
```

#### AI 분석 캐싱
```
ai:analysis:{query_hash} → AI 분석 결과 (TTL: 2시간)
ai:suggestions:{category} → 카테고리별 추천 키워드 (TTL: 1일)
ai:trends → 시장 트렌드 분석 (TTL: 1시간)
```

#### 시스템 캐싱
```
system:crawling:status → 크롤링 상태 정보 (TTL: 5분)
system:categories → 전체 카테고리 목록 (TTL: 1일)
system:locations → 전체 지역 목록 (TTL: 1일)
system:stats → 시스템 통계 (TTL: 10분)
```

### 🔄 캐시 전략

#### 일일 전체 갱신 전략
```typescript
interface DailyRefreshStrategy {
  // 매일 자정 실행
  schedule: '0 0 * * *';
  
  // 전체 데이터 갱신 프로세스
  refreshProcess: {
    step1: '기존 Redis 데이터 백업';
    step2: '새로운 크롤링 데이터 수집';
    step3: '데이터 정제 및 검증';
    step4: 'Redis 전체 교체';
    step5: '검색 인덱스 재구성';
  };
  
  // 백업 및 롤백
  backupStrategy: {
    keepBackup: '24시간';
    rollbackOnError: true;
  };
}
```

#### Write-Through 캐싱 (제거)
> **설계 변경**: PostgreSQL에 상품 데이터를 저장하지 않으므로 Write-Through 캐싱이 불필요합니다.

#### Read-Only 캐싱
- 모든 상품 데이터는 Redis에서만 조회
- 캐시 미스 시 크롤링 API를 통해 실시간 데이터 수집
- 검색 결과는 별도 캐시 키로 저장하여 성능 최적화

---

## 🎨 프론트엔드 상태 관리

### 📱 전역 상태 (Zustand)

#### 검색 상태 관리
```typescript
interface SearchState {
  // 검색 관련
  searchQuery: string;
  filters: SearchFilters;
  products: Product[];
  aiAnalysis: AIAnalysis | null;
  
  // UI 상태
  isLoading: boolean;
  isAnalyzing: boolean;
  searchTime: number;
  totalCount: number;
  
  // 액션
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  searchProducts: (params: SearchParams) => Promise<void>;
  clearSearch: () => void;
  analyzeQuery: (query: string) => Promise<void>;
}

interface SearchFilters {
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  tradeMethod: string;
}

interface Product {
  id: string;
  platform: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  originalUrl: string;
  createdAt: string;
  status: 'available' | 'sold' | 'reserved';
  relevanceScore: number;
}

interface AIAnalysis {
  queryIntent: string;
  category: string;
  confidence: number;
  suggestedFilters: {
    priceRange: { min: number; max: number; reason: string };
    locations: string[];
    reason: string;
  };
  relatedKeywords: string[];
  marketInsights: {
    priceTrend: string;
    popularity: string;
    avgPrice: number;
  };
}
```

#### 시스템 상태 관리
```typescript
interface SystemState {
  // 시스템 정보
  crawlingStatus: CrawlingStatus;
  systemStats: SystemStats;
  
  // UI 상태
  isLoading: boolean;
  lastUpdate: string | null;
  
  // 액션
  fetchSystemStatus: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

interface CrawlingStatus {
  daangn: PlatformStatus;
  joonggo: PlatformStatus;
  bunjang: PlatformStatus;
  overallStatus: 'healthy' | 'warning' | 'error';
  totalProducts: number;
  lastUpdate: string;
}

interface PlatformStatus {
  status: 'running' | 'stopped' | 'error';
  lastCrawled: string;
  totalProducts: number;
  newProducts: number;
  errorCount: number;
}
```

### 🎯 로컬 상태 관리

#### 폼 상태 관리 (React Hook Form)
```typescript
// 검색 폼
interface SearchFormData {
  query: string;
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  tradeMethod: string;
}

// 필터 폼
interface FilterFormData {
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  tradeMethod: string;
  category: string;
}
```

#### 모달 상태 관리
```typescript
interface ModalState {
  // 모달 타입별 상태
  isFilterModalOpen: boolean;
  isProductDetailModalOpen: boolean;
  isSystemStatusModalOpen: boolean;
  
  // 모달 데이터
  modalData: any;
  
  // 액션
  openModal: (type: ModalType, data?: any) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;
}
```

#### 페이지네이션 상태 관리
```typescript
interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  
  // 액션
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (count: number) => void;
}
```

### 🔄 상태 동기화 전략

#### 서버 상태 동기화 (React Query)
```typescript
// 상품 검색 쿼리
const useProductSearch = (params: SearchParams) => {
  return useQuery({
    queryKey: ['products', 'search', params],
    queryFn: () => searchProducts(params),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
    enabled: !!params.query, // 검색어가 있을 때만 실행
  });
};

// AI 분석 쿼리
const useAIAnalysis = (query: string) => {
  return useQuery({
    queryKey: ['ai', 'analysis', query],
    queryFn: () => analyzeQuery(query),
    staleTime: 30 * 60 * 1000, // 30분
    enabled: query.length > 2, // 2글자 이상일 때만 실행
  });
};

// 시스템 상태 쿼리
const useSystemStatus = () => {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: fetchSystemStatus,
    staleTime: 1 * 60 * 1000, // 1분
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
  });
};
```

---

## 🔧 데이터 처리 파이프라인

### 📥 데이터 수집 (크롤링)
```typescript
interface CrawlingPipeline {
  // 1. 스케줄링 (매일 자정)
  schedule: '0 0 * * *'; // 매일 자정 실행
  
  // 2. 플랫폼별 크롤링
  platforms: ['daangn', 'joonggo', 'bunjang'];
  
  // 3. 데이터 정제
  dataCleaning: {
    removeDuplicates: true;
    validatePrice: true;
    normalizeLocation: true;
    extractCategories: true;
    validateImages: true;
  };
  
  // 4. Redis 전체 교체
  redisUpdate: {
    backupExisting: true;
    replaceAllData: true;
    rebuildIndexes: true;
    updateStats: true;
  };
}
```

### 🔄 데이터 동기화
```typescript
interface DataSyncStrategy {
  // Redis 단일 저장소 전략
  singleSource: {
    primaryStorage: 'Redis';
    backupStorage: 'Redis Backup';
    noPostgreSQL: true;
  };
  
  // 캐시 무효화 전략
  cacheInvalidation: {
    dailyRefresh: 'invalidateAllProductCache';
    searchCache: 'invalidateSearchResults';
    categoryCache: 'invalidateCategoryIndex';
    systemStatusChange: 'invalidateStatusCache';
  };
}
```

---

## 📊 성능 최적화

### 🚀 쿼리 최적화
```sql
-- 검색 로그 최적화를 위한 인덱스
CREATE INDEX idx_search_logs_query_time ON search_logs(query, created_at DESC);
CREATE INDEX idx_search_logs_result_analysis ON search_logs(result_count, search_time);

-- 크롤링 로그 최적화를 위한 인덱스
CREATE INDEX idx_crawling_logs_platform_time ON crawling_logs(platform, started_at DESC);
CREATE INDEX idx_crawling_logs_status_duration ON crawling_logs(status, duration);
```

> **설계 변경**: PostgreSQL에는 상품 데이터가 없으므로 Redis 기반 검색 최적화에 집중합니다.

### 💾 캐시 최적화
```typescript
// Redis 기반 캐시 최적화 전략 (사용자 행동 패턴 고려)
const redisCacheStrategy = {
  // 메인 상품 데이터 (24시간 유지 - 매일 갱신)
  mainProductData: '24h',
  
  // 검색 결과 캐싱
  searchResults: '1h',
  
  // 카테고리별 상품 캐싱
  categoryProducts: '1h',
  
  // AI 분석 결과 캐싱
  aiAnalysis: '2h',
  
  // 시스템 상태 캐싱
  systemStatus: '5m',
  
  // 인기 상품 캐싱
  popularProducts: '30m',
};
```

### 🔍 검색 최적화
```typescript
// Redis 기반 검색 최적화 전략
const redisSearchOptimization = {
  // 검색어 전처리
  queryPreprocessing: {
    removeSpecialChars: true,
    normalizeSpacing: true,
    extractKeywords: true,
    generateSearchHash: true,
  },
  
  // Redis 검색 전략
  redisSearchStrategy: {
    useSortedSets: true, // 가격별 정렬
    useHashMaps: true,   // 상품 상세 정보
    useSets: true,       // 카테고리별 그룹핑
    useLists: true,      // 시간순 정렬
  },
  
  // 결과 제한
  resultLimits: {
    maxResults: 100,
    defaultLimit: 20,
    paginationSize: 20,
  },
  
  // 캐시 우선 조회
  cacheFirst: true,
  fallbackToCrawling: false, // Redis에 모든 데이터가 있음
};
```

---

## 🛡️ 데이터 보안 및 개인정보 보호

### 🔒 개인정보 보호
```typescript
// 검색 로그 익명화
interface AnonymousSearchLog {
  query: string;
  filters: SearchFilters;
  resultCount: number;
  searchTime: number;
  // 개인정보 제외
  // userIp: 해시화 또는 제거
  // userAgent: 일반화
  createdAt: string;
}
```

### 🛡️ 데이터 무결성
```sql
-- 검색 로그 데이터 검증을 위한 체크 제약조건
ALTER TABLE search_logs ADD CONSTRAINT chk_result_count_positive CHECK (result_count >= 0);
ALTER TABLE search_logs ADD CONSTRAINT chk_search_time_positive CHECK (search_time >= 0);

-- 크롤링 로그 데이터 검증을 위한 체크 제약조건
ALTER TABLE crawling_logs ADD CONSTRAINT chk_total_products_positive CHECK (total_products >= 0);
ALTER TABLE crawling_logs ADD CONSTRAINT chk_new_products_positive CHECK (new_products >= 0);
ALTER TABLE crawling_logs ADD CONSTRAINT chk_duration_positive CHECK (duration >= 0);
```

> **설계 변경**: 상품 데이터는 Redis에만 저장되므로 PostgreSQL 제약조건은 로그 테이블에만 적용합니다.

이 데이터 아키텍처는 SmartTrade MVP의 핵심 기능인 상품 검색과 AI 분석을 효율적으로 지원하며, 간단하고 확장 가능한 구조로 설계되었습니다.