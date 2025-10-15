# ✅ MyMatchLog 백엔드 개발 체크리스트 (backend_todolist.md)

이 문서는 MyMatchLog 프로젝트의 백엔드 개발 작업을 체계적으로 추적하고 관리하기 위한 체크리스트입니다. `docs` 폴더의 관련 기획/설계 문서를 기반으로 작성되었습니다.

---

## ⚙️ 1. 프로젝트 설정 및 공통 인프라

### 1.1. 개발 환경

- [x] Node.js, npm, Express.js 기반 프로젝트 초기화
- [x] `nodemon`을 이용한 개발 서버 핫 리로드 환경 구축
- [x] `ESLint`, `Prettier`를 활용한 코드 포맷팅 및 컨벤션 설정
- [x] `dotenv`를 활용한 환경변수 관리 (`.env`, `.env.development`, `.env.production`)
- [x] 기능별 도메인 기반 폴더 구조 설정 (`/src/domains/*`)

### 1.2. 핵심 미들웨어 및 로직

- [x] `cors`, `helmet` 등 기본 보안 미들웨어 적용
- [x] API 성공/실패 응답을 위한 공통 응답 형식 래퍼(Wrapper) 구현
- [x] 전역 예외 처리를 위한 에러 핸들링 미들웨어 (`error.middleware.js`)
- [x] BaseError 및 도메인별 커스텀 에러 클래스 정의 (`/src/errors`)
- [x] JWT(Access Token, Refresh Token) 발급 및 검증을 위한 인증 미들웨어 구현 (`auth.middleware.js`)
- [x] 관리자 권한을 확인하는 전용 미들웨어 구현 (`admin.middleware.js`)

### 1.3. 데이터베이스 및 외부 서비스

- [x] MySQL 데이터베이스 연결 설정
- [x] 데이터베이스 스키마 생성(Migration) 스크립트 작성
- [x] `teams` 마스터 데이터 시딩(Seeding) 스크립트 작성
- [x] Redis 연결 설정 (이벤트 동시성 제어용)
- [x] `multer` 및 AWS S3 SDK 연동을 통한 파일 업로드 모듈 구현
- [x] `Swagger(OpenAPI)`를 이용한 API 문서 자동화 설정

---

## 🏟️ 1.5. 공통 API (Common APIs)

- [x] **BE-000: 팀 목록 조회 (`GET /api/teams`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] KBO 리그 모든 팀 정보 반환 (캐싱 고려)
  - [x] Stadium 객체 반환 ✅ (ID, 이름, 도시 포함)

