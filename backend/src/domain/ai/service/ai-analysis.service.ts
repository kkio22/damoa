/**
 * AI 분석 서비스 (통합 버전)
 * 벡터 임베딩 + 고급 AI 기능 통합
 */

import { ChatOpenAI } from '@langchain/openai';
import { 
  AIAnalyzeRequest, 
  AIAnalyzeResponse,
  ProductRecommendation,
  MarketInsights,
  SuggestedFilters
} from '../types';
import { Product } from '../../crawling/types';
import { AIEmbeddingService } from './ai-embedding.service';
import { AIAdvancedService } from './ai-advanced.service';

export class AIAnalysisService {
  private llm!: ChatOpenAI;
  private isEnabled: boolean;
  private embeddingService: AIEmbeddingService;
  private advancedService: AIAdvancedService;
  private useVectorSearch: boolean = true;  // 벡터 검색 활성화

  constructor(apiKey?: string) {
    this.isEnabled = !!apiKey && apiKey.length > 0;
    
    // 새로운 AI 서비스들 초기화
    this.embeddingService = new AIEmbeddingService(apiKey);
    this.advancedService = new AIAdvancedService(apiKey);
    
    if (this.isEnabled) {
      this.llm = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
      });
      console.log('✅ AI 분석 서비스 초기화 완료 (통합 버전)');
      console.log('   - 벡터 임베딩: 활성화');
      console.log('   - 고급 AI 기능: 활성화');
    } else {
      console.log('⏸️  AI 분석 서비스 비활성화 (OPENAI_API_KEY 없음)');
    }
  }

  /**
   * 상품 분석 (메인 함수) - 통합 버전
   */
  async analyzeProducts(request: AIAnalyzeRequest): Promise<AIAnalyzeResponse> {
    if (!this.isEnabled) {
      return this.getFallbackResponse(request);
    }

    try {
      console.log(`🤖 AI 분석 시작 (통합): "${request.query}"`);
      console.log(`📦 상품 수: ${request.products.length}개`);

      // 1. 검색어 분석 및 키워드 추출
      const relatedKeywords = await this.extractKeywords(request.query);

      // 2. 상품 점수 계산 및 추천 (벡터 검색 우선!)
      let recommendations: ProductRecommendation[];
      
      if (this.useVectorSearch && this.isEnabled) {
        console.log('🔍 벡터 임베딩 검색 사용 (고급)');
        recommendations = await this.scoreProductsWithVectorSearch(
          request.query,
          request.products,
          relatedKeywords,
          request.maxResults || 10
        );
      } else {
        console.log('📝 규칙 기반 검색 사용 (기본)');
        recommendations = await this.scoreProducts(
          request.query,
          request.products,
          relatedKeywords,
          request.maxResults || 10
        );
      }

      // 3. 시장 인사이트 생성
      const insights = await this.generateInsights(
        request.query,
        request.products
      );

      // 4. 필터 제안
      const suggestedFilters = this.generateSuggestedFilters(
        request.products,
        insights
      );

      // 5. 고급 AI 기능 추가 (TOP 1 상품에 대해)
      let additionalInfo: any = {};
      
      if (recommendations.length > 0 && this.isEnabled) {
        const topProduct = recommendations[0].product;
        
        // 가격 예측
        const pricePrediction = await this.advancedService.predictPrice(
          topProduct,
          request.products
        );
        
        // 사기 탐지
        const fraudDetection = await this.advancedService.detectFraud(topProduct);
        
        // 카테고리 분류
        const categoryClassification = await this.advancedService.classifyCategory(topProduct);
        
        additionalInfo = {
          topProductAnalysis: {
            pricePrediction,
            fraudDetection,
            categoryClassification,
          },
        };
        
        console.log('✨ 고급 AI 분석 완료');
      }

      console.log(`✅ AI 분석 완료: ${recommendations.length}개 추천`);

      return {
        success: true,
        searchQuery: request.query,
        analyzedAt: new Date().toISOString(),
        totalProducts: request.products.length,
        recommendations,
        insights,
        suggestedFilters,
        relatedKeywords,
        ...additionalInfo,  // 고급 AI 정보 포함
      };

    } catch (error) {
      console.error('❌ AI 분석 실패:', error);
      return this.getFallbackResponse(request);
    }
  }

  /**
   * 벡터 임베딩 기반 상품 점수 계산 (신규!)
   */
  private async scoreProductsWithVectorSearch(
    query: string,
    products: Product[],
    keywords: string[],
    maxResults: number
  ): Promise<ProductRecommendation[]> {
    try {
      // 벡터 검색으로 유사도 기반 점수 계산
      const vectorResults = await this.embeddingService.searchByVector(
        query,
        products,
        maxResults * 2  // 여유있게 가져옴
      );

      // ProductRecommendation 형식으로 변환
      const recommendations: ProductRecommendation[] = vectorResults.map(result => ({
        product: result.product,
        score: result.score,  // 이미 0-100 점수
        reasons: [
          `벡터 유사도: ${result.score.toFixed(1)}점`,
          ...this.generateReasons(result.product, query, keywords),
        ],
        matchedKeywords: this.findMatchedKeywords(result.product, keywords),
      }));

      return recommendations.slice(0, maxResults);
    } catch (error) {
      console.error('벡터 검색 실패, 규칙 기반으로 전환:', error);
      // 벡터 검색 실패 시 기존 방식으로 폴백
      return this.scoreProducts(query, products, keywords, maxResults);
    }
  }

  /**
   * 검색어에서 키워드 추출 (OpenAI)
   */
  private async extractKeywords(query: string): Promise<string[]> {
    try {
      const prompt = `다음 검색어에서 핵심 키워드를 추출하세요. 유사어나 관련어도 포함하세요.
검색어: "${query}"

JSON 형식으로 응답: ["키워드1", "키워드2", "키워드3"]`;

      const response = await this.llm.invoke(prompt);
      const content = response.content.toString();
      
      // JSON 파싱
      const match = content.match(/\[.*?\]/);
      if (match) {
        return JSON.parse(match[0]);
      }

      return [query];
    } catch (error) {
      console.error('키워드 추출 실패:', error);
      return [query];
    }
  }

  /**
   * 상품 점수 계산 및 추천
   */
  private async scoreProducts(
    query: string,
    products: Product[],
    keywords: string[],
    maxResults: number
  ): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = [];

    for (const product of products) {
      const score = this.calculateScore(product, query, keywords);
      const reasons = this.generateReasons(product, query, keywords);
      const matchedKeywords = this.findMatchedKeywords(product, keywords);

      if (score > 30) { // 최소 30점 이상만 추천
        recommendations.push({
          product,
          score,
          reasons,
          matchedKeywords,
        });
      }
    }

    // 점수 순으로 정렬
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, maxResults);
  }

  /**
   * 상품 점수 계산 (규칙 기반)
   */
  private calculateScore(product: Product, query: string, keywords: string[]): number {
    let score = 0;
    const title = product.title.toLowerCase();
    const description = product.description.toLowerCase();
    const queryLower = query.toLowerCase();

    // 제목에 검색어 포함 (50점)
    if (title.includes(queryLower)) {
      score += 50;
    }

    // 제목에 키워드 포함 (각 10점)
    keywords.forEach(keyword => {
      if (title.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    // 설명에 검색어 포함 (20점)
    if (description.includes(queryLower)) {
      score += 20;
    }

    // 설명에 키워드 포함 (각 5점)
    keywords.forEach(keyword => {
      if (description.includes(keyword.toLowerCase())) {
        score += 5;
      }
    });

    // 상품 상태 (판매중 +10점)
    if (product.status === 'available') {
      score += 10;
    }

    // 최근 등록 상품 (24시간 이내 +15점)
    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 24) {
      score += 15;
    }

    return Math.min(score, 100); // 최대 100점
  }

  /**
   * 추천 이유 생성
   */
  private generateReasons(product: Product, query: string, keywords: string[]): string[] {
    const reasons: string[] = [];
    const title = product.title.toLowerCase();
    const description = product.description.toLowerCase();

    if (title.includes(query.toLowerCase())) {
      reasons.push('제목이 검색어와 정확히 일치합니다');
    }

    const matchedKeywords = keywords.filter(k => 
      title.includes(k.toLowerCase()) || description.includes(k.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      reasons.push(`관련 키워드 포함: ${matchedKeywords.slice(0, 3).join(', ')}`);
    }

    if (product.status === 'available') {
      reasons.push('현재 판매 중인 상품입니다');
    }

    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 24) {
      reasons.push('최근 등록된 상품입니다');
    }

    return reasons;
  }

  /**
   * 매칭된 키워드 찾기
   */
  private findMatchedKeywords(product: Product, keywords: string[]): string[] {
    const matched: string[] = [];
    const text = (product.title + ' ' + product.description).toLowerCase();

    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      }
    });

    return matched;
  }

  /**
   * 시장 인사이트 생성 (OpenAI)
   */
  private async generateInsights(
    query: string,
    products: Product[]
  ): Promise<MarketInsights> {
    // 가격 통계
    const prices = products.map(p => p.price).filter(p => p > 0);
    const averagePrice = prices.length > 0 
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // 지역 통계
    const locationCount = new Map<string, number>();
    products.forEach(p => {
      locationCount.set(p.location, (locationCount.get(p.location) || 0) + 1);
    });
    const mostCommonLocations = Array.from(locationCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location]) => location);

    // 트렌드 아이템 (제목에서 자주 나오는 단어)
    const trendingItems = this.extractTrendingItems(products);

    // AI 요약 생성
    let summary = `"${query}" 검색 결과 분석`;
    
    if (this.isEnabled) {
      try {
        const prompt = `다음은 "${query}" 검색 결과입니다:
- 총 ${products.length}개 상품
- 평균 가격: ${averagePrice.toLocaleString()}원
- 가격 범위: ${minPrice.toLocaleString()}원 ~ ${maxPrice.toLocaleString()}원
- 주요 지역: ${mostCommonLocations.join(', ')}

이 시장 상황을 한 문장으로 요약해주세요.`;

        const response = await this.llm.invoke(prompt);
        summary = response.content.toString().trim();
      } catch (error) {
        console.error('AI 요약 생성 실패:', error);
      }
    }

    return {
      averagePrice,
      priceRange: { min: minPrice, max: maxPrice },
      mostCommonLocations,
      trendingItems,
      summary,
    };
  }

  /**
   * 트렌딩 아이템 추출
   */
  private extractTrendingItems(products: Product[]): string[] {
    const wordCount = new Map<string, number>();

    products.forEach(product => {
      const words = product.title.split(/\s+/);
      words.forEach(word => {
        const cleaned = word.replace(/[^가-힣a-zA-Z0-9]/g, '');
        if (cleaned.length >= 2) {
          wordCount.set(cleaned, (wordCount.get(cleaned) || 0) + 1);
        }
      });
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * 필터 제안 생성
   */
  private generateSuggestedFilters(
    products: Product[],
    insights: MarketInsights
  ): SuggestedFilters {
    const filters: SuggestedFilters = {};

    // 가격 범위 제안 (평균 ±30%)
    if (insights.averagePrice > 0) {
      filters.priceRange = {
        min: Math.round(insights.averagePrice * 0.7),
        max: Math.round(insights.averagePrice * 1.3),
      };
    }

    // 주요 지역 제안
    if (insights.mostCommonLocations.length > 0) {
      filters.locations = insights.mostCommonLocations.slice(0, 3);
    }

    return filters;
  }

  /**
   * Fallback 응답 (AI 비활성화 시)
   */
  private getFallbackResponse(request: AIAnalyzeRequest): AIAnalyzeResponse {
    const queryLower = request.query.toLowerCase();
    const maxResults = request.maxResults || 10;

    // 간단한 키워드 매칭
    const recommendations: ProductRecommendation[] = request.products
      .map(product => {
        const score = this.calculateScore(product, request.query, [request.query]);
        return {
          product,
          score,
          reasons: ['제목 또는 설명에 검색어 포함'],
          matchedKeywords: [request.query],
        };
      })
      .filter(r => r.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    // 기본 인사이트
    const prices = request.products.map(p => p.price).filter(p => p > 0);
    const insights: MarketInsights = {
      averagePrice: prices.length > 0 
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
      },
      mostCommonLocations: [],
      trendingItems: [],
      summary: `"${request.query}" 검색 결과 ${request.products.length}개 상품`,
    };

    return {
      success: true,
      searchQuery: request.query,
      analyzedAt: new Date().toISOString(),
      totalProducts: request.products.length,
      recommendations,
      insights,
      suggestedFilters: {},
      relatedKeywords: [request.query],
    };
  }
}

