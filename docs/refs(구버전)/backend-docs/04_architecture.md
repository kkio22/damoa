# 📄 04_architecture.md - 시스템 아키텍처 개요

이 문서는 'MyMatchLog' 프로젝트의 백엔드 시스템 아키텍처, 주요 기술 스택, 핵심 동작 방식을 요약하여 설명합니다.

---

## 1. 시스템 아키텍처 스타일

- **Layered Architecture & Domain-Driven Design (DDD) 일부 적용**
  - **`src/domains`**: 각 기능 도메인(`users`, `matchlogs`, `events`, `ocr`, `admin`)을 중심으로 라우터, 컨트롤러, 서비스, 리포지토리가 구성됩니다.
  - **`src/middlewares`**: 인증, 에러 핸들링 등 공통 미들웨어를 배치합니다.
  - **`src/config`**: 데이터베이스 연결, 환경변수 등 설정 관련 코드를 관리합니다.
  - **`src/errors`**: 커스텀 에러 클래스를 정의합니다.

## 2. 실제 폴더 구조

```
src/
├── app.js                 # Express 앱 초기화, 전역 미들웨어 설정
├── config/                # 데이터베이스, Redis, S3, Swagger 등 설정
├── constants/             # 여러 곳에서 사용되는 상수
├── errors/                # BaseError, 커스텀 에러 클래스
├── utils/                 # 공통 유틸리티 함수
├── middlewares/           # 인증, 에러 핸들링, 파일 업로드 등 공통 미들웨어
├── domains/               # ⭐️ 핵심 도메인별 폴더
│   ├── users/
│   │   ├── user.router.js
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   └── user.repository.js
│   ├── matchlogs/
│   │   ├── matchlog.router.js
│   │   ├── matchlog.controller.js
│   │   ├── matchlog.service.js
│   │   └── matchlog.repository.js
│   ├── events/
│   │   ├── event.router.js
│   │   ├── event.controller.js
│   │   ├── event.service.js
│   │   └── event.repository.js
│   ├── ocr/
│   │   ├── ocr.router.js
│   │   ├── ocr.controller.js
│   │   └── ocr.service.js
│   ├── admin/
│   │   ├── admin.router.js
│   │   ├── admin.controller.js
│   │   ├── admin.service.js
│   │   └── admin.repository.js
│   ├── teams/
│   │   ├── team.router.js
│   │   ├── team.controller.js
│   │   ├── team.service.js
│   │   └── team.repository.js
│   └── stadiums/
│       ├── stadium.router.js
│       ├── stadium.controller.js
│       ├── stadium.service.js
│       └── stadium.repository.js
├── routes/                # 모든 도메인 라우터를 취합하여 app.js에 연결
│   └── index.js
├── swagger/               # API 문서화 (OpenAPI/Swagger)
│   ├── users.swagger.yaml
│   ├── matchlogs.swagger.yaml
│   ├── events.swagger.yaml
│   ├── ocr.swagger.yaml
│   ├── admin.swagger.yaml
│   ├── teams.swagger.yaml
│   └── stadiums.swagger.yaml
└── tests/                 # 테스트 코드 (도메인별로 구조화)
    └── domains/
        └── users/
            └── user.service.test.js
```

---

## 3. 주요 기술 스택 (Tech Stack)

- **Runtime / Framework**: `Node.js`, `Express.js`
- **Database**:
  - `MySQL`: 핵심 데이터를 저장하는 주 데이터베이스 (관계형 데이터)
  - `Redis`: 세션 관리, 캐싱, 그리고 이벤트 동시성 제어를 위한 분산 락(Distributed Lock) 구현에 사용
- **Authentication**: `JWT (JSON Web Token)` 기반 인증 (Stateless)
- **File Storage**: `AWS S3` (사용자가 업로드하는 티켓 이미지 저장)
- **External Services**:
  - `OCR API` (Mock 구현): 티켓 이미지에서 텍스트를 추출
  - `Web Scraping` (Puppeteer, Cheerio): 경기 결과 데이터 수집 (필요시)
- **Development Tools**: `ESLint`, `Prettier` (코드 품질), `Jest` (테스트), `Swagger/OpenAPI` (API 문서화), `PM2` (프로세스 관리)

---

