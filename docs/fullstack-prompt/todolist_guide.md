# ✅ 풀스택 프로젝트 Todo List 가이드 (todo.md)

다음 문서들을 참고하여 `fullstack_todolist.md` 파일(개발 체크리스트)을 작성해 주세요.  
참고 문서:

- project_idea.md: 프로젝트 아이디어
- 01_system_requirements.md: 시스템 요구사항
- 02_api_ui_spec.md: API + UI 통합 명세서
- 03_data_architecture.md: 데이터 아키텍처
- fullstack_tech_summary.md: 기술 요약

---

## 📌 작성 규칙

- 항목은 **체크박스** 형식으로 작성
- 상태는 다음 3가지 중 하나로 구분
  - [ ] 구현 대기
  - [🔄] 구현 중
  - [x] 구현 완료
- 우선순위를 고려하여 순서 배치
- Frontend와 Backend를 통합적으로 관리
- 항상 기능단위(프론트엔드,백엔드 동시 진행)로 개발. 하나의 작업이 진행될 때마다 결과물을 봐야함.
---

## 🗂 작성 항목 예시

### 1. 🏗️ 프로젝트 초기 설정

#### 개발 환경 구축
- [ ] Frontend 프로젝트 생성 (Vite + React + TypeScript)
- [ ] Backend 프로젝트 생성 (Node.js + Express)
- [ ] 데이터베이스 설정 (MongoDB/PostgreSQL)
- [ ] Git 저장소 생성 및 초기 커밋
- [ ] 환경변수 설정 (.env 파일)

#### 필수 패키지 설치
- [ ] Frontend: TailwindCSS, shadcn/ui, React Router, Zustand, Axios
- [ ] Backend: Express, JWT, bcrypt, cors, helmet, dotenv
- [ ] 개발 도구: ESLint, Prettier, nodemon

### 2. 랜딩페이지 개발(프론트, 백엔드)
- [ ] ...

...


---

## 🔁 사용 흐름

1. 01~04 문서와 fullstack_tech_summary.md, fullstack_todolist_guide.md를 Cursor에게 전달
2. 다음과 같이 요청:

```
@docs 폴더 안의 문서들과 @fullstack_tech_summary.md, @fullstack_todolist_guide.md를 참고해서
fullstack_todolist.md 파일을 생성해줘.
```

3. 생성된 fullstack_todolist.md는 프론트엔드와 백엔드를 통합적으로 관리하며, 진행 상황을 추적하는 데 사용

---

## 💡 개발 팁

- **우선순위**: 인증 시스템 → 핵심 CRUD → UI/UX 개선 → 부가 기능 순으로 진행
- **협업**: Frontend와 Backend 개발을 병렬로 진행할 수 있도록 API 명세서를 먼저 확정
- **테스트**: 각 기능 완성 후 즉시 테스트 코드 작성
- **배포**: 개발 초기부터 CI/CD 파이프라인 구축하여 지속적 배포 환경 마련 