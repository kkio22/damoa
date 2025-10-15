# ✅ SmartTrade MVP 개발 체크리스트 (5일 일정)

**개발 기간**: 2025년 10월 13일 ~ 10월 17일 (5일)  
**기술 스택**: JavaScript + React + Node.js + PostgreSQL + Redis + LangGraph  
**프로젝트**: SmartTrade MVP - AI 기반 중고거래 상품 추천 플랫폼

---

## 📅 개발 일정 개요

| 날짜 | 주요 작업 | 목표 |
|------|-----------|------|
| **10/13 (월)** | 프로젝트 초기 설정 & 기본 구조 | 개발 환경 구축 완료 |
| **10/14 (화)** | 핵심 검색 기능 개발 | 검색 API + UI 완성 |
| **10/15 (수)** | AI 분석 기능 & 크롤링 시스템 | AI 워크플로우 + 데이터 수집 |
| **10/16 (목)** | UI/UX 개선 & 성능 최적화 | 사용자 경험 향상 |
| **10/17 (금)** | 테스트 & 배포 | MVP 배포 완료 |

---

## 🏗️ 1일차 (10/13) - 프로젝트 초기 설정

### 개발 환경 구축
- [x] **워크스페이스 생성**: smartocr-platform 루트 폴더
- [x] **Frontend 프로젝트**: Next.js 14 + TypeScript + App Router
- [x] **Backend 프로젝트**: Node.js + Express + TypeScript
- [x] **AI 서버 프로젝트**: Python + FastAPI + LangGraph (`langgraph new` 명령으로 생성)
- [x] **데이터베이스**: PostgreSQL 15 (로컬 + Railway)
- [x] **캐시 서버**: Redis 7 (로컬 + Railway)
- [x] **Git 저장소**: GitLab 통합 저장소 (git@gitlab.com:deviantceai/ocr-projects.git)
- [x] **Docker 환경**: docker-compose.yml 전체 스택 설정

#### 개발 환경 구축
- [ ] Frontend 프로젝트 생성 (React + Vite + JavaScript)
- [ ] Backend 프로젝트 생성 (Node.js + Express + JavaScript)
- [ ] Git 저장소 생성 및 초기 커밋
- [ ] 환경변수 설정 (.env 파일들)
- [ ] Docker Compose 설정 (로컬 개발 환경)

#### 필수 패키지 설치
- [ ] Frontend: React, Vite, TailwindCSS, Zustand, React Query, React Hook Form
- [ ] Backend: Express, cors, helmet, dotenv, bull, ioredis, pg
- [ ] AI: LangGraph, LangChain, OpenAI
- [ ] 개발 도구: ESLint, Prettier, nodemon

#### Backend (Node.js)
- [x] **Core**: express, typescript, ts-node
- [x] **Database**: prisma, @prisma/client, postgresql
- [x] **Auth**: jsonwebtoken, bcryptjs, passport
- [x] **Cache**: redis, ioredis
- [x] **Queue**: bull, @types/bull
- [x] **Payment**: stripe
- [x] **Storage**: aws-sdk, multer
- [x] **Security**: helmet, cors, express-rate-limit
- [x] **Utils**: dotenv, joi, winston
- [x] **Dev Tools**: nodemon, supertest, jest

#### 데이터베이스 설정
- [ ] PostgreSQL 데이터베이스 생성 (Supabase/Railway)
- [ ] Redis 인스턴스 생성 (Upstash/Railway)
- [ ] 데이터베이스 스키마 생성 (search_logs, crawling_logs)
- [ ] Redis 연결 테스트

#### 기본 프로젝트 구조 설정
- [ ] Frontend 폴더 구조 생성 (components, hooks, store, services)
- [ ] Backend 폴더 구조 생성 (controllers, services, routes, middlewares)
- [ ] AI 서비스 폴더 구조 생성 (workflows, agents, models)
- [ ] JavaScript 모듈 구조 설정

#### 기본 라우팅 설정
- [ ] Frontend: React Router 기본 설정
- [ ] Backend: Express 기본 라우터 설정
- [ ] CORS 및 기본 미들웨어 설정

---

## 🔍 2일차 (10/14) - 핵심 검색 기능 개발

### 🌅 오전 (09:00-12:00)

