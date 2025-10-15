# 📄 04_tech_summary.md - 기술 요약서 (Technical Summary)

이 문서는 'MyMatchLog' 야구 직관 기록&이벤트 플랫폼의 프론트엔드 기술 스택과 아키텍처를 요약합니다. 개발 환경, 데이터 흐름, 폴더 구조 등을 포함하여 실무 개발자들이 프로젝트 전반을 이해할 수 있도록 정리합니다.

---

## 🛠️ 사용 기술 스택

### Core Framework & Build Tools
- **React 18**: 함수형 컴포넌트, Hooks 기반 개발
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **TypeScript**: 타입 안정성 및 개발 생산성 향상

### UI Framework & Styling
- **shadcn/ui**: 재사용 가능한 컴포넌트 라이브러리
- **TailwindCSS 3**: 유틸리티 퍼스트 CSS 프레임워크
- **Radix UI**: 접근성 기반 프리미티브 컴포넌트

### State Management & Data Fetching
- **React Query (TanStack Query)**: 서버 상태 관리
- **Zustand**: 클라이언트 상태 관리
- **Axios**: HTTP 클라이언트

### Routing & Navigation
- **React Router v6**: 클라이언트 사이드 라우팅
- **React Hook Form**: 폼 상태 관리 및 유효성 검증

### Development Tools
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Husky**: Git hooks 관리

---

## 🏗️ 주요 아키텍처 개요

### 컴포넌트 구조
```
App
├── Layout
│   ├── Header
│   ├── Sidebar (마이페이지)
│   └── Footer
├── Pages
│   ├── Public (공개 페이지)
│   ├── Auth (인증 필요 페이지)
│   └── Admin (관리자 페이지)
├── Components
│   ├── UI (shadcn/ui 기반)
│   ├── Forms (폼 컴포넌트)
│   └── Features (도메인별 컴포넌트)
└── Providers (Context, Query Client 등)
```

### 상태 관리 전략
- **서버 상태**: React Query로 API 데이터 관리
- **클라이언트 상태**: Zustand로 UI 상태 관리
- **폼 상태**: React Hook Form으로 폼 데이터 관리
- **인증 상태**: Context API + localStorage

### 라우팅 구조
- **공개 라우트**: `/`, `/login`, `/signup`, `/events`
- **보호된 라우트**: `/match-logs/*`, `/mypage`, `/settings`
- **관리자 라우트**: `/admin/*`
- **404 페이지**: 존재하지 않는 경로 처리

---

## 🔧 개발 환경 및 빌드 도구

### 개발 환경 설정
```bash
# Node.js 18+ 필요
npm create vite@latest mymatchlog-frontend -- --template react-ts
cd mymatchlog-frontend
npm install
```

### 주요 의존성
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@tanstack/react-query": "^4.29.0",
    "zustand": "^4.3.0",
    "axios": "^1.3.0",
    "react-hook-form": "^7.43.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^1.2.0",
    "tailwind-merge": "^1.13.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.7",
    "typescript": "^4.9.3"
  }
}
```

### 빌드 스크립트
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

---

## 📊 데이터 흐름 및 Mock 데이터 처리

### API 통신 구조
```
Frontend → Axios Interceptor → Backend API
                ↓
        Error Handling & Token Refresh
                ↓
        React Query Cache Management
