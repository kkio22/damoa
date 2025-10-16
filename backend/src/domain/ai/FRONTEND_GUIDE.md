# 🎨 프론트엔드 AI 기능 통합 가이드

## ✅ 완료된 작업

### 1️⃣ 통합 완료!
- ✅ 기존 AI 분석 서비스에 **벡터 임베딩** 통합
- ✅ **가격 예측**, **사기 탐지**, **카테고리 분류** 추가
- ✅ **배치 처리** 구현 (5개씩)
- ✅ **다단계 캐싱** (분석 결과 + 벡터 + 인기 검색어)
- ✅ **캐시 히트율** 추적
- ✅ **인기 검색어** 추적

### 2️⃣ 프론트에서 사용하는 방법

**기존 엔드포인트 그대로 사용!** ✨

```javascript
// 프론트엔드에서 "AI 검색" 버튼 클릭 시 (전국 단위 검색)
const handleAISearch = async () => {
  const response = await fetch('http://localhost:8080/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: searchQuery,  // 사용자 검색어
      maxResults: 10,      // 옵션 (결과 개수)
    }),
  });

  const data = await response.json();
  console.log('AI 분석 결과:', data);
};
```

---

## 📡 사용 가능한 API 엔드포인트

### 1. AI 상품 분석 (메인!) - 전국 단위 검색
```http
POST /api/ai/analyze
Content-Type: application/json

{
  "query": "아이폰 14",
  "maxResults": 10  // 옵션
}
```

**응답 (개선됨!):**
```json
{
  "success": true,
  "searchQuery": "아이폰 14",
  "analyzedAt": "2025-10-16T12:00:00.000Z",
  "totalProducts": 50,
  
  // 추천 상품 (벡터 유사도 기반!)
  "recommendations": [
    {
      "product": {
        "id": "123",
        "title": "아이폰 14 프로 256GB",
        "price": 1200000,
        "location": "역삼동",
        ...
      },
      "score": 95.5,  // 벡터 유사도 점수 (0-100)
      "reasons": [
        "벡터 유사도: 95.5점",
        "제목이 검색어와 정확히 일치합니다",
        "현재 판매 중인 상품입니다"
      ],
      "matchedKeywords": ["아이폰", "14", "프로"]
    },
    ...
  ],
  
  // 시장 인사이트
  "insights": {
    "averagePrice": 1150000,
    "priceRange": { "min": 900000, "max": 1500000 },
    "mostCommonLocations": ["서울", "경기", "부산"],  // 전국 단위
    "trendingItems": ["프로", "256GB", "화이트"],
    "summary": "아이폰 14 프로 시장은 평균 115만원에 거래되고 있습니다..."
  },
  
  // 필터 제안 (가격만)
  "suggestedFilters": {
    "priceRange": { "min": 805000, "max": 1495000 }
  },
  
  // 관련 키워드
  "relatedKeywords": ["아이폰", "14", "프로", "애플", "스마트폰"],
  
  // 🆕 고급 AI 분석 (TOP 1 상품에 대해)
  "topProductAnalysis": {
    // 가격 예측
    "pricePrediction": {
      "predictedPrice": 1180000,
      "confidence": 0.85,
      "priceRange": { "min": 1000000, "max": 1350000 },
      "reasoning": "5개 유사 상품의 평균 가격과 상태를 고려하여 예측했습니다."
    },
    
    // 사기 탐지
    "fraudDetection": {
      "isSuspicious": false,
      "riskScore": 15,  // 0-100 (낮을수록 안전)
      "redFlags": [],
      "recommendations": [
        "판매자 프로필을 확인하세요",
        "직거래를 권장합니다"
      ]
    },
    
    // 카테고리 분류
    "categoryClassification": {
      "category": "전자기기",
      "confidence": 0.95,
      "subCategories": ["스마트폰", "아이폰"],
      "reasoning": "아이폰 관련 키워드가 명확하게 포함되어 있습니다"
    }
  }
}
```

---