#### 검색 API 개발
- [ ] POST /api/search 엔드포인트 구현
- [ ] Redis 검색 로직 구현 (상품 데이터 조회)
- [ ] 검색 결과 필터링 로직 (가격, 지역, 거래방식)
- [ ] 검색 로그 저장 기능 (PostgreSQL)
- [ ] API 응답 형식 표준화

#### 검색 상태 관리 (Zustand)
- [ ] SearchState 객체 구조 정의
- [ ] 검색 관련 액션 구현 (setSearchQuery, setFilters, searchProducts)
- [ ] 로딩 상태 관리
- [ ] 에러 상태 관리

---

#### 검색 UI 컴포넌트 개발
- [ ] SearchForm 컴포넌트 구현 (검색어 입력, 필터 설정)
- [ ] FilterPanel 컴포넌트 구현 (가격대, 지역, 거래방식)
- [ ] ProductCard 컴포넌트 구현 (상품 정보 표시)
- [ ] ProductGrid 컴포넌트 구현 (검색 결과 그리드)
- [ ] LoadingSpinner 컴포넌트 구현

#### 검색 페이지 구현
- [ ] 홈페이지 (/) 검색 인터페이스 구현
- [ ] 검색 결과 표시 로직
- [ ] 페이지네이션 구현
- [ ] 반응형 디자인 적용 (모바일/태블릿/데스크톱)

#### 통합 테스트
- [ ] Frontend-Backend 연결 테스트
- [ ] 검색 기능 전체 플로우 테스트
- [ ] 에러 처리 테스트

---

## 🤖 3일차 (10/15) - AI 분석 기능 & 크롤링 시스템

### next-intl 설정
- [x] **i18n 미들웨어**: middleware.ts 라우팅 설정 (기본 설정 완료)
- [x] **언어 라우팅**: [locale] 동적 라우팅
- [x] **번역 파일**: messages/{en,es,fr,de,ja,zh}.json (6개 언어 완료)
- [x] **서버 컴포넌트**: getTranslations 사용
- [x] **클라이언트 컴포넌트**: useTranslations 훅

#### LangGraph AI 워크플로우 개발
- [ ] POST /api/ai/analyze 엔드포인트 구현
- [ ] LangGraph 워크플로우 설계 (검색어 분석 → 상품 매칭 → 점수 계산)
- [ ] LangChain 에이전트 구현 (상품 분석 에이전트)
- [ ] OpenAI API 통합 (GPT 모델 연동)
- [ ] AI 분석 결과 캐싱 (Redis)

#### AI 분석 UI 컴포넌트
- [ ] AIInsightCard 컴포넌트 구현 (AI 분석 결과 표시)
- [ ] SuggestedFilters 컴포넌트 구현 (AI 제안 필터)
- [ ] RelatedKeywords 컴포넌트 구현 (관련 키워드 태그)
- [ ] MarketInsights 컴포넌트 구현 (시장 인사이트)

---

#### 크롤링 시스템 개발
- [ ] 크롤링 스케줄러 구현 (Node-cron, 매일 자정)
- [ ] 당근마켓 크롤러 구현 (Puppeteer/Playwright)
- [ ] 중고나라 크롤러 구현
- [ ] 번개장터 크롤러 구현
- [ ] 데이터 정제 로직 (중복 제거, 검증, 표준화)

#### 크롤링 데이터 처리
- [ ] Redis 데이터 교체 로직 (백업 → 새 데이터 → 교체)
- [ ] 크롤링 로그 저장 (PostgreSQL)
- [ ] 에러 처리 및 재시도 로직
- [ ] Rate Limiting 구현 (사이트 보호)

#### 시스템 상태 API
- [ ] GET /api/system/status 엔드포인트 구현
- [ ] 크롤링 상태 조회 기능
- [ ] 시스템 통계 조회 기능
- [ ] 상태 모니터링 UI 컴포넌트

---

## 🎨 4일차 (10/16) - UI/UX 개선 & 성능 최적화