```

### Mock 데이터 처리 방식
- **개발 환경**: MSW (Mock Service Worker) 사용
- **API 응답 모킹**: 실제 API 구조와 동일한 형태
- **에러 시나리오**: 다양한 에러 상태 테스트

### 캐싱 전략
- **팀/경기장 데이터**: 24시간 캐싱
- **사용자 정보**: 세션 기간 캐싱
- **직관 기록**: 5분 캐싱, 수정 시 무효화
- **이벤트 데이터**: 10분 캐싱

---

## 🎨 퍼블리싱 관련 주요 규칙

### 반응형 디자인
- **Mobile First**: 320px부터 시작
- **Breakpoints**: 768px, 1024px, 1280px, 1536px
- **Grid System**: TailwindCSS의 12컬럼 그리드 활용
- **Container**: 최대 1200px, 패딩 1rem

### 접근성 (A11y)
- **WCAG 2.1 AA 준수**: 색상 대비 4.5:1 이상
- **키보드 네비게이션**: Tab, Enter, Space, Escape 지원
- **스크린 리더**: ARIA 라벨, 시맨틱 HTML
- **포커스 관리**: 2px Primary Red 포커스 링

### 디자인 시스템
- **컬러**: SK렌터카 테마 기반 (Primary Red: #EA002C, Orange: #FF7A00)
- **타이포그래피**: Noto Sans KR, Poppins
- **스페이싱**: 4px 단위 시스템 (xs: 4px ~ 3xl: 64px)
- **애니메이션**: 150ms, 300ms, 500ms 트랜지션

---

## 📁 예상 폴더 구조

```
src/
├── components/
│   ├── ui/                    # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/               # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── forms/                # 폼 컴포넌트
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── MatchLogForm.tsx
│   │   └── ...
│   └── features/             # 도메인별 컴포넌트
│       ├── auth/
│       ├── match-logs/
│       ├── events/
│       └── admin/
├── pages/                    # 페이지 컴포넌트
│   ├── public/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── Events.tsx
│   ├── protected/
│   │   ├── MatchLogs.tsx
│   │   ├── MyPage.tsx
│   │   └── Settings.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       └── EventManagement.tsx
├── hooks/                    # 커스텀 훅
│   ├── useAuth.ts
│   ├── useMatchLogs.ts
│   ├── useEvents.ts
│   └── ...
├── services/                 # API 서비스
│   ├── api.ts
│   ├── auth.ts
│   ├── matchLogs.ts
│   ├── events.ts
│   └── ...
├── stores/                   # Zustand 스토어
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── ...
├── utils/                    # 유틸리티 함수
│   ├── constants.ts
│   ├── helpers.ts
│   ├── validation.ts
│   └── ...
├── types/                    # TypeScript 타입 정의
│   ├── api.ts
│   ├── auth.ts
│   ├── matchLogs.ts
│   └── ...
├── styles/                   # 글로벌 스타일
│   ├── globals.css
│   └── ...
├── providers/                # Context Provider
│   ├── AuthProvider.tsx
│   ├── QueryProvider.tsx
│   └── ...
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 🚀 향후 확장 및 유지보수 고려사항

### 성능 최적화
- **Code Splitting**: React.lazy()와 Suspense 활용
- **Bundle Analysis**: vite-bundle-analyzer로 번들 크기 모니터링
- **Image Optimization**: WebP 포맷, lazy loading 적용
- **Caching Strategy**: Service Worker로 오프라인 지원

### 확장성
- **마이크로 프론트엔드**: 향후 도메인별 분리 고려
- **국제화 (i18n)**: react-i18next 도입 준비
- **테마 시스템**: 다크모드, 커스텀 테마 지원
- **PWA**: Progressive Web App 기능 추가

### 유지보수성
- **컴포넌트 문서화**: Storybook 도입 검토
- **테스트 전략**: Jest + React Testing Library
- **코드 품질**: ESLint, Prettier, Husky 설정
- **모니터링**: 에러 추적, 성능 모니터링 도구

### 보안
- **XSS 방지**: 입력값 검증 및 이스케이프
- **CSRF 방지**: 토큰 기반 인증
- **Content Security Policy**: CSP 헤더 설정
- **HTTPS 강제**: 프로덕션 환경에서 HTTPS 사용

---

## 📋 개발 체크리스트

### 초기 설정
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] TailwindCSS 설정
- [ ] shadcn/ui 설치 및 초기 컴포넌트 설정
- [ ] React Router 설정
- [ ] React Query 설정
- [ ] Zustand 설정
- [ ] ESLint, Prettier 설정

### 개발 단계
- [ ] 레이아웃 컴포넌트 구현
- [ ] 인증 시스템 구현
- [ ] 직관 기록 CRUD 구현
- [ ] 이벤트 시스템 구현
- [ ] 관리자 기능 구현
- [ ] 반응형 디자인 적용
- [ ] 접근성 검증

### 배포 준비
- [ ] 환경 변수 설정
- [ ] 빌드 최적화
- [ ] 성능 테스트
- [ ] 브라우저 호환성 테스트
- [ ] 접근성 검증
- [ ] 보안 검토 