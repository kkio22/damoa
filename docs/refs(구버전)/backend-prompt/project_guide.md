# 📘 백엔드 개발 문서 가이드 (project_guide.md)

이 문서는 Cursor에게 백엔드 개발용 문서 5종을 자동으로 생성해달라고 요청할 때 사용하는 가이드입니다.  
`project_idea.md`와 함께 Cursor에게 전달하여 `/docs` 폴더 안에 아래 문서들을 생성하게 하세요.

---

## 📁 생성될 문서 목록 (총 5종)

1. `01_backend_requirements.md` - 백엔드 기능 요구사항 정의서
2. `02_db_schema.md` - 데이터베이스 테이블 및 관계 설계
3. `03_api_spec.md` - REST API 명세서
4. `04_architecture.md` - 시스템 아키텍처 개요
5. `05_exception_policy.md` - 예외 처리 및 에러 코드 정책

---

## 📄 01_backend_requirements.md - 기능 요구사항 정의서

기능 단위를 기준으로 API 중심의 요구사항을 정의합니다.

| ID     | 기능 설명       | 우선순위 | 관련 API               |
| ------ | --------------- | -------- | ---------------------- |
| BE-001 | 사용자 회원가입 | 높음     | POST /api/users/signup |
| BE-002 | 로그인          | 높음     | POST /api/users/login  |

---

## 📄 02_db_schema.md - DB 설계 문서

주요 테이블의 컬럼과 관계를 설계합니다. 각 테이블에는 설명, 컬럼 구조, 관계 설명을 포함합니다.

### 예시:

### 테이블명: users

- 설명: 사용자 정보 테이블

| 컬럼명   | 타입         | 제약조건           |
| -------- | ------------ | ------------------ |
| id       | BIGINT       | PK, Auto Increment |
| email    | VARCHAR(255) | UNIQUE, NOT NULL   |
| password | VARCHAR(255) | NOT NULL           |

- 관계: posts.user_id → users.id (1:N)

---

## 📄 03_api_spec.md - API 명세서

각 API의 URL, 메서드, 인증 여부, 요청/응답 예시, 상태 코드를 상세히 정의합니다.

### 예시:

### 사용자 로그인 API

- URL: POST /api/users/login
- 인증: 불필요
- 요청 예시:

```json
{
  "email": "test@example.com",
  "password": "1234"
}
```

- 응답 예시:

```json
{
  "accessToken": "eyJhbGciOi...",
  "userId": 1
}
```

- 상태 코드:
  - 200 OK: 로그인 성공
  - 401 UNAUTHORIZED: 비밀번호 불일치

---

## 📄 04_architecture.md - 시스템 아키텍처 개요

프로젝트 전체의 백엔드 구조를 요약합니다. 기술 스택, 인증 흐름, 캐시 사용 여부 등을 포함합니다.

### 예시:

- 사용 기술: Spring Boot, JPA, MySQL, Redis, JWT
- 인증 방식: JWT 기반 Access/Refresh Token
- 스케줄링: ShedLock 기반 예약 정산 처리
- Redis: 대기열 캐시, 채팅 메시지 처리

---

## 📄 05_exception_policy.md - 예외 처리 정책

에러 코드 체계와 HTTP 상태 코드 매핑을 정의합니다. 도메인별 코드 접두사와 JSON 응답 형식도 지정합니다.

### 예시:

| 코드                 | 설명                      | 상태코드 |
| -------------------- | ------------------------- | -------- |
| USER_DUPLICATE_EMAIL | 이미 등록된 이메일입니다. | 400      |
| AUTH_TOKEN_EXPIRED   | 토큰이 만료되었습니다.    | 401      |

```json
{
  "code": "USER_DUPLICATE_EMAIL",
  "message": "이미 등록된 이메일입니다."
}
```

---

## ✨ 사용 방법 요약

1. `/prompt/project_idea.md` 에 프로젝트 아이디어 문서를 생성
2. `/prompt/project_guide.md` (이 문서)를 함께 Cursor에게 전달
3. 다음과 같이 요청:
   ```
   @prompt/project_idea.md 와 @prompt/project_guide.md 파일을 참고해서
   docs 폴더 안에 01~05번 백엔드 문서를 생성해줘.
   ```