## 4. 핵심 동작 방식 (Key Mechanisms)

### 4.1 인증 및 권한 관리 (Authentication & Authorization)

1. **로그인**: 사용자가 이메일/비밀번호로 로그인을 요청합니다.
2. **JWT 발급**: 서버는 사용자 인증 성공 시, `Access Token`과 `Refresh Token`을 발급하여 응답합니다. (토큰에 `isAdmin` 권한 정보 포함)
3. **API 요청**: 클라이언트는 이후 API 요청 시 `Authorization` 헤더에 `Access Token`을 담아 전송합니다.
4. **미들웨어 인증**: 서버의 인증 미들웨어는 각 요청의 토큰을 검증하여 사용자를 식별합니다.
5. **권한 검증**: 관리자 기능 접근 시 `admin.middleware.js`를 통해 관리자 권한을 확인합니다.
6. **토큰 만료 및 갱신**: `Access Token`이 만료되면, 클라이언트는 `Refresh Token`을 사용하여 새로운 `Access Token`을 발급받습니다.

### 4.2 선착순 이벤트 동시성 제어 (Concurrency Control)

- **목표**: 다수의 사용자가 동시에 이벤트 참여를 요청할 때, 정해진 정원(`capacity`) 내에서만 참여를 허용하고 데이터 일관성을 보장합니다.
- **구현 방식**: `Redis`의 `SET NX` (SET if Not eXists) 명령어를 활용한 **분산 락 (Distributed Lock)** 구현

1. **참여 요청**: 사용자가 이벤트 참여 API를 호출합니다.
2. **Lock 획득 시도**: Redis에 `event:{eventId}:lock`과 같은 유니크한 키로 Lock 획득을 시도합니다.
3. **로직 처리**:
   - **Lock 성공**: 현재 참여자 수(`participant_count`)가 정원(`capacity`) 미만인지 확인하고, 참여자 수를 1 증가시킨 후 참여 정보를 DB에 저장합니다.
   - **Lock 실패**: 다른 요청이 처리 중이므로, 잠시 대기 후 재시도하거나 즉시 실패 처리합니다.
4. **Lock 해제**: 로직 처리가 완료되면 반드시 Lock을 해제하여 다른 요청이 처리될 수 있도록 합니다.
5. **동시성 테스트**: 100명 동시 요청 시에도 정확한 결과 보장

### 4.3 파일 처리 (File Handling)

1. **이미지 업로드**: 클라이언트는 `multipart/form-data` 형식으로 티켓 이미지를 서버에 전송합니다.
2. **서버 처리**: `multer`와 같은 미들웨어가 파일을 임시 저장하고, `sharp` 라이브러리를 통해 이미지 리사이징 등 전처리를 수행합니다.
3. **S3 저장**: 전처리된 이미지를 `AWS S3` 버킷에 업로드합니다.
4. **DB 저장**: 업로드된 이미지의 S3 URL을 `match_logs` 테이블의 `ticket_image_url` 컬럼에 저장합니다.

### 4.4 OCR 처리 (OCR Processing)

1. **이미지 업로드**: 사용자가 티켓 이미지를 업로드합니다.
2. **OCR 처리**: Mock OCR 서비스를 통해 이미지에서 경기 정보를 추출합니다.
3. **정보 매칭**: 추출된 정보를 데이터베이스의 팀, 경기장 정보와 매칭합니다.
4. **결과 반환**: 매칭된 정보를 JSON 형태로 반환하거나, 실패 시 수동 입력을 유도합니다.

---

## 5. 구현 완료 상태

### 5.1 ✅ 완료된 도메인 (17/17 API)

- **공통 API**: 팀, 경기장 목록 조회
- **사용자 도메인**: 회원가입, 로그인, 토큰 갱신, 정보 조회/수정
- **직관 기록 도메인**: OCR, CRUD 전체 기능
- **이벤트 도메인**: 이벤트 조회, 참여 (Redis 분산 락 동시성 제어 포함)
- **관리자 도메인**: 이벤트 생성, 참여자 목록 조회

### 5.2 🔄 다음 단계

- **테스트 코드 작성**: Jest + Supertest 환경 구축
- **배포 준비**: PM2 설정
- **CI/CD**: GitHub Actions 파이프라인 구축 (선택사항)
