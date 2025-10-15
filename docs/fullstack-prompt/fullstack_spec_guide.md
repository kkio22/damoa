# 📘 풀스택 시스템 명세 가이드 (fullstack_spec_guide.md)

이 문서는 Cursor에게 풀스택 개발용 통합 명세서를 자동으로 생성해달라고 요청할 때 사용하는 가이드입니다.  
`project_idea.md`와 함께 Cursor에게 전달하여 `/docs` 폴더 안에 아래 문서들을 생성하게 하세요.

---

## 📁 생성될 문서 목록 (총 3종)

1. `01_system_requirements.md` - 전체 시스템 요구사항 및 기능 정의서
2. `02_api_ui_spec.md` - API 명세서 + UI 화면 정의서 통합
3. `03_data_architecture.md` - 데이터베이스 설계 + 프론트엔드 상태 관리 통합

---

## 📄 01_system_requirements.md - 시스템 요구사항 정의서

풀스택 관점에서 사용자 기능을 중심으로 요구사항을 정의합니다.

### 예시 구조:

#### 기능 요구사항

| ID     | 기능명         | 사용자 스토리                              | 우선순위 | 관련 API + 화면     |
| ------ | -------------- | ------------------------------------------ | -------- | ------------------- |
| FS-001 | 사용자 회원가입 | 사용자는 이메일로 계정을 생성할 수 있다    | 높음     | POST /api/auth/signup + /signup 페이지 |
| FS-002 | 로그인         | 사용자는 이메일과 비밀번호로 로그인할 수 있다 | 높음     | POST /api/auth/login + /login 페이지 |
| FS-003 | Todo 생성      | 사용자는 새로운 할 일을 생성할 수 있다     | 높음     | POST /api/todos + Todo 생성 모달 |

#### 비기능 요구사항

- **성능**: 페이지 로딩 시간 3초 이내
- **보안**: JWT 토큰 기반 인증, HTTPS 적용
- **반응형**: 모바일/태블릿/데스크톱 대응
- **접근성**: WCAG 2.1 AA 수준 준수

---

## 📄 02_api_ui_spec.md - API + UI 통합 명세서

각 기능별로 API와 UI를 함께 정의하여 프론트엔드-백엔드 연동을 명확히 합니다.

### 예시 구조:

#### 기능: 사용자 로그인

**📡 API 명세**
- **URL**: POST /api/auth/login
- **인증**: 불필요
- **요청 예시**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **응답 예시**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동"
    }
  }
}
```
- **상태 코드**:
  - 200: 로그인 성공
  - 401: 인증 실패
  - 400: 잘못된 요청

**🎨 UI 명세**
- **페이지**: /login
- **주요 컴포넌트**:
  - LoginForm: 이메일/비밀번호 입력 폼
  - SubmitButton: 로그인 버튼 (로딩 상태 포함)
  - ErrorMessage: 에러 메시지 표시
- **상태 관리**:
  - `isLoading`: 로그인 진행 중 상태
  - `error`: 에러 메시지
  - `user`: 로그인된 사용자 정보
- **UX 흐름**:
  1. 사용자가 이메일/비밀번호 입력
  2. 로그인 버튼 클릭 시 API 호출
  3. 성공 시 대시보드(/dashboard)로 리다이렉트
  4. 실패 시 에러 메시지 표시

---

## 📄 03_data_architecture.md - 데이터 아키텍처 통합

데이터베이스 설계와 프론트엔드 상태 관리를 함께 정의합니다.

### 예시 구조:

#### 데이터베이스 설계

**테이블: users**
- 설명: 사용자 정보 테이블

| 컬럼명       | 타입         | 제약조건              |
| ------------ | ------------ | --------------------- |
| id           | BIGINT       | PK, Auto Increment    |
| email        | VARCHAR(255) | UNIQUE, NOT NULL      |
| password     | VARCHAR(255) | NOT NULL              |
| name         | VARCHAR(100) | NOT NULL              |
| created_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP |

**테이블: todos**
- 설명: 할 일 정보 테이블

| 컬럼명       | 타입         | 제약조건              |
| ------------ | ------------ | --------------------- |
| id           | BIGINT       | PK, Auto Increment    |
| user_id      | BIGINT       | FK → users.id         |
| title        | VARCHAR(255) | NOT NULL              |
| completed    | BOOLEAN      | DEFAULT FALSE         |
| created_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP |

**관계도**:
- users(1) ↔ todos(N): 한 사용자는 여러 할 일을 가질 수 있음

#### 프론트엔드 상태 관리

**전역 상태 (Zustand/Redux 등)**:
```typescript
interface AppState {
  // 인증 관련
  user: User | null;
  isAuthenticated: boolean;
  
  // Todo 관련
  todos: Todo[];
  selectedTodo: Todo | null;
  
  // UI 상태
  isLoading: boolean;
  error: string | null;
}
```

**로컬 상태 관리**:
- 폼 입력값: React Hook Form 활용
- 모달 상태: useState 활용
- 페이지네이션: URL 쿼리 파라미터 활용

---

## ✨ 사용 방법 요약

1. `/fullstack-prompt/project_idea.md` 에 프로젝트 아이디어 문서를 생성
2. `/fullstack-prompt/fullstack_spec_guide.md` (이 문서)를 함께 Cursor에게 전달
3. 다음과 같이 요청:
   ```
   @fullstack-prompt/project_idea.md 와 @fullstack-prompt/fullstack_spec_guide.md 파일을 참고해서
   docs 폴더 안에 01~03번 풀스택 명세 문서를 생성해줘.
   ``` 