- [x] **BE-001: 경기장 목록 조회 (`GET /api/stadiums`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 경기장 정보 반환 (이름, 도시, 수용인원 등)
  - [x] Stadium ID 1~10 정리 완료 ✅ (중복 데이터 제거)

---

## 👤 2. 사용자 도메인 (User Domain)

- [x] **BE-002: 사용자 회원가입 (`POST /api/users/signup`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 이메일, 닉네임 중복 검사 로직
  - [x] 비밀번호 해싱 (bcrypt) 적용
- [x] **BE-003: 사용자 로그인 (`POST /api/users/login`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 로그인 성공 시 JWT(Access Token, Refresh Token) 발급
- [x] **BE-004: Access Token 갱신 (`POST /api/users/token`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] Refresh Token을 검증하여 새로운 Access Token 발급
- [x] **BE-005: 내 정보 조회 (`GET /api/users/me`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 인증 미들웨어를 통한 사용자 식별
- [x] **BE-006: 내 정보 수정 (`PATCH /api/users/me`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 닉네임, 응원팀 선택적 업데이트 로직

---

## ⚾ 3. 직관 기록 도메인 (Match Log Domain)

- [x] **BE-007: 티켓 OCR 정보 추출 (`POST /api/ocr/parse-ticket`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 외부 OCR 서비스 연동 로직 (현재 Mock 구현)
  - [x] 이미지 파일을 받아 OCR API로 전송 및 결과 반환
  - [x] OCR 실패 시 수동 입력 유도 메시지 반환
  - [x] Swagger 문서화 완료
- [x] **BE-008: 직관 기록 생성 (`POST /api/match-logs`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] `multipart/form-data` 요청 처리 ✅ (파일 타입 검증 포함)
  - [x] 티켓 이미지 S3 업로드 및 URL DB 저장 ✅ (Sharp 이미지 최적화)
  - [x] Stadium ID 기반 데이터 구조 ✅ (외래키 연결)
  - [x] 미래 날짜 제한 기능 ✅ (오늘까지만 기록 가능)
- [x] **BE-009: 내 직관 기록 목록 조회 (`GET /api/match-logs`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 페이지네이션(Pagination) 기능 구현
  - [x] Stadium 객체 반환 ✅ (ID, 이름, 도시 포함)
- [x] **BE-010: 직관 기록 상세 조회 (`GET /api/match-logs/:id`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] Stadium 객체 반환 ✅ (ID, 이름, 도시 포함)
- [x] **BE-011: 직관 기록 수정 (`PATCH /api/match-logs/:id`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 기록 소유권 검증 로직 (본인만 수정 가능)
  - [x] `multipart/form-data` 요청 처리 ✅ (새 이미지 업로드 지원)
  - [x] Stadium ID 기반 데이터 구조 ✅ (외래키 연결)
  - [x] 미래 날짜 제한 기능 ✅ (오늘까지만 기록 가능)
- [x] **BE-012: 직관 기록 삭제 (`DELETE /api/match-logs/:id`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 기록 소유권 검증 로직 (본인만 삭제 가능)

---

## 🎉 4. 이벤트 도메인 (Event Domain)

- [x] **BE-013: 진행 중인 이벤트 목록 조회 (`GET /api/events`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 현재 시간 기준으로 진행 중인 이벤트 목록 반환
  - [x] Swagger 문서화 완료
- [x] **BE-014: 이벤트 상세 조회 (`GET /api/events/:id`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 이벤트 상세 정보 반환 (참여자 수 포함)
  - [x] Swagger 문서화 완료
- [x] **BE-015: 이벤트 선착순 참여 (`POST /api/events/:id/participate`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] **Redis 분산 락(Distributed Lock)을 이용한 동시성 제어 구현** ✅
  - [x] 이벤트 참여 가능 기간 검증 로직 ✅
  - [x] 선착순 정원 마감 여부 확인 로직 ✅
  - [x] 중복 참여 방지 로직 (UNIQUE INDEX 및 추가 검증) ✅
  - [x] `participant_count` 증가 및 참여 정보 저장을 위한 트랜잭션 처리 ✅
  - [x] 동시성 테스트 완료 (10명, 100명 동시 요청) ✅
  - [x] Swagger 문서화 완료

---

## 👑 5. 관리자 기능 (Admin Domain)

- [x] **BE-016: 이벤트 생성 (`POST /api/admin/events`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 이벤트 생성 시 필수 필드 검증 로직
  - [x] 날짜 및 정원 유효성 검증
  - [x] **관리자 권한 검증 로직 구현** ✅
  - [x] Swagger 문서화 완료
- [x] **BE-017: 이벤트 참여자 목록 조회 (`GET /api/admin/events/:id/participants`)**
  - [x] Controller, Service, Repository 계층 구현
  - [x] 이벤트별 참여자 목록 조회 (사용자 정보 포함)
  - [x] **관리자 권한 검증 로직 구현** ✅
  - [x] Swagger 문서화 완료

---

## 🧪 6. 테스트 및 배포

- [x] **동시성 테스트 스위트 구현**
  - [x] 간단한 동시성 테스트 (10명) ✅
  - [x] 재시도 로직 포함 동시성 테스트 (10명) ✅
  - [x] 대규모 동시성 테스트 (100명) ✅
  - [x] Redis 분산 락 동작 검증 완료 ✅
- [x] **CI/CD 파이프라인 구축** ✅
  - [x] `Jest` 및 `Supertest` 테스트 환경 구축 ✅
  - [x] GitHub Actions 워크플로우 설정 (`ci.yml`, `deploy.yml`) ✅
  - [x] Docker 멀티스테이지 빌드 설정 ✅
  - [x] PM2 프로세스 관리 설정 (`ecosystem.config.js`) ✅
  - [x] 코드 품질 검사 (ESLint, Prettier) 자동화 ✅
  - [x] 보안 취약점 검사 (npm audit) 자동화 ✅
  - [x] 테스트 커버리지 리포트 자동화 ✅
  - [x] 기본 테스트 케이스 작성 ✅
  - [x] **ES 모듈 지원 및 Jest 설정 완료** ✅
  - [x] **환경변수 이름 통일 및 CI 환경변수 설정 완료** ✅
  - [x] **Docker 컨테이너 테스트 환경 개선** ✅
  - [x] **CI 파이프라인 모든 단계 통과** ✅
- [x] **프로덕션 배포 환경 구축** ✅
  - [x] AWS ECR (Elastic Container Registry) 설정 ✅
  - [x] AWS RDS (MySQL) 데이터베이스 설정 ✅
  - [x] AWS ElastiCache (Redis) 설정 ✅
  - [x] AWS EC2 인스턴스 설정 ✅
  - [x] GitHub Secrets 환경변수 설정 ✅
  - [x] Docker 컨테이너 배포 성공 ✅
  - [x] 애플리케이션 서버 실행 성공 ✅
  - [x] API 엔드포인트 정상 작동 확인 ✅
  - [x] Redis 연결 성공 (동시성 제어 기능 활성화) ✅
- [x] **데이터베이스 연결 문제 해결** ✅
  - [x] RDS 보안 그룹 설정 확인 및 수정
  - [x] 데이터베이스 사용자 권한 확인 및 수정
  - [x] 마이그레이션 및 시딩 실행
  - [x] stadiums 테이블 누락 문제 해결
- [ ] 주요 Service 로직에 대한 단위 테스트(Unit Test) 작성
- [ ] 주요 API 엔드포인트에 대한 통합 테스트(Integration Test) 작성

---

## 🚀 7. CI/CD 파이프라인 완료 상태

### ✅ 완료된 CI/CD 구성요소

- [x] **GitHub Actions 워크플로우 설정**
  - [x] `ci.yml`: 코드 품질 검사, 테스트, Docker 빌드 ✅
  - [x] `deploy.yml`: 프로덕션 배포 (AWS EC2) ✅
- [x] **테스트 환경 구축**
  - [x] Jest + Supertest 기반 테스트 ✅
  - [x] MySQL, Redis 서비스 컨테이너 ✅
  - [x] ES 모듈 지원 및 Jest 설정 완료 ✅
- [x] **Docker 설정**
  - [x] Multi-stage Dockerfile ✅
  - [x] 프로덕션 최적화 ✅
  - [x] Docker 컨테이너 테스트 환경 개선 ✅
- [x] **코드 품질 관리**
  - [x] ESLint 설정 및 오류 해결 ✅
  - [x] Prettier 코드 포맷팅 자동화 ✅
  - [x] 환경변수 이름 통일 및 설정 완료 ✅
- [x] **PM2 설정**
  - [x] 프로덕션 프로세스 관리 ✅
  - [x] `ecosystem.config.js` 설정 완료 ✅
- [x] **AWS 인프라 설정**
  - [x] ECR (Elastic Container Registry) ✅
  - [x] RDS (MySQL) 데이터베이스 ✅
  - [x] ElastiCache (Redis) ✅
  - [x] EC2 인스턴스 ✅
  - [x] 보안 그룹 설정 ✅

### 🎯 CI/CD 파이프라인 통과 단계

1. ✅ **코드 품질 검사** (ESLint)
2. ✅ **코드 포맷팅 검사** (Prettier)
3. ✅ **테스트 실행** (Jest + Supertest)
4. ✅ **데이터베이스 마이그레이션/시딩**
5. ✅ **Docker 빌드 및 테스트**
6. ✅ **보안 취약점 검사** (npm audit)
7. ✅ **AWS ECR 로그인 및 이미지 푸시**
8. ✅ **EC2 서버 배포 및 컨테이너 실행**

---

## 📊 현재 진행 상황 요약

### ✅ 완료된 도메인

- **공통 API**: 팀, 경기장 목록 조회 ✅
- **사용자 도메인**: 회원가입, 로그인, 토큰 갱신, 정보 조회/수정 ✅
- **직관 기록 도메인**: OCR, CRUD 전체 기능 ✅
- **이벤트 도메인**: 이벤트 조회, 참여 (동시성 제어 포함) ✅
- **관리자 도메인**: 이벤트 생성, 참여자 목록 조회 ✅
- **CI/CD 파이프라인**: 모든 단계 통과 완료 ✅
- **프로덕션 배포**: 완전 배포 및 데이터베이스 연결 성공 ✅

### 🔄 다음 단계

- **테스트 코드 확장**: 주요 Service 로직 및 API 엔드포인트 단위/통합 테스트 작성
- **프론트엔드 개발**: React/Vue.js 기반 사용자 인터페이스 개발
- **모니터링 도구**: 로깅, 메트릭 수집 도구 연동 (선택사항)
- **팀 협업 개선**: 자동 포맷팅 설정 공유 및 팀원 온보딩
- **성능 최적화**: 캐싱 전략 및 데이터베이스 쿼리 최적화 (선택사항)