### 🏗️ 파일 기반 처리 아키텍처 구축
- [x] **LangGraph 프로젝트 생성**: langgraph new smartocr-ai-server (완료)
- [x] **Docker 통합**: docker-compose.yml에 AI 서버 통합 (완료)
- [x] **공유 스토리지 설정**: `/shared/ocr-data` Docker Volume 기반 파일 공유 시스템 (완료)
- [x] **의존성 해결**: pdftotext 빌드 오류 해결 (완료)
- [x] **메타데이터 관리**: metadata.json 기반 상태 추적 (완료)
- [x] **디렉토리 구조**: process_id별 격리된 작업 공간 (`uploads/{process_id}/`) (완료)
- [x] **공유 스토리지 유틸리티**: 디렉토리 생성, 메타데이터 읽기/쓰기 함수 (완료)
- [x] **파일 정리**: 24시간 후 임시 파일 자동 정리 (완료)

#### UI/UX 개선
- [ ] TailwindCSS 컴포넌트 라이브러리 적용
- [ ] CSS 애니메이션 및 트랜지션 추가
- [ ] 로딩 상태 개선 (스켈레톤 UI)
- [ ] 에러 상태 UI 개선
- [ ] 빈 상태 (Empty State) UI 구현

#### 사용자 경험 최적화
- [ ] 검색어 입력 디바운싱 (300ms)
- [ ] 검색 결과 가상 스크롤링 (대량 데이터)
- [ ] 이미지 지연 로딩 (Lazy Loading)
- [ ] 검색 히스토리 기능
- [ ] 키보드 네비게이션 지원

### AI 서비스 개발
- [x] **OpenAI 클라이언트**: GPT-4 Turbo 연동 (완료)
- [x] **PDF 처리 서비스**: pdftotext 최적화 (완료)
- [x] **언어 감지**: 10개 언어 자동 인식 (완료)
- [x] **품질 평가**: 텍스트 신뢰도 점수 계산 (완료)
- [x] **번역 서비스**: 6개 언어 번역 지원 (완료)

#### 성능 최적화
- [ ] React Query 캐싱 전략 구현
- [ ] Redis 캐시 최적화 (TTL 설정)
- [ ] API 응답 압축 (gzip)
- [ ] 정적 자원 최적화
- [ ] 번들 크기 최적화

#### 접근성 및 SEO
- [ ] 웹 접근성 개선 (ARIA 라벨, 키보드 네비게이션)
- [ ] SEO 메타 태그 설정
- [ ] 구조화된 데이터 (JSON-LD) 추가
- [ ] 사이트맵 생성

#### 모바일 최적화
- [ ] 모바일 터치 인터페이스 최적화
- [ ] 모바일 성능 최적화
- [ ] PWA 기본 설정 (향후 확장용)

---

## 🚀 5일차 (10/17) - 테스트 & 배포

### 랜딩 페이지 구조
- [x] **Hero 섹션**: 메인 비주얼 + CTA 버튼 + OCR 체험 기능
- [x] **기능 소개**: OCR, AI 보정, 번역 기능 (6개 주요 기능)
- [x] **가격 안내**: 3개 플랜 비교표 (Basic, Pro, Enterprise)
- [x] **사용법 가이드**: 3단계 사용법 (Upload → Process → Download)
- [x] **고객 후기**: 소셜 프루프 (완료)
- [x] **FAQ**: 자주 묻는 질문 (8개 주요 질문)
- [x] **Footer**: 링크, 연락처, 소셜 미디어
- [x] **Navigation**: 헤더 네비게이션 + 언어 선택기

#### 테스트 구현
- [ ] Frontend 컴포넌트 테스트 (React Testing Library)
- [ ] Backend API 테스트 (Jest + Supertest)
- [ ] AI 워크플로우 테스트
- [ ] 통합 테스트 (검색 플로우 전체)
- [ ] E2E 테스트 (Playwright, 선택사항)

#### 버그 수정 및 최종 점검
- [ ] 발견된 버그 수정
- [ ] 코드 리뷰 및 리팩토링
- [ ] 성능 프로파일링 및 최적화
- [ ] 보안 검토 (Rate Limiting, CORS, 입력 검증)

### SEO 최적화
- [ ] **메타 태그**: 6개 언어별 SEO 태그
- [ ] **Open Graph**: 소셜 미디어 공유 최적화
- [ ] **Sitemap**: 다국어 사이트맵 생성
- [ ] **구조화 데이터**: Schema.org 마크업
- [ ] **페이지 속도**: Core Web Vitals 최적화

