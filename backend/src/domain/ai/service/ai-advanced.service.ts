/**
 * 고급 AI 기능 서비스
 * 가격 예측, 사기 탐지, 카테고리 분류, 챗봇
 */

import { ChatOpenAI } from '@langchain/openai';
import { Product } from '../../crawling/types';
import {
  PricePrediction,
  FraudDetection,
  CategoryClassification,
  ChatContext,
  ChatResponse,
} from '../types';

export class AIAdvancedService {
  private llm!: ChatOpenAI;
  private isEnabled: boolean;

  constructor(apiKey?: string) {
    this.isEnabled = !!apiKey && apiKey.length > 0;

    if (this.isEnabled) {
      this.llm = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
      });
      console.log('✅ 고급 AI 서비스 초기화 완료');
    } else {
      console.log('⏸️  고급 AI 서비스 비활성화');
    }
  }

  /**
   * 1️⃣ 가격 예측
   * 유사 상품들의 가격을 분석하여 적정 가격 예측
   */
  async predictPrice(
    product: Product,
    similarProducts: Product[]
  ): Promise<PricePrediction> {
    if (!this.isEnabled || similarProducts.length === 0) {
      return this.getFallbackPricePrediction(product, similarProducts);
    }

    try {
      // 유사 상품 가격 통계
      const prices = similarProducts.map(p => p.price).filter(p => p > 0);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // AI에게 가격 예측 요청
      const prompt = `중고거래 상품의 적정 가격을 예측해주세요.

**분석할 상품:**
- 제목: ${product.title}
- 설명: ${product.description}
- 현재 가격: ${product.price}원

**유사 상품 가격 정보:**
- 평균 가격: ${Math.round(avgPrice).toLocaleString()}원
- 최저 가격: ${minPrice.toLocaleString()}원
- 최고 가격: ${maxPrice.toLocaleString()}원
- 유사 상품 수: ${similarProducts.length}개

다음 JSON 형식으로 응답하세요:
{
  "predictedPrice": 숫자,
  "confidence": 0~1 사이 숫자,
  "reasoning": "이유 설명"
}`;

      const response = await this.llm.invoke(prompt);
      const content = response.content.toString();

      // JSON 파싱
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        return {
          predictedPrice: data.predictedPrice,
          confidence: data.confidence,
          priceRange: {
            min: Math.round(minPrice * 0.9),
            max: Math.round(maxPrice * 1.1),
          },
          reasoning: data.reasoning,
        };
      }

      return this.getFallbackPricePrediction(product, similarProducts);
    } catch (error) {
      console.error('가격 예측 실패:', error);
      return this.getFallbackPricePrediction(product, similarProducts);
    }
  }

  /**
   * 2️⃣ 사기 탐지
   * 의심스러운 상품 패턴 감지
   */
  async detectFraud(product: Product): Promise<FraudDetection> {
    if (!this.isEnabled) {
      return this.getFallbackFraudDetection(product);
    }

    try {
      const prompt = `중고거래 상품의 사기 가능성을 분석해주세요.

**상품 정보:**
- 제목: ${product.title}
- 설명: ${product.description}
- 가격: ${product.price}원
- 지역: ${product.location}

**분석 기준:**
1. 지나치게 저렴한 가격
2. 의심스러운 키워드 (급매, 파격, 선입금 등)
3. 모호하거나 부족한 설명
4. 비현실적인 조건

다음 JSON 형식으로 응답하세요:
{
  "isSuspicious": true/false,
  "riskScore": 0~100 숫자,
  "redFlags": ["위험 요소 1", "위험 요소 2"],
  "recommendations": ["권장사항 1", "권장사항 2"]
}`;

      const response = await this.llm.invoke(prompt);
      const content = response.content.toString();

      // JSON 파싱
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        return {
          isSuspicious: data.isSuspicious,
          riskScore: data.riskScore,
          redFlags: data.redFlags || [],
          recommendations: data.recommendations || [],
        };
      }

      return this.getFallbackFraudDetection(product);
    } catch (error) {
      console.error('사기 탐지 실패:', error);
      return this.getFallbackFraudDetection(product);
    }
  }

  /**
   * 3️⃣ 자동 카테고리 분류
   * 상품을 적절한 카테고리로 자동 분류
   */
  async classifyCategory(product: Product): Promise<CategoryClassification> {
    if (!this.isEnabled) {
      return this.getFallbackCategoryClassification(product);
    }

    try {
      const prompt = `중고거래 상품을 카테고리로 분류해주세요.

**상품 정보:**
- 제목: ${product.title}
- 설명: ${product.description}

**가능한 카테고리:**
- 전자기기 (스마트폰, 노트북, 태블릿 등)
- 가구/인테리어
- 의류/패션
- 도서/문구
- 생활용품
- 스포츠/레저
- 기타

다음 JSON 형식으로 응답하세요:
{
  "category": "메인 카테고리",
  "confidence": 0~1 사이 숫자,
  "subCategories": ["세부 카테고리1", "세부 카테고리2"],
  "reasoning": "분류 이유"
}`;

      const response = await this.llm.invoke(prompt);
      const content = response.content.toString();

      // JSON 파싱
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        return {
          category: data.category,
          confidence: data.confidence,
          subCategories: data.subCategories || [],
          reasoning: data.reasoning,
        };
      }

      return this.getFallbackCategoryClassification(product);
    } catch (error) {
      console.error('카테고리 분류 실패:', error);
      return this.getFallbackCategoryClassification(product);
    }
  }

  /**
   * 4️⃣ 챗봇 상담
   * 사용자 질문에 대한 AI 답변 및 상품 추천
   */
  async chat(context: ChatContext): Promise<ChatResponse> {
    if (!this.isEnabled) {
      return {
        message: 'AI 챗봇 기능이 비활성화되어 있습니다.',
        suggestedQueries: ['노트북 추천', '가격이 저렴한 상품', '새 상품 알림'],
      };
    }

    try {
      // 대화 히스토리 구성
      const history = context.conversationHistory
        .map(msg => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
        .join('\n');

      // 관련 상품 정보
      const productInfo = context.relatedProducts
        ? `\n**관련 상품 정보:**\n${context.relatedProducts
            .slice(0, 3)
            .map(p => `- ${p.title} (${p.price.toLocaleString()}원)`)
            .join('\n')}`
        : '';

      const prompt = `당신은 중고거래 플랫폼의 친절한 AI 상담사입니다.

**대화 히스토리:**
${history}

**현재 질문:**
사용자: ${context.currentQuery}
${productInfo}

**답변 가이드:**
1. 친근하고 자연스럽게 답변하세요
2. 상품을 추천할 때는 구체적인 이유를 제시하세요
3. 필요하면 추가 질문을 제안하세요

자연스럽게 답변해주세요:`;

      const response = await this.llm.invoke(prompt);
      const message = response.content.toString().trim();

      // 추천 검색어 생성
      const suggestedQueries = this.generateSuggestedQueries(
        context.currentQuery,
        context.relatedProducts || []
      );

      return {
        message,
        suggestedProducts: context.relatedProducts?.slice(0, 3),
        suggestedQueries,
      };
    } catch (error) {
      console.error('챗봇 응답 실패:', error);
      return {
        message: '죄송합니다. 현재 답변을 생성할 수 없습니다.',
        suggestedQueries: ['다시 질문하기'],
      };
    }
  }

  /**
   * Fallback: 가격 예측 (규칙 기반)
   */
  private getFallbackPricePrediction(
    product: Product,
    similarProducts: Product[]
  ): PricePrediction {
    if (similarProducts.length === 0) {
      return {
        predictedPrice: product.price,
        confidence: 0.3,
        priceRange: {
          min: Math.round(product.price * 0.8),
          max: Math.round(product.price * 1.2),
        },
        reasoning: '유사 상품이 없어 현재 가격 기준으로 예측했습니다.',
      };
    }

    const prices = similarProducts.map(p => p.price).filter(p => p > 0);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      predictedPrice: Math.round(avgPrice),
      confidence: 0.6,
      priceRange: {
        min: Math.round(avgPrice * 0.85),
        max: Math.round(avgPrice * 1.15),
      },
      reasoning: `${similarProducts.length}개 유사 상품의 평균 가격을 기준으로 예측했습니다.`,
    };
  }

  /**
   * Fallback: 사기 탐지 (규칙 기반)
   */
  private getFallbackFraudDetection(product: Product): FraudDetection {
    const redFlags: string[] = [];
    let riskScore = 0;

    // 의심 키워드 체크
    const suspiciousKeywords = ['급매', '파격', '선입금', '무료나눔', '공짜'];
    const text = (product.title + ' ' + product.description).toLowerCase();

    suspiciousKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        redFlags.push(`의심스러운 키워드 포함: "${keyword}"`);
        riskScore += 15;
      }
    });

    // 가격 체크 (너무 저렴하면 의심)
    if (product.price > 0 && product.price < 10000) {
      redFlags.push('가격이 지나치게 저렴합니다');
      riskScore += 20;
    }

    // 설명 길이 체크
    if (product.description.length < 20) {
      redFlags.push('상품 설명이 부족합니다');
      riskScore += 10;
    }

    return {
      isSuspicious: riskScore >= 30,
      riskScore: Math.min(riskScore, 100),
      redFlags,
      recommendations: [
        '판매자 프로필을 확인하세요',
        '직거래를 권장합니다',
        '선입금은 피하세요',
      ],
    };
  }

  /**
   * Fallback: 카테고리 분류 (규칙 기반)
   */
  private getFallbackCategoryClassification(product: Product): CategoryClassification {
    const text = (product.title + ' ' + product.description).toLowerCase();

    // 간단한 키워드 매칭
    if (/아이폰|갤럭시|스마트폰|폰|핸드폰/.test(text)) {
      return {
        category: '전자기기',
        confidence: 0.7,
        subCategories: ['스마트폰'],
        reasoning: '스마트폰 관련 키워드가 포함되어 있습니다',
      };
    } else if (/노트북|맥북|컴퓨터|pc/.test(text)) {
      return {
        category: '전자기기',
        confidence: 0.7,
        subCategories: ['노트북/PC'],
        reasoning: '컴퓨터 관련 키워드가 포함되어 있습니다',
      };
    } else if (/의류|옷|티셔츠|바지|원피스/.test(text)) {
      return {
        category: '의류/패션',
        confidence: 0.6,
        subCategories: ['의류'],
        reasoning: '의류 관련 키워드가 포함되어 있습니다',
      };
    }

    return {
      category: '기타',
      confidence: 0.5,
      subCategories: [],
      reasoning: '명확한 카테고리를 찾을 수 없습니다',
    };
  }

  /**
   * 추천 검색어 생성
   */
  private generateSuggestedQueries(query: string, products: Product[]): string[] {
    const queries: string[] = [];

    // 유사 검색어
    queries.push(`${query} 저렴한`);
    queries.push(`${query} 새상품`);

    // 상품 기반 검색어
    if (products.length > 0) {
      const commonWords = this.extractCommonWords(products);
      queries.push(...commonWords.slice(0, 2));
    }

    return queries.slice(0, 3);
  }

  /**
   * 공통 단어 추출
   */
  private extractCommonWords(products: Product[]): string[] {
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
}

