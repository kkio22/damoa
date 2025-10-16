/**
 * AI 분석 관련 타입 정의 (todolist 3일차)
 */

import { Product } from '../../crawling/types';

/**
 * AI 분석 요청
 */
export interface AIAnalyzeRequest {
  query: string;              // 사용자 검색어
  products: Product[];        // 분석할 상품 목록
  maxResults?: number;        // 최대 결과 개수 (기본: 10)
}

/**
 * AI 분석 결과
 */
export interface AIAnalyzeResponse {
  success: boolean;
  searchQuery: string;
  analyzedAt: string;
  totalProducts: number;
  recommendations: ProductRecommendation[];
  insights: MarketInsights;
  suggestedFilters: SuggestedFilters;
  relatedKeywords: string[];
}

/**
 * 상품 추천 (점수 포함)
 */
export interface ProductRecommendation {
  product: Product;
  score: number;              // 0-100 점수
  reasons: string[];          // 추천 이유
  matchedKeywords: string[];  // 매칭된 키워드
}

/**
 * 시장 인사이트
 */
export interface MarketInsights {
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  mostCommonLocations: string[];
  trendingItems: string[];
  summary: string;            // AI 생성 요약
}

/**
 * AI 제안 필터
 */
export interface SuggestedFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  locations?: string[];
  categories?: string[];
}

/**
 * LangGraph 워크플로우 상태
 */
export interface WorkflowState {
  query: string;
  products: Product[];
  analyzedProducts?: ProductRecommendation[];
  insights?: MarketInsights;
  suggestedFilters?: SuggestedFilters;
  relatedKeywords?: string[];
  error?: string;
}

/**
 * AI 캐시 키 생성용
 */
export interface AICacheKey {
  query: string;
  productCount: number;
  timestamp: number;
}

/**
 * 벡터 임베딩 데이터
 */
export interface VectorEmbedding {
  productId: string;
  vector: number[];
  metadata: {
    title: string;
    price: number;
    location: string;
    createdAt: string;
  };
}

/**
 * 유사 상품 추천 결과
 */
export interface SimilarProductResult {
  product: Product;
  similarity: number;  // 0-1 사이의 유사도
  reason: string;
}

/**
 * 가격 예측 결과
 */
export interface PricePrediction {
  predictedPrice: number;
  confidence: number;  // 0-1 사이의 신뢰도
  priceRange: {
    min: number;
    max: number;
  };
  reasoning: string;
}

/**
 * 사기 탐지 결과
 */
export interface FraudDetection {
  isSuspicious: boolean;
  riskScore: number;  // 0-100 점수 (높을수록 위험)
  redFlags: string[];
  recommendations: string[];
}

/**
 * 자동 카테고리 분류 결과
 */
export interface CategoryClassification {
  category: string;
  confidence: number;
  subCategories: string[];
  reasoning: string;
}

/**
 * 챗봇 대화 컨텍스트
 */
export interface ChatContext {
  userId?: string;
  conversationHistory: ChatMessage[];
  currentQuery: string;
  relatedProducts?: Product[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  message: string;
  suggestedProducts?: Product[];
  suggestedQueries?: string[];
}