#### 배포 준비
- [ ] 환경별 설정 분리 (development, production)
- [ ] 환경변수 설정 (배포용)
- [ ] 데이터베이스 마이그레이션 스크립트
- [ ] Redis 백업 및 복구 스크립트

#### 배포 실행
- [ ] Frontend 배포 (Vercel)
- [ ] Backend + AI 서비스 배포 (Railway/Render)
- [ ] 도메인 연결 및 SSL 설정
- [ ] CDN 설정 (정적 자원)

#### 모니터링 설정
- [ ] Sentry 에러 추적 설정
- [ ] Vercel Analytics 설정
- [ ] Redis 모니터링 설정
- [ ] 기본 알림 설정

#### 최종 테스트
- [ ] 배포된 환경에서 전체 기능 테스트
- [ ] 성능 테스트 (응답 시간, 동시 사용자)
- [ ] 크롤링 시스템 테스트
- [ ] AI 분석 기능 테스트

---

## 📊 일일 마일스톤 체크리스트

### ✅ 1일차 완료 기준
- [ ] 개발 환경이 완전히 구축되어 로컬에서 실행 가능
- [ ] 데이터베이스 연결 및 기본 스키마 생성 완료
- [ ] Frontend와 Backend 기본 구조가 설정되어 통신 가능

### ✅ 2일차 완료 기준
- [ ] 검색 기능이 완전히 작동 (검색어 입력 → 결과 표시)
- [ ] 필터 기능이 정상 작동
- [ ] 검색 결과가 카드 형태로 표시됨

### ✅ 3일차 완료 기준
- [ ] AI 분석 기능이 정상 작동
- [ ] 크롤링 시스템이 실행되어 데이터 수집 가능
- [ ] 시스템 상태 모니터링이 가능

### ✅ 4일차 완료 기준
- [ ] UI/UX가 사용자 친화적으로 개선됨
- [ ] 성능 최적화가 적용되어 빠른 응답 속도 확보
- [ ] 모바일에서도 정상 작동

### ✅ 5일차 완료 기준
- [ ] MVP가 실제 배포되어 외부에서 접근 가능
- [ ] 모든 핵심 기능이 정상 작동
- [ ] 모니터링 시스템이 작동하여 운영 가능

---

## 🚨 위험 요소 및 대응 방안

### 높은 우선순위 위험
- **크롤링 차단**: 각 사이트의 정책 변경으로 크롤링이 차단될 수 있음
  - 대응: Rate Limiting 강화, 프록시 사용, 대체 데이터 소스 준비
- **AI API 제한**: OpenAI API 사용량 제한 또는 비용 초과
  - 대응: 캐싱 강화, 대체 AI 서비스 준비, 로컬 모델 고려
- **Redis 메모리 부족**: 상품 데이터가 많아져 메모리 부족
  - 대응: 데이터 압축, TTL 최적화, 클러스터링 준비

### 중간 우선순위 위험
- **성능 이슈**: 검색 응답 시간이 느려질 수 있음
  - 대응: 인덱싱 최적화, 캐싱 전략 개선, CDN 활용
- **데이터 정확성**: 크롤링된 데이터의 품질 문제
  - 대응: 데이터 검증 로직 강화, 수동 검토 프로세스

---

## 📈 성공 지표

### 기술적 지표
- [ ] 검색 API 응답 시간 3초 이내
- [ ] AI 분석 응답 시간 5초 이내
- [ ] 시스템 가용성 99% 이상
- [ ] 에러율 5% 이하

### 사용자 경험 지표
- [ ] 검색 결과 클릭률 10% 이상
- [ ] 평균 세션 시간 3분 이상
- [ ] 모바일 사용자 만족도 70% 이상

### 비즈니스 지표
- [ ] 일일 활성 사용자 100명 이상
- [ ] 검색 기능 사용률 80% 이상
- [ ] 사용자 유지율 7일 기준 20% 이상

---

## 🔄 상세 개발 워크플로우

### 📋 개발 프로세스 표준화

