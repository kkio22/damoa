# 테스트 가이드

## 📋 목차

1. [Backend 테스트](#backend-테스트)
2. [Frontend 테스트](#frontend-테스트)
3. [테스트 커버리지](#테스트-커버리지)
4. [CI/CD 통합](#cicd-통합)

---

## 🔧 Backend 테스트

### 설치

```bash
cd backend
npm install
```

### 테스트 실행

```bash
# 전체 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- tests/api/search.test.ts

# Watch 모드 (개발 시)
npm test -- --watch

# 커버리지 리포트 생성
npm test -- --coverage
```

### 테스트 구조

```
backend/tests/
├── setup.ts                    # 테스트 환경 설정
├── api/
│   ├── crawling.test.ts       # 크롤링 API 테스트
│   ├── search.test.ts         # 검색 API 테스트
│   ├── ai.test.ts             # AI API 테스트
│   └── system.test.ts         # 시스템 API 테스트
└── integration/
    └── search-flow.test.ts    # 통합 테스트 (검색 플로우)
```

### 테스트 시나리오

#### 1. 크롤링 API
- ✅ 크롤링 상태 조회
- ✅ 크롤링 트리거
- ✅ 크롤링 로그 조회

#### 2. 검색 API
- ✅ 상품 검색 (기본)
- ✅ 검색어 유효성 검증
- ✅ 가격 필터 적용
- ✅ 지역 필터 적용
- ✅ 최근 검색어 조회
- ✅ 인기 검색어 조회

#### 3. AI API
- ✅ AI 분석 요청
- ✅ 상품 데이터 유효성 검증
- ✅ AI 캐시 통계 조회
- ✅ AI 캐시 삭제

#### 4. 시스템 API
- ✅ 시스템 상태 조회
- ✅ 헬스 체크

#### 5. 통합 테스트
- ✅ 검색 → AI 분석 플로우
- ✅ 빈 검색 결과 처리
- ✅ 필터 적용 검색

---

## 🎨 Frontend 테스트

### 설치

```bash
cd frontend
npm install
```

### 테스트 실행

```bash
# 전체 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- ProductSearch.test.jsx

# Watch 모드 (기본)
npm test

# 커버리지 리포트 생성
npm test -- --coverage --watchAll=false
```

### 테스트 구조

```
frontend/src/components/__tests__/
├── App.test.jsx              # App 컴포넌트 테스트
├── ProductSearch.test.jsx    # 검색 컴포넌트 테스트
├── SkeletonLoader.test.jsx   # 스켈레톤 로더 테스트
├── ErrorMessage.test.jsx     # 에러 메시지 테스트
├── EmptyState.test.jsx       # 빈 상태 테스트
└── Pagination.test.jsx       # 페이지네이션 테스트
```

### 테스트 시나리오

#### 1. App 컴포넌트
- ✅ 정상 렌더링
- ✅ 헤더/푸터 표시
- ✅ 스타일 적용

#### 2. ProductSearch 컴포넌트
- ✅ 검색어 입력
- ✅ API 호출
- ✅ 검색 결과 표시
- ✅ 에러 처리
- ✅ 필터 기능 (지역, 가격)
- ✅ AI 분석 버튼

#### 3. SkeletonLoader 컴포넌트
- ✅ 스켈레톤 카드 표시
- ✅ 개수 조절 (count prop)
- ✅ 애니메이션 적용

#### 4. ErrorMessage 컴포넌트
- ✅ 에러 메시지 표시
- ✅ 다시 시도 버튼
- ✅ 기본 메시지

#### 5. EmptyState 컴포넌트
- ✅ 빈 상태 메시지
- ✅ 커스텀 아이콘/제목/메시지
- ✅ 검색 팁 표시

#### 6. Pagination 컴포넌트
- ✅ 페이지 번호 클릭
- ✅ 이전/다음 버튼
- ✅ 현재 페이지 강조
- ✅ 버튼 비활성화

---

## 📊 테스트 커버리지

### Backend 목표

- **라인 커버리지**: 70% 이상
- **함수 커버리지**: 70% 이상
- **브랜치 커버리지**: 60% 이상

### Frontend 목표

- **라인 커버리지**: 60% 이상
- **함수 커버리지**: 60% 이상
- **브랜치 커버리지**: 50% 이상

### 커버리지 확인

```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage --watchAll=false
```

커버리지 리포트는 `coverage/` 디렉토리에 생성됩니다.

---

## 🚀 CI/CD 통합

### GitHub Actions (예시)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --watchAll=false
```

---

## 💡 테스트 작성 가이드

### Backend 테스트

1. **Mock 사용**: 외부 의존성(DB, Redis)은 Mock으로 처리
2. **독립성**: 각 테스트는 독립적으로 실행 가능해야 함
3. **명확한 테스트명**: `it('검색어 없이 요청하면 에러를 반환해야 함')`

### Frontend 테스트

1. **사용자 관점**: 사용자가 하는 행동을 테스트
2. **UI 테스트**: 렌더링, 클릭, 입력 등
3. **Axios Mock**: API 호출은 Mock으로 처리

---

## 🔍 테스트 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `npm test` | 전체 테스트 실행 |
| `npm test -- --watch` | Watch 모드 실행 |
| `npm test -- --coverage` | 커버리지 리포트 생성 |
| `npm test -- <파일명>` | 특정 파일만 테스트 |
| `npm test -- -t "<테스트명>"` | 특정 테스트만 실행 |

---

## ⚠️ 주의사항

### Backend 테스트

1. **환경 변수**: 테스트 환경에서는 별도 DB/Redis 사용
2. **타임아웃**: 긴 작업은 `jest.setTimeout()` 설정
3. **정리**: `afterAll`로 리소스 정리

### Frontend 테스트

1. **비동기 처리**: `waitFor()` 사용
2. **Mock 초기화**: `beforeEach`에서 Mock 초기화
3. **UI 테스트**: DOM 상태 확인보다 사용자 경험 테스트

---

## 📚 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [Testing Library 공식 문서](https://testing-library.com/)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [React Testing Library 예제](https://testing-library.com/docs/react-testing-library/example-intro)

---

## ✅ 테스트 체크리스트

### Backend
- [x] Jest + Supertest 환경 설정
- [x] 크롤링 API 테스트
- [x] 검색 API 테스트
- [x] AI API 테스트
- [x] 시스템 API 테스트
- [x] 통합 테스트 (검색 플로우)

### Frontend
- [x] React Testing Library 환경 설정
- [x] App 컴포넌트 테스트
- [x] ProductSearch 컴포넌트 테스트
- [x] UI 컴포넌트 테스트
- [x] Pagination 테스트

---

## 🎯 다음 단계

1. ✅ 기본 테스트 작성 완료
2. ⬜ E2E 테스트 추가 (Playwright, 선택사항)
3. ⬜ 성능 테스트 추가
4. ⬜ CI/CD 파이프라인 설정

