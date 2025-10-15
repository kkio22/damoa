# 📂 최종 프로젝트 구조

## ✅ 핵심 파일만 남김

```
used trade/
├── backend/                          # Node.js 백엔드
│   ├── src/
│   │   ├── domain/crawling/
│   │   │   ├── controller/           # API 컨트롤러 (3개)
│   │   │   │   ├── area.controller.ts       ✅ 지역 수동 등록
│   │   │   │   ├── crawling.controller.ts   ✅ 크롤링 트리거
│   │   │   │   └── product.controller.ts    ✅ 상품 검색
│   │   │   ├── repository/           # 데이터 저장소 (3개)
│   │   │   │   ├── area.repository.ts           ✅ PostgreSQL (지역)
│   │   │   │   ├── crawling.repository.ts       ✅ Redis (상품)
│   │   │   │   └── crawling-log.repository.ts   ✅ PostgreSQL (로그)
│   │   │   ├── service/              # 비즈니스 로직 (2개)
│   │   │   │   ├── area.service.ts          ✅ 지역 관리
│   │   │   │   └── crawling.service.ts      ✅ 크롤링
│   │   │   ├── routes/               # API 라우트 (3개)
│   │   │   │   ├── area.routes.ts
│   │   │   │   ├── crawling.routes.ts
│   │   │   │   └── product.routes.ts
│   │   │   ├── config/               # 설정
│   │   │   │   └── database.config.ts
│   │   │   ├── types/                # 타입 정의
│   │   │   │   └── index.ts
│   │   │   └── utils/                # 유틸리티
│   │   │       └── container.ts      # 의존성 주입
│   │   ├── app.ts                    # Express 앱
│   │   └── server.ts                 # 서버 진입점
│   ├── scripts/
│   │   ├── migrate.ts                ✅ DB 마이그레이션
│   │   └── trigger-crawling.ts       ✅ CLI 크롤링
│   ├── Dockerfile                    ✅ Docker 이미지
│   ├── package.json                  ✅ 의존성
│   └── tsconfig.json                 ✅ TypeScript 설정
├── frontend/                         # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   └── ProductSearch.jsx     ✅ 상품 검색 UI
│   │   ├── App.jsx
│   │   └── index.js
│   ├── Dockerfile                    ✅ Docker 이미지
│   ├── nginx.conf                    ✅ Nginx 설정
│   └── package.json
├── .github/workflows/                # GitHub Actions
│   ├── crawling-trigger.yml          ✅ 자동 크롤링
│   └── deploy.yml                    ✅ 자동 배포
├── docker-compose.yml                ✅ 전체 시스템
├── .env                              ✅ 환경변수 (gitignore)
├── .gitignore                        ✅ Git 제외 파일
├── README.md                         ✅ 프로젝트 소개
├── SIMPLE_GUIDE.md                   ✅ 실행 가이드
└── POSTMAN_COLLECTION.json           ✅ API 테스트

docs/                                 # 기획 문서 (참고용)
```

---

## 🎯 핵심 기능

### 1. 지역 관리 (AreaService)
- 수동으로 지역 ID와 이름 등록
- PostgreSQL areas 테이블에 저장

### 2. 상품 크롤링 (CrawlingService)
- DB에서 지역 읽기
- 당근마켓 REST API 호출
- Redis에 `{지역명}:items` 형식으로 저장

### 3. 상품 검색 (ProductController)
- Redis에서 상품 검색
- 지역별 필터링

---

## ✅ 삭제된 불필요한 파일

- ❌ GraphQL 관련 (당근마켓이 막음)
- ❌ 자동 지역 수집 (수동 등록으로 변경)
- ❌ 중복 가이드 문서 (9개 → 1개)
- ❌ Puppeteer 관련 (REST API 사용)
- ❌ 하드코딩 JSON 파일들

---

**이제 완전히 깔끔합니다!** 🎉