#### 1. 기능 개발 프로세스
```
1. 요구사항 분석
   ├── API 명세서 확인
   ├── UI/UX 디자인 검토
   └── 기술적 제약사항 파악

2. 백엔드 개발
   ├── API 엔드포인트 구현
   ├── 비즈니스 로직 작성
   ├── 데이터베이스 연동
   └── 단위 테스트 작성

3. 프론트엔드 개발
   ├── 컴포넌트 설계
   ├── 상태 관리 구현
   ├── API 연동
   └── 컴포넌트 테스트 작성

4. 통합 테스트
   ├── API 테스트
   ├── E2E 테스트
   ├── 성능 테스트
   └── 사용자 시나리오 테스트

5. 코드 리뷰 및 병합
   ├── 코드 품질 검토
   ├── 보안 검토
   ├── 성능 검토
   └── 메인 브랜치 병합
```

#### 2. Git 워크플로우
```bash
# 기능 브랜치 생성
git checkout -b feature/search-functionality

# 개발 진행
git add .
git commit -m "feat: 검색 API 엔드포인트 구현"

# 메인 브랜치와 동기화
git checkout main
git pull origin main
git checkout feature/search-functionality
git rebase main

# Pull Request 생성
git push origin feature/search-functionality
```

#### 3. 코드 품질 관리
- **ESLint**: JavaScript 코드 스타일 및 오류 검사
- **Prettier**: 코드 포맷팅 자동화
- **Husky**: Git 훅을 통한 커밋 전 검사
- **Jest**: 단위 테스트 자동화
- **Supertest**: API 테스트 자동화

### 🏗️ 아키텍처별 개발 가이드

#### Frontend 아키텍처 개발
```javascript
// 1. 컴포넌트 구조 설계
src/
├── components/
│   ├── ui/              # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   ├── search/          # 검색 관련 컴포넌트
│   │   ├── SearchForm.jsx
│   │   ├── FilterPanel.jsx
│   │   └── ProductCard.jsx
│   └── layout/          # 레이아웃 컴포넌트
│       ├── Header.jsx
│       └── Footer.jsx
├── hooks/               # 커스텀 훅
│   ├── useSearch.js
│   ├── useProducts.js
│   └── useAIAnalysis.js
├── store/               # Zustand 상태 관리
│   ├── searchStore.js
│   ├── productStore.js
│   └── systemStore.js
├── services/            # API 호출 함수
│   ├── api.js
│   ├── searchService.js
│   └── aiService.js
└── utils/               # 유틸리티 함수
    ├── formatters.js
    ├── validators.js
    └── constants.js
```

#### Backend 아키텍처 개발
```javascript
// 2. 서버 구조 설계
src/
├── controllers/         # 요청 처리 컨트롤러
│   ├── searchController.js
│   ├── aiController.js
│   └── systemController.js
├── services/           # 비즈니스 로직
│   ├── searchService.js
│   ├── aiService.js
│   ├── crawlerService.js
│   └── redisService.js
├── models/             # 데이터 모델
│   ├── SearchLog.js
│   ├── CrawlingLog.js
│   └── Product.js
├── routes/             # 라우터 정의
│   ├── searchRoutes.js
│   ├── aiRoutes.js
│   └── systemRoutes.js
├── middlewares/        # 미들웨어
│   ├── auth.js
│   ├── validation.js
│   ├── rateLimiter.js
│   └── errorHandler.js
├── config/             # 설정 파일
│   ├── database.js
│   ├── redis.js
│   └── ai.js
├── crawlers/           # 크롤링 로직
│   ├── daangnCrawler.js
│   ├── joonggoCrawler.js
│   └── bunjangCrawler.js
└── ai/                 # AI 서비스
    ├── workflows/
    │   ├── searchAnalysis.js
    │   └── productMatching.js
    ├── agents/
    │   ├── searchAgent.js
    │   └── recommendationAgent.js
    └── utils/
        ├── textProcessor.js
        └── similarityCalculator.js
```

### 🔧 개발 도구 및 환경 설정

#### 1. 로컬 개발 환경
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/smarttrade
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=smarttrade
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 2. 환경변수 관리
```bash
# Frontend .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development

# Backend .env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/smarttrade
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

### 🧪 테스트 전략 상세

#### 1. Frontend 테스트
```javascript
// 컴포넌트 테스트 예시
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchForm } from '../SearchForm';

