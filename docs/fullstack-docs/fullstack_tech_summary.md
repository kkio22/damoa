# 🛠️ SmartTrade MVP 풀스택 기술 요약서

---

## 프로젝트 개요

**SmartTrade MVP**는 당근마켓, 중고나라, 번개장터 등 주요 중고거래 플랫폼의 상품 데이터를 수집하여 Redis에 저장하고, 사용자가 원하는 상품 정보를 입력하면 AI가 분석하여 관련 상품을 검색해주는 간단한 웹 플랫폼입니다. 로그인/결제 없이 핵심 검색 기능만 제공하는 MVP 버전입니다.

---

## 1. 전체 기술 스택

### 🎨 Frontend
- **Next.js 14 + TypeScript**: 서버사이드 렌더링 및 성능 최적화
- **TailwindCSS + shadcn/ui**: 빠른 UI 개발 및 일관된 디자인 시스템
- **Zustand**: 효율적인 상태 관리
- **React Query**: 서버 상태 관리 및 캐싱
- **React Hook Form + Zod**: 폼 관리 및 유효성 검증
- **Framer Motion**: 부드러운 애니메이션 효과

### ⚙️ Backend
- **Node.js + TypeScript**: 풀스택 JavaScript 생태계
- **Express.js**: RESTful API 서버
- **PostgreSQL**: 로그 데이터 저장 (검색 로그, 크롤링 로그)
- **Redis**: 상품 데이터 캐싱 및 메인 저장소
- **Bull Queue**: 비동기 크롤링 작업 처리
- **JWT**: 안전한 인증 시스템 (향후 확장용)

### 🤖 AI & ML
- **LangGraph**: AI 워크플로우 및 상품 분석 엔진
- **LangChain**: AI 에이전트 및 자연어 처리
- **OpenAI API**: 텍스트 분석 및 상품 추천
- **Node.js 통합**: JavaScript 기반 AI 서비스
- **실시간 처리**: 스트리밍 기반 AI 분석

### 🕷️ 데이터 수집
- **Puppeteer/Playwright**: 웹 크롤링 및 동적 콘텐츠 처리
- **Cheerio**: HTML 파싱 및 데이터 추출
- **Node-cron**: 스케줄링된 크롤링 작업 (매일 자정)
- **Rate Limiting**: 크롤링 속도 제어 및 사이트 보호

### 🚀 배포 & 인프라
- **Frontend**: Vercel (글로벌 CDN)
- **Backend**: Railway/Render (컨테이너 기반 배포)
- **AI Service**: Node.js 내장 (LangGraph 통합)
- **Database**: PostgreSQL (Supabase/Railway)
- **Cache**: Redis (Upstash/Railway)
- **모니터링**: Sentry (에러 추적), Vercel Analytics

---

## 2. 프로젝트 아키텍처

### 전체 구조
```
Client (Next.js) ↔ REST API (Express) ↔ Redis (상품 데이터)
                                    ↕
                              PostgreSQL (로그)
                                    ↕
                              LangGraph (AI 분석)
```

### Frontend 아키텍처
- **컴포넌트 기반 설계**: Atomic Design 패턴 적용
- **페이지 라우팅**: Next.js App Router 활용
- **상태 관리**: Zustand (전역) + React Hook Form (로컬)
- **서버 상태**: React Query를 통한 캐싱 및 동기화
- **커스텀 훅**: 검색 로직 재사용

### Backend 아키텍처
- **MVC 패턴**: Model-View-Controller 구조
- **미들웨어 기반**: 요청 처리 및 에러 핸들링
- **서비스 레이어**: 비즈니스 로직 분리
- **Redis 중심**: 모든 상품 데이터를 Redis에서 처리
- **로그 전용 DB**: PostgreSQL은 검색/크롤링 로그만 저장

### AI 서비스 아키텍처
- **LangGraph 통합**: Node.js 내장 AI 서비스
- **워크플로우 기반**: 복잡한 AI 파이프라인 구성
- **실시간 처리**: 스트리밍 기반 상품 분석
- **LangChain 기반**: 검증된 AI 프레임워크 활용

---

## 3. 개발 환경 및 도구

### Frontend
- **Next.js**: 풀스택 React 프레임워크
- **TypeScript**: 타입 안정성 및 개발 생산성
- **ESLint + Prettier**: 코드 품질 및 포맷팅
- **TailwindCSS**: 유틸리티 퍼스트 CSS 프레임워크

