# 🛠️ MyMatchLog 백엔드 기술 요약 (backend_tech_summary.md)

이 문서는 'MyMatchLog' 프로젝트의 백엔드 개발에 필요한 주요 기술 스택, 아키텍처, 개발 환경 및 규칙을 종합적으로 요약합니다.

---

### 1. 사용 기술 스택 (Technology Stack)

- **Core**: Node.js (LTS), Express.js
- **Database**:
  - **MySQL**: 사용자, 직관 기록 등 핵심 데이터 저장
  - **Redis**: 이벤트 동시성 제어를 위한 분산 락, 토큰 관리, 캐싱
- **Authentication**: JWT (JSON Web Token) 기반 인증 (Access/Refresh Token)
- **File Storage**: AWS S3 (Multer를 통한 티켓 이미지 업로드)
- **API Documentation**: Swagger (OpenAPI)를 사용하며, API 명세는 `src/swagger` 폴더 내의 `.yaml` 파일로 작성하여 관리합니다.
- **Middleware**:
  - `cors`, `helmet`을 사용한 보안 강화
  - `dotenv`를 활용한 환경변수 관리
- **Testing**:
  - **Jest**: 단위 및 통합 테스트
  - **Supertest**: E2E API 테스트
- **External Services**:
  - **OCR API** (Naver Clova, Google Vision 등): 티켓 이미지 분석
  - **Web Scraping** (Puppeteer, Cheerio): 경기 결과 데이터 수집 (필요시)

---

### 2. 주요 아키텍처 개요 (Architecture Overview)

- **패턴**: 계층형 아키텍처 (Layered Architecture)
- **폴더 구조**: 기능별 도메인(`users`, `match-logs`, `events` 등)에 따라 라우터, 컨트롤러, 서비스, 리포지토리(모델)를 분리하여 구성합니다.
- **데이터 흐름**: `Request` → `Routes` → `Middleware(Auth)` → `Controller` → `Service` → `Repository` → `Database`
- **인증 방식**: API 요청 시 HTTP `Authorization` 헤더에 포함된 `Bearer {Token}`을 인증 미들웨어(`auth.middleware.js`)가 검증합니다.
- **예외 처리**: 공통 에러 핸들링 미들웨어(`error.middleware.js`)를 통해 모든 에러를 일관된 형식의 JSON으로 응답합니다.

---

### 3. 개발 환경 및 빌드 도구

- **Runtime**: Node.js
- **Package Manager**: npm
- **Hot Reload**: `nodemon`을 사용하여 개발 중 코드 변경 시 서버 자동 재시작
- **Code Convention**: `ESLint` (코드 품질) 및 `Prettier` (코드 포맷팅)를 통해 일관된 코드 스타일 유지
  - **Prettier 설정**: `.prettierrc` 파일로 포맷팅 규칙 정의
  - **포맷팅 명령어**: `npm run format` (자동 수정), `npm run format:check` (검사만)
  - **CI/CD 통합**: GitHub Actions에서 자동 포맷팅 검사 실행
- **환경 변수**: `.env` 파일을 사용하여 개발, 테스트, 프로덕션 환경의 설정을 분리합니다. (`.env.development`, `.env.test`, `.env.production`)
- **배포**: `PM2`를 사용하여 Node.js 프로세스를 관리하고, `Nginx`를 리버스 프록시로 활용하는 것을 고려합니다.

---

### 4. 공통 개발 규칙 및 응답/에러 형식

- **Custom Error**: 모든 비즈니스 로직 상의 에러는 `BaseError`를 상속받는 커스텀 에러 클래스로 정의하여 처리합니다.
- **성공 응답 형식**:

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "nickname": "야구팬"
  },
  "message": "요청에 성공했습니다."
}
```

- **실패/에러 응답 형식**: (`05_exception_policy.md`의 에러 코드를 사용)

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "해당 사용자를 찾을 수 없습니다."
  },
  "timestamp": "2024-07-21T10:30:00Z"
}
```

---

### 5. 예상 폴더 구조

```
src/
├── app.js                 # Express 앱 초기화, 전역 미들웨어 설정
├── config/                # 데이터베이스, 환경변수 등 설정
├── constants/             # 여러 곳에서 사용되는 상수
├── errors/                # BaseError, 커스텀 에러 클래스
├── utils/                 # 공통 유틸리티 함수
├── middlewares/           # 인증, 에러 핸들링 등 특정 도메인에 속하지 않는 공통 미들웨어
├── swagger/               # ⭐️ API 명세(.yaml) 파일 관리
│   └── users.swagger.yaml
├── domains/               # ⭐️ 핵심 도메인별 폴더
│   ├── users/
│   │   ├── user.router.js
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.repository.js
│   │   └── user.dto.js
│   ├── matchlogs/
│   │   ├── matchlog.router.js
│   │   ├── matchlog.controller.js
│   │   ├── matchlog.service.js
│   │   ├── matchlog.repository.js
│   │   └── matchlog.dto.js
│   └── events/
│       ├── event.router.js
│       ├── event.controller.js
│       ├── event.service.js
│       ├── event.repository.js
│       └── event.dto.js
├── routes/                # 모든 도메인 라우터를 취합하여 app.js에 연결
│   └── index.js
└── tests/                 # 테스트 코드 (도메인별로 구조화)
    └── domains/
        └── users/
            └── user.service.test.js
```

---

### 6. 향후 확장 및 유지보수 고려사항

- **TypeScript 전환**: 프로젝트 규모가 커짐에 따라 타입 안정성을 위해 TypeScript 도입을 고려합니다.
- **소셜 로그인**: 사용자 편의성 증대를 위해 OAuth 2.0 기반의 소셜 로그인(Google, Kakao) 기능을 확장할 수 있습니다.
- **캐싱 전략 고도화**: Redis를 활용하여 자주 조회되지만 변경이 적은 데이터(예: 팀 목록)에 대한 캐싱 전략을 적용하여 DB 부하를 줄입니다.
- **모니터링**: `CloudWatch` 또는 `Sentry` 같은 외부 서비스를 연동하여 에러 로깅 및 성능 모니터링을 강화합니다.
- **CI/CD**: `GitHub Actions`를 이용해 테스트 및 배포 자동화 파이프라인을 구축합니다. ✅ **완료**
- **프로덕션 배포**: AWS 인프라(EC2, RDS, ElastiCache, ECR) 구축 및 자동 배포 시스템 완료 ✅ **완료**

---

### 7. 코드 포맷팅 가이드

#### **Prettier 설정**
- **설정 파일**: `.prettierrc`
- **적용 범위**: 모든 JavaScript, JSON, YAML, Markdown 파일

#### **포맷팅 명령어**
```bash
# 코드 포맷팅 자동 수정
npm run format

# 포맷팅 검사만 (수정하지 않음)
npm run format:check

# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix
```

#### **자주 발생하는 포맷팅 문제**
1. **들여쓰기 불일치**: 탭과 스페이스 혼용
2. **줄 끝 문자**: Windows/Unix 줄바꿈 문자 차이
3. **따옴표**: 작은따옴표/큰따옴표 통일
4. **세미콜론**: 문장 끝 세미콜론 누락

#### **해결 방법**
```bash
# 1. 포맷팅 자동 수정
npm run format

# 2. 포맷팅 검사
npm run format:check

# 3. 커밋 전 확인
npm run ci:test  # 포맷팅 + 린팅 + 테스트 모두 실행
```

#### **Git Hooks 설정 (권장)**
```bash
# pre-commit 훅으로 자동 포맷팅 적용
npx husky add .husky/pre-commit "npm run format"
```
