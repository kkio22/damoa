# SmartTrade Frontend - 고객용 상품 검색 UI

당근마켓에서 크롤링한 중고 상품을 검색하고 조회하는 React 프론트엔드 애플리케이션입니다.

## 📋 주요 기능

### 기본 검색 기능 (todolist 2일차)
- ✅ 상품 검색 (키워드 기반)
- ✅ 동 단위 지역 필터
- ✅ 가격 범위 필터
- ✅ 상품 상태 필터 (판매중/거래완료/예약중)
- ✅ 로딩 스피너
- ✅ 페이지네이션 (페이지당 12개 상품)
- ✅ 반응형 디자인

### AI 분석 기능 (todolist 3일차) ✨
- ✅ **AI 상품 추천**: 검색 결과를 AI가 분석하여 최적의 상품 추천
- ✅ **시장 인사이트**: 평균 가격, 가격 범위, 인기 지역 분석
- ✅ **스마트 필터 제안**: AI가 최적의 필터 조합 자동 제안
- ✅ **관련 키워드**: 검색어 확장 및 유사어 추천
- ✅ **트렌딩 분석**: 인기 검색 키워드 및 트렌드 파악
- ✅ **AI 점수**: 각 상품에 0-100점 AI 매칭 점수 표시

## 🛠️ 기술 스택

- **런타임**: React 18
- **언어**: JavaScript (JSX)
- **HTTP 클라이언트**: Axios
- **빌드 툴**: Create React App

## 📦 설치 방법

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
REACT_APP_API_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm start
```

브라우저에서 `http://localhost:3001` 자동 열림

## 🚀 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build/` 디렉토리에 생성됩니다.

### 정적 서버로 실행

```bash
npm install -g serve
serve -s build -p 3001
```

## 📂 프로젝트 구조

```
frontend/
├── public/
│   └── index.html              # HTML 템플릿
├── src/
│   ├── components/
│   │   ├── ProductSearch.jsx   # 상품 검색 컴포넌트 (메인, todolist 2일차 + 3일차)
│   │   ├── LoadingSpinner.jsx  # 로딩 스피너 컴포넌트 (todolist 2일차)
│   │   ├── Pagination.jsx      # 페이지네이션 컴포넌트 (todolist 2일차)
│   │   ├── AIInsightCard.jsx   # AI 인사이트 카드 (todolist 3일차) ✨
│   │   ├── SuggestedFilters.jsx # AI 제안 필터 (todolist 3일차) ✨
│   │   ├── RelatedKeywords.jsx # 관련 키워드 태그 (todolist 3일차) ✨
│   │   └── MarketInsights.jsx  # 시장 인사이트 (todolist 3일차) ✨
│   ├── App.jsx                 # 메인 앱 컴포넌트
│   └── index.js                # 진입점
├── package.json
└── README.md
```

## 🎨 UI 구성

### 상품 검색 페이지 (기본)

- **검색 입력**: 상품명 키워드 검색
- **지역 필터**: 동 단위 지역 선택 (역삼동, 논현동 등)
- **가격 필터**: 최저가 ~ 최고가 범위 설정
- **검색 결과**: 카드 형태로 상품 표시
- **페이지네이션**: 페이지당 12개 상품, 이전/다음 버튼, 페이지 번호
- **상품 상세**: 클릭 시 당근마켓 원본 페이지로 이동

### AI 분석 기능 (todolist 3일차) ✨

#### 사용 방법
1. **검색 실행**: 먼저 일반 검색으로 상품을 찾습니다
2. **AI 분석 버튼**: "🤖 AI 추천 받기" 버튼 클릭
3. **AI 결과 확인**: 다음 정보를 확인할 수 있습니다:

#### AI 제공 정보
- **🤖 AI 시장 분석**: 평균 가격, 가격 범위, 인기 지역, 트렌딩 키워드
- **💡 AI 추천 필터**: 최적의 가격대 및 지역 자동 제안
- **🔍 연관 검색어**: 클릭하면 해당 키워드로 재검색
- **📊 시장 인사이트**: 가격 분포, 인기 지역 TOP 5, 인기 키워드
- **⭐ AI 추천 상품**: 0-100점 AI 점수와 추천 이유 표시

#### 주요 특징
- ✅ **일반 검색과 분리**: 일반 검색은 빠르고, AI 분석은 선택적으로 사용
- ✅ **자동 필터 적용**: AI 제안 필터를 클릭하면 자동으로 적용되고 재검색
- ✅ **키워드 확장**: 관련 키워드를 클릭하면 자동으로 해당 키워드로 검색
- ✅ **캐싱**: 동일한 검색어는 1시간 동안 캐시되어 빠른 응답

## 🔧 커스터마이징

### API URL 변경

`.env` 파일에서 백엔드 API URL을 변경할 수 있습니다:

```env
REACT_APP_API_URL=https://your-api-domain.com
```

### 스타일 변경

컴포넌트 파일의 `styles` 객체에서 스타일을 수정할 수 있습니다.

예시 (`ProductSearch.jsx`):

```javascript
const styles = {
  container: {
    maxWidth: '1200px',
    backgroundColor: '#fff',
    // ... 스타일 수정
  },
};
```

## 📡 API 연동 (todolist 2일차)

### POST /api/search - 상품 검색

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// 상품 검색 (POST 방식)
const searchProducts = async (query, filters) => {
  const requestBody = {
    query: query,
    filters: {
      locations: filters.locations || [],    // 배열 형식
      priceRange: {
        min: filters.minPrice,
        max: filters.maxPrice,
      },
      status: filters.status || 'available',  // available, sold, reserved
      platform: 'daangn',
    },
  };
  
  const response = await axios.post(`${API_URL}/api/search`, requestBody);
  return response.data;
};

// 사용 예시
const handleSearch = async () => {
  const result = await searchProducts('아이폰', {
    locations: ['역삼동', '논현동'],
    minPrice: 100000,
    maxPrice: 500000,
    status: 'available',
  });
  
  console.log(`검색 결과: ${result.totalCount}개`);
  console.log(`검색 시간: ${result.searchTime}초`);
  console.log(result.products);
};
```

### 응답 형식

```json
{
  "success": true,
  "totalCount": 12,
  "searchTime": 0.15,
  "products": [
    {
      "id": "daangn:123456",
      "platform": "daangn",
      "title": "아이폰 14 Pro",
      "price": 850000,
      "description": "상태 좋은 아이폰",
      "location": "역삼동",
      "status": "available",
      "imageUrls": ["https://..."],
      "originalUrl": "https://www.daangn.com/...",
      "createdAt": "2025-10-15T10:00:00Z"
    }
  ]
}
```

## 🐛 문제 해결

### CORS 에러

백엔드 서버에서 CORS를 허용해야 합니다. `backend/src/app.ts`에서 확인:

```typescript
import cors from 'cors';
app.use(cors());
```

### API 연결 실패

1. 백엔드 서버가 실행 중인지 확인
2. `.env` 파일의 API URL이 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 빌드 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📱 반응형 디자인

- **모바일**: 최소 너비 320px 지원
- **태블릿**: 최소 너비 768px 지원
- **데스크톱**: 최소 너비 1024px 지원

## 🔍 개발 팁

### React DevTools 사용

Chrome에서 React DevTools 확장 프로그램을 설치하여 컴포넌트 디버깅:

```
https://chrome.google.com/webstore/detail/react-developer-tools
```

### Hot Reload

`npm start`로 실행하면 코드 변경 시 자동으로 브라우저가 새로고침됩니다.

## 📄 라이센스

ISC