### Backend
- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 프레임워크
- **TypeScript**: 타입 안정성
- **nodemon**: 개발 서버 자동 재시작
- **dotenv**: 환경변수 관리

### AI/ML
- **Node.js**: JavaScript 기반 AI 개발 환경
- **LangGraph**: AI 워크플로우 프레임워크
- **LangChain**: AI 에이전트 라이브러리
- **OpenAI API**: GPT 모델 통합

### 공통
- **Git + GitHub**: 버전 관리
- **VS Code**: 통합 개발 환경
- **Docker Compose**: 로컬 개발 환경

---

## 4. 데이터 흐름

### 상품 검색 흐름
1. **사용자 검색어 입력** → Frontend 검색 폼
2. **LangGraph 분석 요청** → Node.js 내장 AI 서비스에서 상품 분석
3. **Redis 검색** → 캐시된 상품 데이터에서 검색
4. **결과 반환** → 검색 결과 및 AI 분석 결과
5. **로그 저장** → PostgreSQL에 검색 로그 저장

### 크롤링 데이터 흐름
1. **스케줄 실행** → 매일 자정 Cron Job 실행
2. **플랫폼별 크롤링** → 당근마켓, 중고나라, 번개장터
3. **데이터 정제** → 중복 제거, 검증, 표준화
4. **Redis 교체** → 기존 데이터 백업 후 새 데이터 저장
5. **로그 기록** → 크롤링 결과를 PostgreSQL에 저장

### AI 분석 흐름
1. **검색어 분석** → LangGraph 워크플로우로 사용자 입력 의도 파악
2. **상품 매칭** → LangChain을 통한 관련 상품 찾기
3. **추천 점수 계산** → 관련도 기반 점수 산출
4. **결과 캐싱** → Redis에 분석 결과 저장
5. **응답 반환** → 분석 결과 및 추천 상품

---

## 5. 공통 개발 규칙

### API 응답 형식
```json
{
  "success": true,
  "data": {
    "products": [...],
    "totalCount": 100,
    "searchTime": 1.5,
    "aiAnalysis": {...}
  }
}
```

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "SEARCH_ERROR",
    "message": "검색 중 오류가 발생했습니다.",
    "details": {
      "query": "검색어가 너무 짧습니다."
    }
  }
}
```

### 컴포넌트 명명 규칙
- **PascalCase**: `SearchForm`, `ProductCard`, `FilterPanel`
- **페이지 컴포넌트**: `HomePage`, `SearchPage`
- **재사용 컴포넌트**: `Button`, `Modal`, `Card`

### API 엔드포인트 규칙
- **RESTful 설계**: `/api/search`, `/api/ai/analyze`
- **HTTP 메서드**: GET, POST, PUT, DELETE
- **명사 사용**: 동작은 HTTP 메서드로 구분

---

## 6. 예상 폴더 구조

### Frontend (Next.js)
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 홈페이지
│   ├── search/            # 검색 페이지
│   └── layout.tsx         # 레이아웃
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   ├── search/            # 검색 관련 컴포넌트
│   └── product/           # 상품 관련 컴포넌트
├── hooks/                 # 커스텀 훅
├── store/                 # Zustand 상태 관리
├── services/              # API 호출 함수
├── utils/                 # 유틸리티 함수
├── types/                 # TypeScript 타입 정의
└── lib/                   # 설정 및 라이브러리
```

### Backend (Node.js + Express)
```
src/
├── controllers/           # 컨트롤러
├── services/             # 비즈니스 로직
├── models/               # 데이터 모델
├── routes/               # 라우터
├── middlewares/          # 미들웨어
├── utils/                # 유틸리티
├── config/               # 설정 파일
├── crawlers/             # 크롤링 로직
└── app.js                # 앱 진입점
```

### AI Service (Node.js + LangGraph)
```
src/
├── ai/                   # AI 서비스
│   ├── workflows/       # LangGraph 워크플로우
│   ├── agents/          # LangChain 에이전트
│   ├── models/          # AI 모델 통합
│   └── utils/           # AI 유틸리티
├── services/            # 비즈니스 로직
└── app.js               # Express 앱
```

---

## 7. 테스트 전략