### 2. 인기 검색어 조회 (신규!)
```http
GET /api/ai/popular-queries?limit=10
```

**응답:**
```json
{
  "success": true,
  "data": [
    { "query": "아이폰", "count": 150 },
    { "query": "맥북", "count": 120 },
    { "query": "갤럭시", "count": 95 },
    ...
  ]
}
```

---

### 3. 캐시 히트율 조회 (신규!)
```http
GET /api/ai/cache/hit-rate
```

**응답:**
```json
{
  "success": true,
  "data": {
    "hits": 450,
    "misses": 50,
    "hitRate": 0.9,
    "hitRatePercentage": "90.00%"
  }
}
```

---

### 4. 캐시 통계 조회
```http
GET /api/ai/cache/stats
```

**응답:**
```json
{
  "success": true,
  "data": {
    "totalCached": 25,
    "cacheKeys": ["아이폰:50", "맥북:30", ...]
  }
}
```

---

### 5. 캐시 삭제
```http
DELETE /api/ai/cache
```

**응답:**
```json
{
  "success": true,
  "message": "AI 캐시가 모두 삭제되었습니다"
}
```

---

## 🎯 프론트엔드 구현 예시

### React 컴포넌트 예시

```jsx
import React, { useState } from 'react';

function AISearchComponent() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [popularQueries, setPopularQueries] = useState([]);

  // AI 검색
  const handleAISearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          maxResults: 10,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        console.log('✅ AI 분석 완료:', data);
        
        // 고급 AI 정보 표시
        if (data.topProductAnalysis) {
          const { pricePrediction, fraudDetection } = data.topProductAnalysis;
          console.log('💰 예상 가격:', pricePrediction.predictedPrice);
          console.log('🛡️ 사기 위험도:', fraudDetection.riskScore);
        }
      }
    } catch (error) {
      console.error('❌ AI 검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 인기 검색어 조회
  const loadPopularQueries = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/ai/popular-queries?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setPopularQueries(data.data);
      }
    } catch (error) {
      console.error('인기 검색어 조회 실패:', error);
    }
  };

  return (
    <div>
      <h2>🤖 AI 상품 검색</h2>
      
      {/* 검색 입력 */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="상품을 검색하세요 (예: 아이폰 14)"
      />
      
      <button onClick={handleAISearch} disabled={loading}>
        {loading ? '분석 중...' : 'AI 검색'}
      </button>
      
      {/* 인기 검색어 */}
      <div>
        <h3>🔥 인기 검색어</h3>
        <button onClick={loadPopularQueries}>불러오기</button>
        <ul>
          {popularQueries.map((item, idx) => (
            <li key={idx} onClick={() => setQuery(item.query)}>
              {item.query} ({item.count}회)
            </li>
          ))}
        </ul>
      </div>
      
      {/* 검색 결과 */}
      {results && (
        <div>
          <h3>📊 검색 결과 ({results.totalProducts}개)</h3>
          
          {/* 추천 상품 */}
          {results.recommendations.map((rec, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h4>{rec.product.title}</h4>
              <p>가격: {rec.product.price.toLocaleString()}원</p>
              <p>점수: {rec.score.toFixed(1)}/100</p>
              <p>이유: {rec.reasons.join(', ')}</p>
              
              {/* 고급 AI 정보 (첫 번째 상품만) */}
              {idx === 0 && results.topProductAnalysis && (
                <div style={{ background: '#f0f8ff', padding: '10px', marginTop: '10px' }}>
                  <h5>🤖 AI 분석</h5>
                  
                  {/* 가격 예측 */}
                  <p>
                    💰 예상 적정 가격: {results.topProductAnalysis.pricePrediction.predictedPrice.toLocaleString()}원
                    (신뢰도: {(results.topProductAnalysis.pricePrediction.confidence * 100).toFixed(0)}%)
                  </p>
                  
                  {/* 사기 탐지 */}
                  <p style={{ 
                    color: results.topProductAnalysis.fraudDetection.isSuspicious ? 'red' : 'green' 
                  }}>
                    🛡️ 사기 위험도: {results.topProductAnalysis.fraudDetection.riskScore}/100
                    {results.topProductAnalysis.fraudDetection.isSuspicious && ' (주의 필요!)'}
                  </p>
                  
                  {/* 카테고리 */}
                  <p>
                    📂 카테고리: {results.topProductAnalysis.categoryClassification.category}
                  </p>
                </div>
              )}
            </div>
          ))}
          
          {/* 시장 인사이트 */}
          <div style={{ background: '#f9f9f9', padding: '15px', marginTop: '20px' }}>
            <h4>📈 시장 분석</h4>
            <p>평균 가격: {results.insights.averagePrice.toLocaleString()}원</p>
            <p>가격 범위: {results.insights.priceRange.min.toLocaleString()}원 ~ {results.insights.priceRange.max.toLocaleString()}원</p>
            <p>주요 지역: {results.insights.mostCommonLocations.join(', ')}</p>
            <p>트렌드: {results.insights.trendingItems.join(', ')}</p>
            <p>요약: {results.insights.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AISearchComponent;
```

