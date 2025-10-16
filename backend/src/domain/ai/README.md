# 🤖 AI 추천 시스템 - 완전 가이드

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [핵심 기능](#핵심-기능)
3. [아키텍처](#아키텍처)
4. [사용 방법](#사용-방법)
5. [성능 최적화](#성능-최적화)
6. [추가 AI 기능](#추가-ai-기능)

---

## 🎯 시스템 개요

중고거래 플랫폼에 **AI 기반 상품 추천 및 분석 시스템**을 통합했습니다.

### 주요 특징
- ✅ **벡터 임베딩 기반 유사도 검색** (OpenAI Embeddings)
- ✅ **다단계 Redis 캐싱** (분석 결과 + 벡터 임베딩)
- ✅ **가격 예측 AI**
- ✅ **사기 탐지 시스템**
- ✅ **자동 카테고리 분류**
- ✅ **챗봇 상담**
- ✅ **인기 검색어 추적**

---

## 🚀 핵심 기능

### 1️⃣ 벡터 임베딩 기반 추천 (가장 정교한 방식!)

**기존 방식 (규칙 기반):**
```
"아이폰" 검색 → 제목에 "아이폰" 포함된 것만 찾음
```

**개선 방식 (AI 임베딩):**
```
"아이폰" 검색 → 벡터 유사도로 검색
→ "iPhone", "애플 스마트폰", "아이폰14" 등 모두 찾음!
```

#### 작동 원리:
1. 각 상품을 **벡터**(숫자 배열)로 변환
2. 검색어도 **벡터**로 변환
3. **코사인 유사도** 계산으로 가장 비슷한 상품 찾기

#### 코드 예시:
```typescript
import { AIEmbeddingService } from './service/ai-embedding.service';

const embeddingService = new AIEmbeddingService(OPENAI_API_KEY);

// 벡터 기반 검색
const results = await embeddingService.searchByVector(
  "아이폰 14",
  products,
  10  // TOP 10
);

// 유사 상품 찾기
const similar = await embeddingService.findSimilarProducts(
  targetProduct,
  allProducts,
  5  // TOP 5
);
```

---

### 2️⃣ Redis 캐싱 전략 (3단계)

#### 레벨 1: 분석 결과 캐싱 (1시간 TTL)
```typescript
// 같은 검색어 + 상품 수 → 캐시 히트!
await cacheService.set(query, productCount, aiResult);
const cached = await cacheService.get(query, productCount);
```

#### 레벨 2: 벡터 임베딩 캐싱 (24시간 TTL)
```typescript
// 상품 ID → 벡터 (오래 유지)
await cacheService.setVector(productId, embedding);
const cachedVector = await cacheService.getVector(productId);
```

#### 레벨 3: 인기 검색어 추적 (무기한)
```typescript
// 검색할 때마다 카운트 증가
await cacheService.incrementSearchCount(query);

// TOP 10 인기 검색어
const popular = await cacheService.getPopularQueries(10);
```

**캐시 히트율 모니터링:**
```typescript
const hitRate = await cacheService.getCacheHitRate();
console.log(`캐시 히트율: ${(hitRate.hitRate * 100).toFixed(2)}%`);
```

---

### 3️⃣ 가격 예측 AI

유사 상품들의 가격을 AI가 분석하여 **적정 가격** 예측!

```typescript
import { AIAdvancedService } from './service/ai-advanced.service';

const advancedService = new AIAdvancedService(OPENAI_API_KEY);

const prediction = await advancedService.predictPrice(
  product,
  similarProducts
);

console.log(`예상 가격: ${prediction.predictedPrice}원`);
console.log(`신뢰도: ${(prediction.confidence * 100).toFixed(0)}%`);
console.log(`이유: ${prediction.reasoning}`);
```

**출력 예시:**
```
예상 가격: 450,000원
신뢰도: 85%
이유: 5개 유사 상품의 평균 가격과 상태를 고려하여 예측했습니다.
```

---

### 4️⃣ 사기 탐지 시스템

의심스러운 상품을 자동으로 감지!

```typescript
const fraud = await advancedService.detectFraud(product);

if (fraud.isSuspicious) {
  console.log(`⚠️  위험 점수: ${fraud.riskScore}/100`);
  console.log('위험 요소:', fraud.redFlags);
  console.log('권장사항:', fraud.recommendations);
}
```

**감지 기준:**
- 🚨 지나치게 저렴한 가격
- 🚨 의심스러운 키워드 ("급매", "선입금", "파격" 등)
- 🚨 부족한 상품 설명
- 🚨 비현실적인 조건

---

### 5️⃣ 자동 카테고리 분류

상품을 AI가 자동으로 분류!

```typescript
const category = await advancedService.classifyCategory(product);

console.log(`카테고리: ${category.category}`);
console.log(`세부: ${category.subCategories.join(', ')}`);
console.log(`신뢰도: ${(category.confidence * 100).toFixed(0)}%`);
```

**지원 카테고리:**
- 전자기기 (스마트폰, 노트북, 태블릿)
- 가구/인테리어
- 의류/패션
- 도서/문구
- 생활용품
- 스포츠/레저

---

### 6️⃣ AI 챗봇 상담

사용자 질문에 AI가 답변하고 상품 추천!

```typescript
const chatResponse = await advancedService.chat({
  userId: 'user123',
  conversationHistory: [
    { role: 'user', content: '노트북 추천해줘', timestamp: '...' },
    { role: 'assistant', content: '어떤 용도로 사용하실 건가요?', timestamp: '...' },
  ],
  currentQuery: '가벼운 작업용이야',
  relatedProducts: products,
});

console.log(`AI: ${chatResponse.message}`);
console.log('추천 상품:', chatResponse.suggestedProducts);
console.log('추천 검색어:', chatResponse.suggestedQueries);
```

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                     사용자 요청                          │
│                  (검색어 + 필터)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              AI 분석 서비스 (orchestrator)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  1. Redis 캐시 확인 (초고속)                     │   │
│  │     ↓ 캐시 미스                                  │   │
│  │  2. 벡터 임베딩 생성                             │   │
│  │     ↓                                            │   │
│  │  3. 유사도 계산 + 점수화                         │   │
│  │     ↓                                            │   │
│  │  4. 고급 AI 기능 (가격/사기/카테고리)            │   │
│  │     ↓                                            │   │
│  │  5. 결과 캐싱 + 반환                             │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Redis 캐시 레이어                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  분석 결과    │  │  벡터 임베딩  │  │ 인기 검색어 │  │
│  │  (1시간)      │  │  (24시간)     │  │  (영구)     │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    OpenAI API                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  GPT-3.5     │  │  Embeddings  │  │  Analysis   │  │
│  │  (분석/챗봇)  │  │  (벡터 생성)  │  │  (예측)     │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 사용 방법

### 전체 플로우 예시

```typescript
import { AIAnalysisService } from './service/ai-analysis.service';
import { AIEmbeddingService } from './service/ai-embedding.service';
import { AIAdvancedService } from './service/ai-advanced.service';
import { AICacheService } from './service/ai-cache.service';
import { createClient } from 'redis';

// 1. 서비스 초기화
const redisClient = createClient({ url: 'redis://localhost:6379' });
await redisClient.connect();

const cacheService = new AICacheService(redisClient);
const analysisService = new AIAnalysisService(OPENAI_API_KEY);
const embeddingService = new AIEmbeddingService(OPENAI_API_KEY);
const advancedService = new AIAdvancedService(OPENAI_API_KEY);

// 2. 사용자 검색
const query = "아이폰 14 프로";
const products = await searchProducts(query);  // DB에서 조회

// 3. 캐시 확인 (빠른 응답!)
let result = await cacheService.get(query, products.length);

if (result) {
  // 캐시 히트!
  await cacheService.recordCacheHit();
  console.log('✅ 캐시에서 반환 (초고속!)');
  return result;
}

// 4. 캐시 미스 → AI 분석 실행
await cacheService.recordCacheMiss();
await cacheService.incrementSearchCount(query);  // 검색어 카운트

// 5. 벡터 기반 추천 (가장 정교!)
const vectorResults = await embeddingService.searchByVector(
  query,
  products,
  10
);

// 6. 고급 AI 기능
const topProduct = vectorResults[0].product;
const pricePrediction = await advancedService.predictPrice(
  topProduct,
  products
);
const fraudCheck = await advancedService.detectFraud(topProduct);
const category = await advancedService.classifyCategory(topProduct);

// 7. 유사 상품 찾기
const similar = await embeddingService.findSimilarProducts(
  topProduct,
  products,
  5
);

// 8. 결과 조합 및 캐싱
result = {
  success: true,
  searchQuery: query,
  recommendations: vectorResults,
  pricePrediction,
  fraudCheck,
  category,
  similarProducts: similar,
  analyzedAt: new Date().toISOString(),
};

// 9. Redis에 캐싱 (다음번 빠른 응답!)
await cacheService.set(query, products.length, result);

return result;
```

---

## ⚡ 성능 최적화

### 캐싱 전략

#### 1. 언제 캐시?
- ✅ **자주 검색되는 키워드** → 즉시 캐싱
- ✅ **계산 비용 높은 작업** (벡터 임베딩, AI 분석)
- ✅ **변하지 않는 데이터** (상품 벡터)

#### 2. 캐시 무효화
```typescript
// 상품 업데이트 시 벡터 캐시 삭제
await cacheService.delete(query, productCount);
await cacheService.clearVectorCache();
```

#### 3. 배치 처리
```typescript
// 여러 상품 한번에 임베딩 (효율적!)
const embeddings = await embeddingService.embedProducts(products);
await cacheService.setVectorBatch(embeddings);
```

### 성능 지표

```typescript
// 캐시 히트율
const stats = await cacheService.getCacheHitRate();
console.log(`캐시 히트율: ${(stats.hitRate * 100).toFixed(2)}%`);

// 인기 검색어 TOP 10
const popular = await cacheService.getPopularQueries(10);
console.log('인기 검색어:', popular);
```

---

## 🎁 추가 AI 기능 아이디어

### 1️⃣ 가격 변동 추적
```typescript
// 상품 가격이 떨어지면 알림!
const priceHistory = await trackPriceHistory(productId);
if (priceDropped(priceHistory)) {
  notifyUser('가격이 10% 떨어졌어요!');
}
```

### 2️⃣ 스마트 알림
```typescript
// 사용자가 관심있는 상품이 새로 등록되면 AI가 판단해서 알림
const userPreferences = await getUserPreferences(userId);
const newProducts = await getNewProducts();

for (const product of newProducts) {
  const similarity = await embeddingService.cosineSimilarity(
    userPreferences.vector,
    product.vector
  );
  
  if (similarity > 0.8) {
    notifyUser(`관심있을 만한 상품: ${product.title}`);
  }
}
```

### 3️⃣ 가격 협상 도우미
```typescript
// AI가 적정 협상 가격 제안
const negotiation = await advancedService.suggestNegotiationPrice(
  product,
  similarProducts
);

console.log(`협상 제안 가격: ${negotiation.price}원`);
console.log(`성공 확률: ${negotiation.successRate}%`);
```

### 4️⃣ 상품 설명 자동 생성
```typescript
// 사진만 올리면 AI가 설명 자동 생성
const description = await advancedService.generateDescription(
  productImages,
  category
);
```

### 5️⃣ 신뢰도 점수
```typescript
// 판매자 + 상품 종합 신뢰도 점수
const trustScore = await calculateTrustScore({
  seller: sellerProfile,
  product: product,
  history: transactionHistory,
});

console.log(`신뢰도: ${trustScore}/100`);
```

---

## 🔧 환경 설정

### 필수 환경 변수
```env
# .env
OPENAI_API_KEY=sk-...
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 의존성 설치
```bash
npm install @langchain/openai langchain openai natural ml-distance
```

---

## 📊 모니터링

```typescript
// 실시간 통계
const stats = {
  cacheHitRate: await cacheService.getCacheHitRate(),
  popularQueries: await cacheService.getPopularQueries(10),
  cachedItems: await cacheService.getStats(),
  embeddingCache: embeddingService.getCacheStats(),
};

console.log('AI 시스템 통계:', stats);
```

---

## 🎯 결론

이 AI 추천 시스템은:
- ✅ **벡터 임베딩**으로 정교한 검색
- ✅ **다단계 캐싱**으로 초고속 응답
- ✅ **가격 예측, 사기 탐지** 등 실용적인 AI 기능
- ✅ **확장 가능한 구조**

**다음 단계:**
1. 프론트엔드 UI 통합
2. A/B 테스트로 성능 검증
3. 사용자 피드백 수집
4. 추가 AI 기능 구현

**참고:**
- OpenAI API 비용 최적화 (캐싱으로 90% 절감 가능!)
- 벡터 DB (Pinecone, Weaviate) 도입 시 더 빠른 검색 가능

---

## 📞 문의

문제가 있거나 개선 아이디어가 있으면 이슈를 남겨주세요!

