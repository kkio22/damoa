# 📄 02_page_definition.md - 페이지 정의서 (Page Definition)

이 문서는 'MyMatchLog' 플랫폼의 각 페이지별 URL, 설명, 주요 섹션을 정의합니다. 페이지별 레이아웃 및 포함 요소를 명확히 하여 퍼블리싱 구조를 일관되게 유지합니다.

---

## 🏠 공개 페이지

### PAGE_HOME
- **URL**: `/`
- **설명**: 메인 페이지 - 플랫폼 소개 및 주요 기능 안내
- **주요 섹션**:
  - Header (네비게이션)
  - Hero Section (플랫폼 소개)
  - Feature Section (주요 기능)
  - Recent Events Section (최근 이벤트)
  - Popular Stadiums Section (인기 경기장)
  - Footer

### PAGE_LOGIN
- **URL**: `/login`
- **설명**: 사용자 로그인 페이지
- **주요 섹션**:
  - Header (로고, 회원가입 링크)
  - LoginForm (이메일, 비밀번호 입력)
  - Social Login Section (향후 확장)
  - Footer

### PAGE_SIGNUP
- **URL**: `/signup`
- **설명**: 사용자 회원가입 페이지
- **주요 섹션**:
  - Header (로고, 로그인 링크)
  - SignupForm (이메일, 비밀번호, 닉네임, 응원팀 선택)
  - Terms of Service Section
  - Footer

### PAGE_EVENTS_LIST
- **URL**: `/events`
- **설명**: 진행 중인 이벤트 목록 페이지
- **주요 섹션**:
  - Header (네비게이션)
  - EventsFilter (상태별 필터링)
  - EventsList (이벤트 카드 목록)
  - Pagination
  - Footer

### PAGE_EVENT_DETAIL
- **URL**: `/events/:id`
- **설명**: 이벤트 상세 정보 및 참여 페이지
- **주요 섹션**:
  - Header (네비게이션)
  - EventDetail (이벤트 정보)
  - EventParticipation (참여 신청 버튼)
  - ParticipantStatus (참여자 현황)
  - Footer

---

## 🔐 인증 필요 페이지

### PAGE_MATCH_LOGS_LIST
- **URL**: `/match-logs`
- **설명**: 내 직관 기록 목록 페이지
- **주요 섹션**:
  - Header (네비게이션)
  - MatchLogsFilter (날짜, 팀별 필터링)
  - MatchLogsList (직관 기록 카드 목록)
  - CreateButton (새 기록 작성 버튼)
  - Pagination
  - Footer

### PAGE_MATCH_LOG_CREATE
- **URL**: `/match-logs/create`
- **설명**: 새로운 직관 기록 작성 페이지
- **주요 섹션**:
  - Header (네비게이션)
  - MatchLogForm (경기 정보 입력)
  - TicketUpload (티켓 이미지 업로드)
  - OCRSection (자동 정보 추출)
  - SubmitButton
  - Footer

### PAGE_MATCH_LOG_DETAIL
- **URL**: `/match-logs/:id`
- **설명**: 직관 기록 상세 보기 페이지
- **주요 섹션**:
  - Header (네비게이션)
  - MatchLogDetail (경기 정보)
  - TicketImage (티켓 이미지)
  - ActionButtons (수정, 삭제 버튼)
  - Footer

### PAGE_MATCH_LOG_EDIT
- **URL**: `/match-logs/:id/edit`
- **설명**: 직관 기록 수정 페이지
- **주요 섹션**:
  - Header (네비게이션)
  - MatchLogForm (기존 정보 표시)
  - TicketUpload (새 이미지 업로드)
  - UpdateButton
  - Footer

### PAGE_MYPAGE
- **URL**: `/mypage`
- **설명**: 사용자 마이페이지 (대시보드)
- **주요 섹션**:
  - Header (네비게이션)
  - Sidebar (메뉴 네비게이션)
  - UserProfile (사용자 정보)
  - Statistics (직관 통계)
  - RecentMatchLogs (최근 기록)
  - Footer

### PAGE_SETTINGS
- **URL**: `/settings`
- **설명**: 사용자 설정 페이지
- **주요 섹션**:
  - Header (네비게이션)
  - Sidebar (설정 메뉴)
  - ProfileSettings (닉네임, 응원팀)
  - PasswordSettings (비밀번호 변경)
  - SaveButton
  - Footer

---

## 👑 관리자 페이지

### PAGE_ADMIN_DASHBOARD
- **URL**: `/admin`
- **설명**: 관리자 대시보드
- **주요 섹션**:
  - Header (관리자 네비게이션)
  - Sidebar (관리자 메뉴)
  - StatisticsOverview (전체 통계)
  - RecentEvents (최근 이벤트)
  - UserActivity (사용자 활동)
  - Footer

### PAGE_ADMIN_EVENTS
- **URL**: `/admin/events`
- **설명**: 이벤트 관리 페이지
- **주요 섹션**:
  - Header (관리자 네비게이션)
  - Sidebar (관리자 메뉴)
  - EventsManagement (이벤트 CRUD)
  - CreateEventButton
  - EventsList (관리용 이벤트 목록)
  - Footer

### PAGE_ADMIN_EVENT_PARTICIPANTS
- **URL**: `/admin/events/:id/participants`
- **설명**: 이벤트 참여자 관리 페이지
- **주요 섹션**:
  - Header (관리자 네비게이션)
  - Sidebar (관리자 메뉴)
  - EventInfo (이벤트 정보)
  - ParticipantsList (참여자 목록)
  - ExportButton (참여자 목록 내보내기)
  - Footer

---

## 🎨 레이아웃 컴포넌트

### Header
- **포함 요소**:
  - 로고
  - 네비게이션 메뉴
  - 사용자 메뉴 (로그인 후)
  - 햄버거 메뉴 (모바일)

### Sidebar
- **포함 요소**:
  - 사용자 프로필
  - 메뉴 목록
  - 접기/펼치기 버튼

### Footer
- **포함 요소**:
  - 회사 정보
  - 링크 목록
  - 소셜 미디어 링크
  - 저작권 정보

### Navigation
- **포함 요소**:
  - 메인 메뉴
  - 서브 메뉴
  - 드롭다운 메뉴
  - 모바일 메뉴

---

## 📱 반응형 레이아웃

### 모바일 (< 768px)
- **Header**: 햄버거 메뉴, 로고
- **Sidebar**: 오버레이 형태
- **Content**: 단일 컬럼 레이아웃
- **Footer**: 축약된 정보

### 태블릿 (768px - 1024px)
- **Header**: 전체 메뉴 표시
- **Sidebar**: 접을 수 있는 사이드바
- **Content**: 2단 레이아웃
- **Footer**: 전체 정보 표시

### 데스크톱 (> 1024px)
- **Header**: 전체 네비게이션
- **Sidebar**: 항상 표시
- **Content**: 3단 레이아웃
- **Footer**: 전체 정보 + 추가 링크 