### Frontend
- **컴포넌트 테스트**: React Testing Library
- **통합 테스트**: 검색 플로우 테스트
- **E2E 테스트**: Playwright (선택사항)

### Backend
- **단위 테스트**: Jest
- **API 테스트**: Supertest
- **크롤링 테스트**: 모킹된 데이터로 테스트

### AI Service
- **워크플로우 테스트**: LangGraph 워크플로우 단위 테스트
- **API 테스트**: Express AI 엔드포인트 테스트
- **성능 테스트**: 응답 시간 및 정확도 측정

---

## 8. 배포 및 운영

### 배포 전략
- **Frontend**: Vercel 자동 배포 (Git 연동)
- **Backend + AI**: Railway/Render 통합 배포 (Node.js)
- **환경별 설정**: development, production 분리

### 모니터링
- **에러 추적**: Sentry
- **성능 모니터링**: Vercel Analytics
- **Redis 모니터링**: Upstash 대시보드
- **크롤링 모니터링**: PostgreSQL 로그 분석

### 백업 전략
- **Redis 백업**: 매일 자정 데이터 백업
- **PostgreSQL 백업**: 일일 로그 데이터 백업
- **롤백 계획**: 크롤링 실패 시 이전 데이터 복구

---

## 9. 성능 최적화

### Frontend 최적화
- **이미지 지연 로딩**: 상품 이미지 lazy loading
- **가상화**: 대량 검색 결과 가상 스크롤링
- **캐싱**: React Query를 통한 검색 결과 캐싱
- **디바운싱**: 검색어 입력 디바운싱 (300ms)

### Backend 최적화
- **Redis 캐싱**: 검색 결과 1시간 캐싱
- **병렬 처리**: AI 분석 병렬 처리
- **CDN**: 정적 자원 CDN 배포
- **압축**: gzip 압축 적용

### Redis 최적화
- **데이터 구조**: Sorted Sets, Hash Maps 활용
- **메모리 관리**: TTL 기반 자동 정리
- **클러스터링**: 수평 확장 지원

---

## 10. 보안 및 개인정보 보호

### API 보안
- **Rate Limiting**: API 호출 제한
- **CORS**: 크로스 오리진 요청 보안
- **입력 검증**: Zod를 통한 데이터 검증
- **에러 처리**: 민감한 정보 노출 방지

### 데이터 보호
- **개인정보 익명화**: 검색 로그 IP 해시화
- **크롤링 윤리**: robots.txt 준수
- **데이터 암호화**: 민감한 데이터 암호화 저장

---

## 11. 향후 확장 고려사항

### 기능 확장
- **사용자 인증**: 소셜 로그인 추가
- **개인화**: 사용자별 추천 시스템
- **실시간 알림**: 관심 상품 알림
- **지도 통합**: 위치 기반 검색

### 기술 확장
- **PWA**: Progressive Web App 전환
- **다국어 지원**: i18n 적용
- **다크 모드**: 테마 시스템
- **모바일 앱**: React Native 확장

### 인프라 확장
- **마이크로서비스**: 서비스 분리
- **Kubernetes**: 컨테이너 오케스트레이션
- **모니터링**: Prometheus + Grafana
- **로깅**: ELK Stack

---

## 12. MVP 핵심 특징

### 단순한 아키텍처
- **Redis 중심**: 모든 상품 데이터를 Redis에서 처리
- **로그 전용 DB**: PostgreSQL은 로그만 저장
- **일일 갱신**: 매일 자정 전체 데이터 교체

### 사용자 중심 설계
- **로그인 불필요**: 즉시 검색 가능
- **빠른 검색**: Redis 기반 고성능 검색
- **AI 분석**: LangGraph 기반 실시간 상품 분석 및 추천

### JavaScript 통합 스택
- **단일 언어**: Frontend-Backend-AI 모두 JavaScript
- **LangGraph 통합**: Node.js 내장 AI 서비스
- **개발 효율성**: 하나의 언어로 전체 스택 개발
- **클라우드 네이티브**: Vercel, Railway 활용

이 기술 요약서는 SmartTrade MVP의 핵심 기술 스택과 아키텍처를 종합적으로 정리한 것으로, 개발팀이 프로젝트를 이해하고 구현하는 데 필요한 모든 기술적 정보를 포함하고 있습니다.