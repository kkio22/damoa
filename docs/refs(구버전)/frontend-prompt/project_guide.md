`main_theme_data.json` 파일을 참고해서, 예시를 보고 `frontend/frontend-docs` 폴더에 아래 4가지 문서를 생성해주세요.

## 1. IA 문서 (Information Architecture)

### 설명
사이트 전체의 정보 구조를 정의하는 문서입니다. 페이지 계층 구조, 네비게이션 구조, URL 매핑을 포함합니다.  
이 문서는 전체 사이트 맵과 사용자 이동 경로를 명확히 하여 라우팅 및 네비게이션 구현에 활용됩니다.

### 예시
#### 사이트맵 구조
- Home (/)
- 회원
  - 로그인 (/login)
  - 회원가입 (/signup)
- 게시판 (/board)
  - 게시글 상세 (/board/:id)
- 마이페이지 (/mypage)
- 설정 (/settings)

#### 네비게이션 메뉴
- [홈](/)
- [게시판](/board)
- [마이페이지](/mypage)
- [설정](/settings)

---

## 2. 페이지 정의서 (Page Definition)

### 설명
각 페이지의 URL, 설명, 주요 섹션을 정의하는 문서입니다.  
이 문서는 페이지별 레이아웃 및 포함 요소를 명확히 하여 퍼블리싱 구조를 일관되게 유지합니다.

### 예시
#### PAGE_LOGIN
- URL: /login
- 설명: 로그인 페이지
- 주요 섹션:
  - Header
  - LoginForm
  - Footer

#### PAGE_SIGNUP
- URL: /signup
- 설명: 회원가입 페이지
- 주요 섹션:
  - Header
  - SignupForm
  - Footer

#### PAGE_BOARD
- URL: /board
- 설명: 게시글 목록 페이지
- 주요 섹션:
  - Header
  - SearchBar
  - PostList
  - Pagination
  - Footer

---


## 3. 기능 상세 명세서 (Functional Detail Spec)

### 설명
각 기능의 입력 값, 처리 방식, 출력 결과를 구체적으로 정의하는 문서입니다.  
이 문서는 프론트엔드에서 구현해야 할 로직과 화면 동작을 명확히 합니다.

### 예시
#### 기능명: 게시글 검색
- 입력: 검색어 (문자열)
- 처리: 검색어 기반 게시글 리스트 필터링 (프론트에서)
- 출력: 필터링된 게시글 카드 리스트 표시

#### 기능명: 회원가입
- 입력: 이메일, 비밀번호, 닉네임
- 처리: 모든 필드 입력 → 유효성 검증 후 가입 버튼 활성화
- 출력: 가입 완료 시 /login 페이지로 이동

---

## 4. UI/UX 상세 가이드 (UI/UX Detailed Guide)

### 설명
사이트의 디자인 시스템과 UI 정책을 정의하는 문서입니다. 컬러, 폰트, 버튼 스타일, 반응형 규칙, 접근성 지침 등을 포함합니다.  
이 문서는 퍼블리싱 단계에서 일관성 있는 UI 구현을 보장합니다.

### 예시
#### 컬러 팔레트
- Primary: #2563EB
- Secondary: #9333EA
- Background: #F9FAFB
- Text: #111827

#### 폰트
- 기본 폰트: Pretendard, sans-serif
- 크기 계층:
  - Title: 24px Bold
  - Subtitle: 18px Medium
  - Body: 14px Regular

#### 버튼 스타일
- Primary Button: 배경색 Primary, 높이 48px, border-radius 8px
- Hover: 색상 #1D4ED8

#### 반응형 규칙
- Mobile: <640px (1단 레이아웃)
- Tablet: 641~1024px (2단 레이아웃)
- Desktop: >1024px (3단 레이아웃)
