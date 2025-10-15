/**
 * 크롤링 관련 타입 정의
 */

// 플랫폼 타입
export type Platform = 'daangn' | 'joonggo' | 'bunjang';

// 상품 상태
export type ProductStatus = 'available' | 'sold' | 'reserved';

// 크롤링 상태
export type CrawlingStatus = 'pending' | 'running' | 'completed' | 'failed';

// 거래 방식
export type TradeMethod = 'direct' | 'delivery' | 'both';

/**
 * 크롤링된 상품 데이터 구조
 */
export interface Product {
  id: string;                    // 상품 고유 ID (platform:originalId)
  platform: Platform;            // 플랫폼명
  originalId: string;            // 원본 사이트 상품 ID
  title: string;                 // 상품 이름
  price: number;                 // 가격
  description: string;           // 상품 설명
  location: string;              // 지역
  originalUrl: string;           // 상품 링크
  imageUrls: string[];           // 상품 사진 (배열)
  status: ProductStatus;         // 상품 상태
  tradeMethod?: TradeMethod;     // 거래 방식
  category?: string;             // 카테고리
  createdAt: string;             // 크롤링 시간
  updatedAt: string;             // 업데이트 시간
}

/**
 * 크롤링 파라미터
 */
export interface CrawlingParams {
  platform: Platform;            // 크롤링할 플랫폼
  locations?: string[];          // 크롤링할 지역 목록
  maxPages?: number;             // 최대 페이지 수
  delay?: number;                // 요청 간격 (ms)
}

/**
 * 크롤링 결과
 */
export interface CrawlingResult {
  platform: Platform;
  status: CrawlingStatus;
  totalProducts: number;
  newProducts: number;
  updatedProducts: number;
  errorCount: number;
  duration: number;              // 소요 시간 (초)
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * 크롤링 로그 (PostgreSQL 저장용)
 */
export interface CrawlingLog {
  id?: number;
  platform: string;
  status: string;
  totalProducts: number;
  newProducts: number;
  updatedProducts: number;
  errorCount: number;
  duration: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Redis에 저장될 전체 상품 데이터 구조
 */
export interface ProductsCache {
  products: Product[];
  lastUpdate: string;
  totalCount: number;
  platformCounts: {
    [key in Platform]?: number;
  };
}

/**
 * 당근마켓 특화 크롤링 설정
 */
export interface DaangnCrawlingConfig {
  baseUrl: string;
  regions: string[];             // 크롤링할 지역 목록
  maxProductsPerRegion: number;  // 지역당 최대 상품 수
  requestDelay: number;          // 요청 간 딜레이 (ms)
  timeout: number;               // 타임아웃 (ms)
  retryCount: number;            // 재시도 횟수
}

/**
 * 크롤링 트리거 요청 (당근마켓 전용)
 */
export interface CrawlingTriggerRequest {
  locations?: string[];          // 크롤링할 지역 목록 (생략 시 전체)
  force?: boolean;               // 강제 실행 여부 (선택)
}

/**
 * 크롤링 트리거 응답
 */
export interface CrawlingTriggerResponse {
  success: boolean;
  message: string;
  jobId?: string;
  estimatedTime?: number;        // 예상 소요 시간 (초)
}

/**
 * 지역 정보 (areas 테이블)
 */
export interface Area {
  id: string;                    // 지역 ID (예: "6035")
  name: string;                  // 지역명 (예: "역삼동")
  created_at?: Date;             // 생성 시간
}

/**
 * 당근마켓 상품 데이터 (REST API 응답)
 */
export interface DaangnArticle {
  id: string;                    // "/kr/buy-sell/상품명-상품ID/"
  href: string;                  // "https://www.daangn.com/kr/buy-sell/..."
  price: string;                 // "15000.0"
  title: string;                 // "상품 제목"
  thumbnail?: string;            // "https://img.kr.gcp-karroter.net/..."
  status: string;                // "Ongoing", "Sold", "Reserved"
  content?: string;              // 상품 설명
  createdAt: string;             // "2025-10-14T11:32:01.451+09:00"
  boostedAt?: string;            // 부스트 시간
  user: {
    dbId: string;
    nickname: string;
    __typename: string;
  };
  regionId: {
    id: string;
    dbId: string;
    name: string;
    __typename: string;
  };
  region: {
    id: string;
    dbId: string;
    name: string;
    __typename: string;
  };
  locationName?: string;
  category: {
    thumbnail: string;
    __typename: string;
  };
  __typename: string;
}

/**
 * 검색 필터 (todolist 2일차)
 */
export interface SearchFilters {
  locations?: string[];          // 지역 필터
  priceRange?: {                 // 가격대 필터
    min?: number;
    max?: number;
  };
  tradeMethod?: TradeMethod;     // 거래방식 필터
  status?: ProductStatus;        // 상품 상태 필터
  platform?: Platform;           // 플랫폼 필터
}

/**
 * 검색 요청 (POST /api/search)
 */
export interface SearchRequest {
  query: string;                 // 검색어
  filters?: SearchFilters;       // 필터
}

/**
 * 검색 응답
 */
export interface SearchResponse {
  success: boolean;
  totalCount: number;
  searchTime: number;            // 검색 소요 시간 (초)
  products: Product[];
  message?: string;
}

/**
 * 검색 로그 (PostgreSQL search_logs 테이블)
 */
export interface SearchLog {
  id?: number;
  query: string;
  filters?: object;
  result_count: number;
  search_time: number;           // 초 단위
  ai_analysis?: object;
  user_ip?: string;
  user_agent?: string;
  created_at?: Date;
}

