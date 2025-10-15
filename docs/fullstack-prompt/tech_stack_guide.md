# 🛠️ 풀스택 기술 스택 가이드 (tech_stack_guide.md)

다음 3개의 문서(시스템 요구사항, API+UI 명세서, 데이터 아키텍처)를 참고하여,  
이 프로젝트의 기술 요약 문서(`fullstack_tech_summary.md`)를 작성해 주세요.

---

## 📌 기술 요약 문서에 반드시 포함되어야 할 항목:

### 1. 전체 기술 스택

**Frontend**
- React 18 + TypeScript
- 상태관리: Zustand (또는 Redux Toolkit)
- 스타일링: TailwindCSS + shadcn/ui
- 라우팅: React Router v6
- HTTP 클라이언트: Axios
- 폼 관리: React Hook Form + Zod

**Backend**
- Node.js (LTS) + Express.js
- 데이터베이스: MongoDB (또는 PostgreSQL)
- 인증: JWT 기반
- 환경변수: dotenv
- 보안: cors, helmet
- API 문서화: Swagger
- 테스트: Jest + Supertest

**Real-time (선택사항)**
- Socket.io (실시간 기능이 필요한 경우)

**배포 및 인프라**
- Frontend: Vercel 또는 Netlify
- Backend: Railway, Render 또는 AWS
- 데이터베이스: MongoDB Atlas 또는 Supabase

---

### 2. 프로젝트 아키텍처

**전체 구조**
```
Client (React) ↔ REST API (Express) ↔ Database (MongoDB)
```

**Frontend 아키텍처**
- 컴포넌트 기반 설계 (Atomic Design 패턴)
- 페이지별 라우팅 구조
- 전역 상태와 로컬 상태 분리
- 커스텀 훅을 통한 로직 재사용

**Backend 아키텍처**
- MVC 패턴 (Model-View-Controller)
- 미들웨어 기반 요청 처리
- 서비스 레이어를 통한 비즈니스 로직 분리
- 에러 처리 미들웨어

---

### 3. 개발 환경 및 도구

**Frontend**
- Vite (빌드 도구)
- ESLint + Prettier (코드 품질)
- TypeScript (타입 안정성)

**Backend**
- nodemon (개발 서버)
- ESLint + Prettier (코드 품질)
- dotenv (환경변수 관리)

**공통**
- Git + GitHub (버전 관리)
- VS Code (개발 환경)

---

### 4. 데이터 흐름

**인증 흐름**
1. 사용자 로그인 → JWT 토큰 발급
2. Frontend에서 토큰을 localStorage에 저장
3. API 요청 시 Authorization 헤더에 토큰 포함
4. Backend에서 토큰 검증 후 요청 처리

**일반적인 CRUD 흐름**
1. Frontend → API 요청 (Axios)
2. Backend → 데이터 검증 (Joi/Zod)
3. Backend → 데이터베이스 작업 (MongoDB/Mongoose)
4. Backend → 표준화된 응답 반환
5. Frontend → 상태 업데이트 및 UI 반영

---

### 5. 공통 개발 규칙

**API 응답 형식**
```json
{
  "success": true,
  "data": { ... },
  "message": "작업이 성공적으로 완료되었습니다."
}
```

**에러 응답 형식**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": { ... }
  }
}
```

**컴포넌트 명명 규칙**
- PascalCase (예: `UserProfile`, `TodoList`)
- 페이지 컴포넌트: `HomePage`, `LoginPage`
- 재사용 컴포넌트: `Button`, `Modal`, `Card`

**API 엔드포인트 규칙**
- RESTful 설계 원칙 준수
- 명사 사용: `/api/users`, `/api/todos`
- HTTP 메서드로 동작 구분: GET, POST, PUT, DELETE

---

### 6. 예상 폴더 구조

**Frontend (React + Vite)**
```
src/
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   └── features/           # 기능별 컴포넌트
├── pages/                  # 페이지 컴포넌트
├── hooks/                  # 커스텀 훅
├── store/                  # 상태 관리 (Zustand)
├── services/               # API 호출 함수
├── utils/                  # 유틸리티 함수
├── types/                  # TypeScript 타입 정의
└── App.tsx
```

**Backend (Node.js + Express)**
```
src/
├── controllers/            # 컨트롤러
├── services/               # 비즈니스 로직
├── models/                 # 데이터 모델
├── routes/                 # 라우터
├── middlewares/            # 미들웨어
├── utils/                  # 유틸리티
├── config/                 # 설정 파일
└── app.js
```

---

### 7. 테스트 전략

**Frontend**
- 컴포넌트 테스트: React Testing Library
- E2E 테스트: Playwright (선택사항)

**Backend**
- 단위 테스트: Jest
- API 테스트: Supertest
- 테스트 데이터베이스 분리

---

### 8. 배포 및 운영

**배포 전략**
- Frontend: Vercel 자동 배포 (Git 연동)
- Backend: Railway/Render 자동 배포
- 환경별 설정 분리 (development, production)

**모니터링**
- 에러 추적: Sentry (선택사항)
- 성능 모니터링: Vercel Analytics

---

### 9. 향후 확장 고려사항

- PWA (Progressive Web App) 전환
- 다국어 지원 (i18n)
- 다크 모드 지원
- 소셜 로그인 (OAuth)
- 파일 업로드 기능
- 실시간 알림 시스템
- 모바일 앱 (React Native) 확장 가능성 