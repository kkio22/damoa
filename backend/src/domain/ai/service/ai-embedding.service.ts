/**
 * AI 임베딩 서비스
 * OpenAI 임베딩을 사용한 벡터 기반 유사도 검색
 */

import { OpenAIEmbeddings } from '@langchain/openai';
import { Product } from '../../crawling/types';
import { VectorEmbedding, SimilarProductResult } from '../types';

export class AIEmbeddingService {
  private embeddings!: OpenAIEmbeddings;
  private isEnabled: boolean;
  private vectorCache: Map<string, number[]> = new Map();

  constructor(apiKey?: string) {
    this.isEnabled = !!apiKey && apiKey.length > 0;

    if (this.isEnabled) {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: apiKey,
        modelName: 'text-embedding-3-small', // 저렴하고 빠른 모델
      });
      console.log('✅ AI 임베딩 서비스 초기화 완료');
    } else {
      console.log('⏸️  AI 임베딩 서비스 비활성화');
    }
  }

  /**
   * 상품을 벡터로 임베딩
   */
  async embedProduct(product: Product): Promise<VectorEmbedding | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      // 캐시 확인
      const cacheKey = `product:${product.id}`;
      if (this.vectorCache.has(cacheKey)) {
        return {
          productId: product.id,
          vector: this.vectorCache.get(cacheKey)!,
          metadata: {
            title: product.title,
            price: product.price,
            location: product.location,
            createdAt: product.createdAt,
          },
        };
      }

      // 상품 정보를 텍스트로 변환
      const text = this.productToText(product);

      // 임베딩 생성
      const vector = await this.embeddings.embedQuery(text);

      // 캐시에 저장
      this.vectorCache.set(cacheKey, vector);

      return {
        productId: product.id,
        vector,
        metadata: {
          title: product.title,
          price: product.price,
          location: product.location,
          createdAt: product.createdAt,
        },
      };
    } catch (error) {
      console.error(`상품 임베딩 실패 (${product.id}):`, error);
      return null;
    }
  }

  /**
   * 여러 상품을 배치로 임베딩
   */
  async embedProducts(products: Product[]): Promise<VectorEmbedding[]> {
    if (!this.isEnabled) {
      return [];
    }

    const embeddings: VectorEmbedding[] = [];

    // 배치 처리 (5개씩)
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchEmbeddings = await Promise.all(
        batch.map(p => this.embedProduct(p))
      );

      embeddings.push(...batchEmbeddings.filter(e => e !== null) as VectorEmbedding[]);
    }

    return embeddings;
  }

  /**
   * 쿼리를 벡터로 임베딩
   */
  async embedQuery(query: string): Promise<number[] | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      // 캐시 확인
      const cacheKey = `query:${query.toLowerCase()}`;
      if (this.vectorCache.has(cacheKey)) {
        return this.vectorCache.get(cacheKey)!;
      }

      const vector = await this.embeddings.embedQuery(query);
      
      // 캐시에 저장
      this.vectorCache.set(cacheKey, vector);

      return vector;
    } catch (error) {
      console.error('쿼리 임베딩 실패:', error);
      return null;
    }
  }

  /**
   * 유사한 상품 찾기 (코사인 유사도)
   */
  async findSimilarProducts(
    targetProduct: Product,
    candidates: Product[],
    topK: number = 5
  ): Promise<SimilarProductResult[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      // 타겟 상품 임베딩
      const targetEmbedding = await this.embedProduct(targetProduct);
      if (!targetEmbedding) {
        return [];
      }

      // 후보 상품들 임베딩
      const candidateEmbeddings = await this.embedProducts(
        candidates.filter(p => p.id !== targetProduct.id)
      );

      // 유사도 계산
      const similarities: SimilarProductResult[] = [];

      for (const candidate of candidateEmbeddings) {
        const similarity = this.cosineSimilarity(
          targetEmbedding.vector,
          candidate.vector
        );

        const product = candidates.find(p => p.id === candidate.productId);
        if (product && similarity > 0.7) { // 70% 이상 유사한 것만
          similarities.push({
            product,
            similarity,
            reason: this.getSimilarityReason(similarity),
          });
        }
      }

      // 유사도 순으로 정렬
      similarities.sort((a, b) => b.similarity - a.similarity);

      return similarities.slice(0, topK);
    } catch (error) {
      console.error('유사 상품 찾기 실패:', error);
      return [];
    }
  }

  /**
   * 벡터 기반 검색 (쿼리와 가장 유사한 상품)
   */
  async searchByVector(
    query: string,
    products: Product[],
    topK: number = 10
  ): Promise<ProductWithScore[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      // 쿼리 임베딩
      const queryVector = await this.embedQuery(query);
      if (!queryVector) {
        return [];
      }

      // 상품들 임베딩
      const productEmbeddings = await this.embedProducts(products);

      // 유사도 계산
      const results: ProductWithScore[] = [];

      for (const embedding of productEmbeddings) {
        const similarity = this.cosineSimilarity(queryVector, embedding.vector);

        const product = products.find(p => p.id === embedding.productId);
        if (product) {
          results.push({
            product,
            score: similarity * 100, // 0-100 점수로 변환
          });
        }
      }

      // 점수 순으로 정렬
      results.sort((a, b) => b.score - a.score);

      return results.slice(0, topK);
    } catch (error) {
      console.error('벡터 검색 실패:', error);
      return [];
    }
  }

  /**
   * 코사인 유사도 계산
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('벡터 길이가 다름');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * 상품을 텍스트로 변환
   */
  private productToText(product: Product): string {
    const parts = [
      product.title,
      product.description,
      `가격: ${product.price}원`,
      `지역: ${product.location}`,
    ];

    return parts.filter(p => p && p.length > 0).join(' | ');
  }

  /**
   * 유사도에 따른 이유 생성
   */
  private getSimilarityReason(similarity: number): string {
    if (similarity >= 0.9) {
      return '거의 동일한 상품입니다';
    } else if (similarity >= 0.8) {
      return '매우 유사한 상품입니다';
    } else {
      return '비슷한 상품입니다';
    }
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.vectorCache.clear();
    console.log('🗑️  임베딩 캐시 삭제');
  }

  /**
   * 캐시 통계
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.vectorCache.size,
      keys: Array.from(this.vectorCache.keys()),
    };
  }
}

interface ProductWithScore {
  product: Product;
  score: number;
}

