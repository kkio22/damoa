# 📄 01_backend_requirements.md - 기능 요구사항 정의서

이 문서는 'MyMatchLog' 프로젝트 백엔드 개발을 위한 기능 요구사항을 정의합니다. API를 중심으로 각 기능의 우선순위와 관련 엔드포인트를 명시합니다.

---

## 🚀 주요 기능 요구사항

| ID            | 기능 설명                         | 우선순위 | 관련 API                                 | 상태    |
| :------------ | :-------------------------------- | :------- | :--------------------------------------- | :------ |
| **공통**      |                                   |          |                                          |         |
| BE-000        | 팀 목록 조회                      | 중간     | `GET /api/teams`                         | ✅ 완료 |
| BE-001        | 경기장 목록 조회                  | 중간     | `GET /api/stadiums`                      | ✅ 완료 |
| **사용자**    |                                   |          |                                          |         |
| BE-002        | 사용자 회원가입                   | 높음     | `POST /api/users/signup`                 | ✅ 완료 |
| BE-003        | 사용자 로그인 (JWT 발급)          | 높음     | `POST /api/users/login`                  | ✅ 완료 |
| BE-004        | Access Token 갱신                 | 높음     | `POST /api/users/token`                  | ✅ 완료 |
| BE-005        | 내 정보 조회                      | 높음     | `GET /api/users/me`                      | ✅ 완료 |
| BE-006        | 내 정보 수정 (닉네임, 응원팀)     | 중간     | `PATCH /api/users/me`                    | ✅ 완료 |
| **직관 기록** |                                   |          |                                          |         |
| BE-007        | 티켓 이미지 OCR 정보 추출 요청    | 높음     | `POST /api/ocr/parse-ticket`             | ✅ 완료 |
| BE-008        | 직관 기록 생성 (티켓 이미지 포함) | 높음     | `POST /api/match-logs`                   | ✅ 완료 |
| BE-009        | 내 직관 기록 목록 조회            | 높음     | `GET /api/match-logs`                    | ✅ 완료 |
| BE-010        | 직관 기록 상세 조회               | 높음     | `GET /api/match-logs/:id`                | ✅ 완료 |
| BE-011        | 직관 기록 수정                    | 중간     | `PATCH /api/match-logs/:id`              | ✅ 완료 |
| BE-012        | 직관 기록 삭제                    | 중간     | `DELETE /api/match-logs/:id`             | ✅ 완료 |
| **이벤트**    |                                   |          |                                          |         |
| BE-013        | 진행 중인 이벤트 목록 조회        | 높음     | `GET /api/events`                        | ✅ 완료 |
| BE-014        | 이벤트 상세 조회                  | 높음     | `GET /api/events/:id`                    | ✅ 완료 |
| BE-015        | 이벤트 선착순 참여 (동시성 제어)  | 높음     | `POST /api/events/:id/participate`       | ✅ 완료 |
| **관리자**    |                                   |          |                                          |         |
| BE-016        | 이벤트 생성                       | 낮음     | `POST /api/admin/events`                 | ✅ 완료 |
| BE-017        | 이벤트 참여자 목록 조회           | 낮음     | `GET /api/admin/events/:id/participants` | ✅ 완료 |

---

## 📊 개발 진행 상황

### ✅ 완료된 기능 (17/17)

- **공통 API**: 팀, 경기장 목록 조회
- **사용자 도메인**: 회원가입, 로그인, 토큰 갱신, 정보 조회/수정
- **직관 기록 도메인**: OCR, CRUD 전체 기능
- **이벤트 도메인**: 이벤트 조회, 참여 (Redis 분산 락 동시성 제어 포함)
- **관리자 도메인**: 이벤트 생성, 참여자 목록 조회

### 🔄 다음 단계

- **테스트 코드 작성**: Jest + Supertest 환경 구축
- **배포 준비**: PM2 설정
- **CI/CD**: GitHub Actions 파이프라인 구축 (선택사항)
