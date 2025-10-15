# ✅ 백엔드 프로젝트 할 일 가이드 (backend_todolist_guide.md)

다음 문서들을 참고하여 `backend_todolist.md` 파일(개발 체크리스트)을 작성해 주세요.  
참고 문서:

- 01_backend_requirements.md: 기능 요구사항 정의
- 02_db_schema.md: 데이터베이스 설계
- 03_api_spec.md: API 명세서
- 04_architecture.md: 시스템 아키텍처
- 05_exception_policy.md: 예외 처리 정책
- 06_backend_tech_summary.md: 기술 요약

---

## 📌 작성 규칙

- 항목은 **체크박스** 형식으로 작성
- 상태는 다음 3가지 중 하나로 구분
  - [ ] 구현 대기
  - [x] 구현 완료

---

## 🗂 작성 항목 예시

### 1. 전체 기능 단위 체크리스트

- [ ] 사용자 회원가입 API
- [ ] 로그인 API
- [ ] 게시글 등록 API
- [ ] 예약 생성 API
- [ ] 예약 취소 API

---

### 2. 페이지/도메인별 분류 예시

#### 👤 사용자 인증

- [ ] 회원가입 API
- [ ] 로그인 API
- [ ] 토큰 재발급 로직
- [ ] 내 정보 조회 API

#### 📝 게시글

- [ ] 게시글 등록
- [ ] 게시글 목록 조회
- [ ] 게시글 수정
- [ ] 게시글 삭제

#### 📅 예약 시스템

- [ ] 예약 생성
- [ ] 예약 조회
- [ ] 예약 취소
- [ ] 예약 대기열 처리 (Redis)

---

### 3. 공통 인프라 / 시스템 로직

- [ ] JWT 토큰 발급/검증 구현
- [ ] Global ExceptionHandler 구현
- [ ] ResponseWrapper 설계 및 적용
- [ ] DB 연동 및 마이그레이션 확인
- [ ] Swagger 또는 REST Docs 연동

---

## 🔁 사용 흐름

1. 01~06 문서와 backend_todolist_guide.md를 Cursor에게 전달
2. 다음과 같이 요청:

```
@docs 폴더 안의 문서들과 @backend_tech_summary.md, @backend_todolist_guide.md를 참고해서
backend_todolist.md 파일을 생성해줘.
```

3. 생성된 backend_todolist.md는 기능별로 업무를 나누고, 진행 상황을 추적하는 데 사용