---

## ⚡ 성능 최적화 팁

### 1. 캐싱 효과 최대화
```javascript
// 같은 검색어는 초고속으로 응답!
// 첫 검색: 2-3초 (AI 분석)
// 두 번째: 0.05초 (캐시) ← 60배 빠름!
```

### 2. 배치 처리 자동화
- 벡터 임베딩은 자동으로 5개씩 배치 처리됨
- 프론트에서는 신경 쓸 필요 없음!

### 3. 인기 검색어 활용
```javascript
// 메인 페이지에 인기 검색어 표시
const popularQueries = await getPopularQueries(5);
// → 사용자에게 추천 검색어 제시
```

---

## 🎁 추가 기능 아이디어

### 1. 자동 완성
```javascript
// 사용자가 타이핑할 때마다 AI 키워드 제안
const suggestions = results.relatedKeywords;
```

### 2. 가격 알림
```javascript
// 예상 가격보다 저렴한 상품 하이라이트
if (product.price < pricePrediction.predictedPrice * 0.9) {
  showBadge('🔥 가격 좋음!');
}
```

### 3. 사기 경고
```javascript
// 위험 점수 높으면 경고 표시
if (fraudDetection.isSuspicious) {
  showWarning('⚠️ 주의: 사기 위험이 감지되었습니다!');
}
```

---

## 📝 요약

### ✅ 완료된 작업
1. 기존 AI 기능에 벡터 임베딩 통합
2. 가격 예측, 사기 탐지, 카테고리 분류 추가
3. 배치 처리 (5개씩) 구현
4. 다단계 캐싱 (분석 + 벡터 + 인기 검색어)
5. 캐시 히트율 추적
6. 인기 검색어 추적
7. 2개의 새로운 엔드포인트 추가

### 📡 사용 방법
**기존대로 `/api/ai/analyze` 호출하면 끝!**
- 자동으로 벡터 검색 사용
- 자동으로 고급 AI 분석 포함
- 자동으로 캐싱 처리

**추가 기능:**
- `/api/ai/popular-queries` - 인기 검색어
- `/api/ai/cache/hit-rate` - 캐시 히트율

### 🚀 다음 단계
1. React 컴포넌트에 통합
2. UI/UX 개선 (로딩 상태, 에러 처리)
3. 가격 알림, 사기 경고 등 실시간 피드백

---

## 💡 핵심 포인트

1. **프론트는 기존 코드 그대로!**
   - POST `/api/ai/analyze` 만 호출하면 됨
   - 응답에 고급 AI 정보가 추가됨

2. **자동으로 최적화됨!**
   - 벡터 검색 자동 사용
   - 배치 처리 자동 실행
   - 캐싱 자동 처리

3. **추가 기능은 선택!**
   - 인기 검색어, 캐시 히트율은 필요하면 사용

**모든 것이 준비되었습니다!** 🎉