describe('SearchForm', () => {
  test('검색어 입력 및 제출', () => {
    const mockOnSubmit = jest.fn();
    render(<SearchForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('상품명을 입력하세요');
    const button = screen.getByRole('button', { name: '검색' });
    
    fireEvent.change(input, { target: { value: '아이폰' } });
    fireEvent.click(button);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      query: '아이폰',
      filters: expect.any(Object)
    });
  });
});
```

#### 2. Backend 테스트
```javascript
// API 테스트 예시
import request from 'supertest';
import app from '../app';

describe('Search API', () => {
  test('POST /api/search - 성공적인 검색', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({
        query: '아이폰',
        filters: {
          priceRange: { min: 0, max: 1000000 }
        }
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.products).toBeDefined();
    expect(Array.isArray(response.body.data.products)).toBe(true);
  });
});
```

#### 3. E2E 테스트
```javascript
// Playwright E2E 테스트
import { test, expect } from '@playwright/test';

test('전체 검색 플로우', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 검색어 입력
  await page.fill('[data-testid="search-input"]', '아이폰');
  
  // 검색 버튼 클릭
  await page.click('[data-testid="search-button"]');
  
  // 검색 결과 대기
  await page.waitForSelector('[data-testid="product-card"]');
  
  // 검색 결과 확인
  const productCards = await page.locator('[data-testid="product-card"]');
  await expect(productCards).toHaveCount.greaterThan(0);
});
```

---

## 🚀 상세 배포 인프라

### 📦 컨테이너화 전략

#### 1. Frontend 컨테이너화
- **빌드 단계**: Node.js 18 Alpine 이미지를 사용하여 React 앱 빌드
- **런타임 단계**: Nginx Alpine 이미지로 정적 파일 서빙
- **최적화**: 멀티스테이지 빌드로 이미지 크기 최소화
- **설정**: Nginx 설정 파일을 통한 라우팅 및 프록시 구성
- **포트**: 80번 포트로 HTTP 서비스 제공

#### 2. Backend 컨테이너화
- **베이스 이미지**: Node.js 18 Alpine으로 경량화된 환경 구성
- **의존성 관리**: package.json 기반으로 프로덕션 의존성만 설치
- **소스 코드**: 애플리케이션 코드를 컨테이너 내부로 복사
- **포트 노출**: 5000번 포트로 API 서비스 제공
- **헬스체크**: 30초 간격으로 애플리케이션 상태 모니터링
- **실행 명령**: npm start로 프로덕션 모드 실행

#### 3. Nginx 리버스 프록시 설정
- **업스트림**: Backend 서버를 업스트림으로 설정
- **정적 파일**: Frontend 빌드 결과물을 정적 파일로 서빙
- **API 프록시**: /api 경로로 들어오는 요청을 Backend로 전달
- **헤더 설정**: 실제 클라이언트 IP와 포워딩 정보 전달
- **SPA 지원**: React Router를 위한 try_files 설정

### ☁️ 클라우드 배포 전략

#### 1. Vercel Frontend 배포
- **빌드 설정**: package.json 기반 자동 빌드 감지
- **출력 디렉토리**: dist 폴더를 정적 파일 소스로 설정
- **라우팅**: 모든 경로를 index.html로 리다이렉트하여 SPA 지원
- **환경변수**: API URL 등 프론트엔드 환경변수 설정
- **도메인**: 커스텀 도메인 연결 및 SSL 자동 설정
- **CDN**: 글로벌 CDN을 통한 빠른 정적 파일 전송

#### 2. Railway Backend 배포
- **빌드 도구**: NIXPACKS를 사용한 자동 빌드 감지
- **시작 명령**: npm start로 애플리케이션 실행
- **헬스체크**: /health 엔드포인트로 서비스 상태 확인
- **재시작 정책**: 실패 시 자동 재시작 (최대 10회)
- **환경변수**: 프로덕션 환경변수 설정
- **스케일링**: 트래픽에 따른 자동 스케일링

#### 3. 환경별 설정 관리
- **개발 환경**: 로컬 데이터베이스와 Redis 사용
- **프로덕션 환경**: 클라우드 데이터베이스와 Redis 사용
- **API 키**: OpenAI API 키 등 민감한 정보 환경변수로 관리
- **CORS 설정**: 프론트엔드 도메인만 허용하도록 설정
- **JWT 시크릿**: 프로덕션용 강력한 시크릿 키 사용

### 🔍 모니터링 및 로깅

#### 1. Sentry 에러 추적 시스템
- **초기화**: DSN을 통한 Sentry 클라이언트 설정
- **환경 구분**: 개발/프로덕션 환경별 에러 추적
- **성능 모니터링**: 트랜잭션 샘플링으로 성능 측정
- **에러 바운더리**: React 컴포넌트 에러 캐치 및 처리
- **사용자 피드백**: 에러 발생 시 사용자 피드백 수집
- **알림 설정**: 심각한 에러 발생 시 즉시 알림

#### 2. Winston 로깅 시스템
- **로그 레벨**: info 레벨 이상의 로그만 기록
- **포맷 설정**: 타임스탬프와 에러 스택 정보 포함
- **파일 출력**: error.log와 combined.log 파일로 분리 저장
- **콘솔 출력**: 개발 환경에서만 콘솔에 로그 출력
- **구조화**: JSON 형태로 구조화된 로그 저장
- **로그 로테이션**: 파일 크기 제한 및 자동 로테이션

#### 3. 헬스체크 시스템
- **업타임 모니터링**: 애플리케이션 실행 시간 추적
- **데이터베이스 체크**: PostgreSQL 연결 상태 확인
- **Redis 체크**: Redis 연결 및 응답 시간 확인
- **AI 서비스 체크**: LangGraph 서비스 상태 확인
- **응답 형식**: JSON 형태로 상태 정보 제공
- **에러 처리**: 체크 실패 시 503 상태 코드 반환

### 🔒 보안 및 성능 최적화

#### 1. 보안 미들웨어 설정
- **Helmet 보안 헤더**: XSS, CSRF, 클릭재킹 등 보안 헤더 설정
- **CSP 정책**: 콘텐츠 보안 정책으로 스크립트 실행 제한
- **Rate Limiting**: IP별 요청 수 제한으로 DDoS 공격 방지
- **CORS 설정**: 허용된 도메인에서만 API 접근 가능
- **입력 검증**: 모든 입력 데이터 유효성 검사
- **SQL 인젝션 방지**: 파라미터화된 쿼리 사용

#### 2. 성능 최적화 전략
- **Redis 캐싱**: 자주 조회되는 데이터를 Redis에 캐싱
- **응답 압축**: gzip 압축으로 네트워크 대역폭 절약
- **이미지 최적화**: WebP 포맷 및 지연 로딩 적용
- **번들 최적화**: 코드 스플리팅 및 트리 셰이킹
- **CDN 활용**: 정적 자원을 CDN을 통해 전송
- **데이터베이스 인덱싱**: 자주 조회되는 컬럼에 인덱스 설정

### 📊 CI/CD 파이프라인

#### 1. GitHub Actions 자동화
- **트리거 조건**: main 브랜치에 푸시 시 자동 실행
- **테스트 단계**: 코드 품질 검사 및 단위 테스트 실행
- **빌드 단계**: 프로덕션 빌드 생성 및 검증
- **프론트엔드 배포**: Vercel을 통한 자동 배포
- **백엔드 배포**: Railway를 통한 자동 배포
- **환경변수**: 시크릿을 통한 안전한 환경변수 관리

#### 2. 배포 프로세스
- **코드 푸시**: 개발자가 main 브랜치에 코드 푸시
- **자동 테스트**: ESLint, Prettier, Jest 테스트 자동 실행
- **빌드 검증**: 프로덕션 빌드 성공 여부 확인
- **순차 배포**: 테스트 통과 후 프론트엔드 → 백엔드 순서로 배포
- **롤백 준비**: 배포 실패 시 이전 버전으로 자동 롤백
- **알림 시스템**: 배포 성공/실패 시 팀 알림

#### 3. 품질 관리
- **코드 리뷰**: Pull Request를 통한 코드 리뷰 필수
- **자동 테스트**: 모든 PR에 대해 자동 테스트 실행
- **성능 테스트**: 배포 전 성능 벤치마크 실행
- **보안 스캔**: 의존성 취약점 및 보안 이슈 검사
- **문서화**: API 문서 자동 생성 및 업데이트
- **버전 관리**: 시맨틱 버저닝을 통한 체계적 버전 관리
