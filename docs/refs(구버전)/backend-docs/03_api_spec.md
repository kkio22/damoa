# 📄 03_api_spec.md - API 명세서

이 문서는 'MyMatchLog' 프로젝트의 REST API 명세를 정의합니다. 각 API의 엔드포인트, 메서드, 인증 여부, 요청 및 응답 형식, 상태 코드를 상세히 기술합니다.

---

## 🏟️ 공통 (Common)

### 1. 팀 목록 조회

- **URL**: `GET /api/teams`
- **설명**: KBO 리그의 모든 팀 목록을 조회합니다. 사용자가 응원팀을 선택할 때 사용됩니다.
- **인증**: 불필요
- **요청 본문**: 없음
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": 1,
        "name": "LG 트윈스",
        "logo_url": "https://example.com/lg-logo.png",
        "stadium": {
          "id": 1,
          "name": "잠실야구장",
          "city": "서울"
        }
      },
      {
        "id": 2,
        "name": "두산 베어스",
        "logo_url": "https://example.com/doosan-logo.png",
        "stadium": {
          "id": 1,
          "name": "잠실야구장",
          "city": "서울"
        }
      }
    ]
  },
  "message": "팀 목록 조회에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공

### 2. 경기장 목록 조회

- **URL**: `GET /api/stadiums`
- **설명**: KBO 리그의 모든 경기장 목록을 조회합니다.
- **인증**: 불필요
- **요청 본문**: 없음
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "stadiums": [
      {
        "id": 1,
        "name": "잠실야구장",
        "city": "서울",
        "capacity": 25000,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "고척스카이돔",
        "city": "서울",
        "capacity": 16000,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "경기장 목록 조회에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공

---

## 👤 사용자 (Users)

### 1. 사용자 회원가입

- **URL**: `POST /api/users/signup`
- **설명**: 새로운 사용자를 시스템에 등록합니다.
- **인증**: 불필요
- **요청 본문 (Request Body)**: `application/json`
  - `email` (string, required): 유효한 이메일 형식이어야 합니다.
  - `password` (string, required): 최소 8자 이상이며, 대/소문자, 숫자, 특수문자(@$!%\*?&)를 모두 포함해야 합니다.
  - `nickname` (string, required): 중복되지 않는 닉네임이어야 합니다.

```json
{
  "email": "mymatchlog@example.com",
  "password": "Password123!",
  "nickname": "야구팬"
}
```

- **응답 (Response)**: `201 CREATED`

```json
{
  "success": true,
  "data": {
    "userId": 1
  },
  "message": "회원가입이 완료되었습니다."
}
```

- **주요 상태 코드**:
  - `201 CREATED`: 성공
  - `400 BAD REQUEST`: 입력값 유효성 검사 실패
  - `409 CONFLICT`: 이메일 중복 (`USER_EMAIL_DUPLICATE`)
  - `409 CONFLICT`: 닉네임 중복 (`USER_NICKNAME_DUPLICATE`)

### 2. 사용자 로그인

- **URL**: `POST /api/users/login`
- **설명**: 이메일과 비밀번호로 로그인하고 JWT를 발급받습니다.
- **인증**: 불필요
- **요청 본문 (Request Body)**: `application/json`

```json
{
  "email": "mymatchlog@example.com",
  "password": "password123!"
}
```

- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "로그인에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 비밀번호 불일치 (`USER_PASSWORD_MISMATCH`)
  - `404 NOT FOUND`: 존재하지 않는 사용자 (`USER_NOT_FOUND`)

### 3. 내 정보 수정 (닉네임, 응원팀)

- **URL**: `PATCH /api/users/me`
- **설명**: 현재 로그인된 사용자의 정보(닉네임, 응원팀)를 수정합니다. 두 필드 모두 선택적으로 전송할 수 있습니다.
- **인증**: 필요 (Bearer Token)
- **요청 본문 (Request Body)**: `application/json`

```json
{
  "nickname": "열혈야구팬",
  "favorite_team_id": 1
}
```

- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "nickname": "열혈야구팬",
      "favorite_team_id": 1
    }
  },
  "message": "사용자 정보가 성공적으로 업데이트되었습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `400 BAD REQUEST`: 유효하지 않은 `favorite_team_id`
  - `401 UNAUTHORIZED`: 인증 실패
  - `409 CONFLICT`: 닉네임이 이미 존재함

### 4. 내 정보 조회

- **URL**: `GET /api/users/me`
- **설명**: 현재 로그인된 사용자의 정보를 조회합니다.
- **인증**: 필요 (Bearer Token)
- **요청 본문**: 없음
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "mymatchlog@example.com",
      "nickname": "열혈야구팬",
      "favorite_team_id": 1,
      "created_at": "2024-07-20T10:00:00.000Z",
      "updated_at": "2024-07-21T15:30:00.000Z"
    }
  },
  "message": "내 정보 조회에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 인증 실패

### 5. Access Token 갱신

- **URL**: `POST /api/users/token`
- **설명**: 유효한 Refresh Token을 사용하여 만료된 Access Token을 갱신합니다.
- **인증**: 불필요
- **요청 본문 (Request Body)**: `application/json`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new..."
  },
  "message": "Access Token이 성공적으로 갱신되었습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 유효하지 않거나 만료된 Refresh Token

---

## ⚾ 직관 기록 (Match Logs)

### 1. 직관 기록 생성

- **URL**: `POST /api/match-logs`
- **설명**: 새로운 직관 기록을 생성합니다. 티켓 이미지를 포함할 수 있습니다.
- **인증**: 필요 (Bearer Token)
- **요청 본문 (Request Body)**: `multipart/form-data`
  - `match_date` (Date): `2024-07-21`
  - `stadium_id` (Integer): `1` (경기장 ID, stadiums 테이블 참조)
  - `home_team_id` (Integer): `1` (팀 ID, teams 테이블 참조)
  - `away_team_id` (Integer): `2` (팀 ID, teams 테이블 참조, home_team_id와 달라야 함)
  - `result` (String, Optional): `WIN` (WIN, LOSS, DRAW 중 하나)
  - `memo` (String, Optional): `꿀잼 경기!`
  - `ticket_image` (File, Optional): 티켓 이미지 파일 (jpg, png, jpeg 지원)
- **응답 (Response)**: `201 CREATED`

```json
{
  "success": true,
  "data": {
    "matchLogId": 10
  },
  "message": "직관 기록이 성공적으로 등록되었습니다."
}
```

- **주요 상태 코드**:
  - `201 CREATED`: 성공
  - `400 BAD REQUEST`: 필수 입력값 누락
  - `401 UNAUTHORIZED`: 인증 실패

### 2. 내 직관 기록 목록 조회

- **URL**: `GET /api/match-logs`
- **설명**: 현재 로그인된 사용자의 직관 기록 목록을 페이지네이션과 함께 조회합니다.
- **인증**: 필요 (Bearer Token)
- **Query Parameters**:
  - `page` (Integer, Optional): 페이지 번호 (기본값: 1)
  - `limit` (Integer, Optional): 페이지당 항목 수 (기본값: 10, 최대: 50)
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "matchLogs": [
      {
        "id": 10,
        "match_date": "2024-07-21T00:00:00.000Z",
        "home_team": {
          "id": 1,
          "name": "LG 트윈스"
        },
        "away_team": {
          "id": 2,
          "name": "두산 베어스"
        },
        "stadium": {
          "id": 1,
          "name": "잠실야구장",
          "city": "서울"
        },
        "result": "WIN",
        "memo": "꿀잼 경기!",
        "ticket_image_url": "https://mymatchlog-bucket.s3.amazonaws.com/tickets/abc123.jpg",
        "created_at": "2024-07-21T10:30:00.000Z",
        "updated_at": "2024-07-21T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  },
  "message": "직관 기록 목록 조회에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 인증 실패

### 3. 직관 기록 상세 조회

- **URL**: `GET /api/match-logs/:id`
- **설명**: 지정된 ID의 직관 기록 상세 정보를 조회합니다. 본인의 기록만 조회 가능합니다.
- **인증**: 필요 (Bearer Token)
- **Path Parameters**:
  - `id` (Integer, required): 직관 기록 ID
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "matchLog": {
      "id": 10,
      "user_id": 5,
      "match_date": "2024-07-21T00:00:00.000Z",
      "home_team": {
        "id": 1,
        "name": "LG 트윈스"
      },
      "away_team": {
        "id": 2,
        "name": "두산 베어스"
      },
      "stadium": {
        "id": 1,
        "name": "잠실야구장",
        "city": "서울"
      },
      "result": "WIN",
      "memo": "꿀잼 경기!",
      "ticket_image_url": "https://mymatchlog-bucket.s3.amazonaws.com/tickets/abc123.jpg",
      "created_at": "2024-07-21T10:30:00.000Z",
      "updated_at": "2024-07-21T10:30:00.000Z"
    }
  },
  "message": "직관 기록 상세 조회에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 인증 실패
  - `403 FORBIDDEN`: 접근 권한 없음 (다른 사용자의 기록)
  - `404 NOT FOUND`: 존재하지 않는 직관 기록

### 4. 직관 기록 수정

- **URL**: `PATCH /api/match-logs/:id`
- **설명**: 지정된 ID의 직관 기록을 수정합니다. 본인의 기록만 수정 가능합니다.
- **인증**: 필요 (Bearer Token)
- **Path Parameters**:
  - `id` (Integer, required): 직관 기록 ID
- **요청 본문 (Request Body)**: `multipart/form-data`
  - `match_date` (Date, Optional): `2024-07-22`
  - `home_team_id` (Integer, Optional): `3` (팀 ID, teams 테이블 참조)
  - `away_team_id` (Integer, Optional): `4` (팀 ID, teams 테이블 참조, home_team_id와 달라야 함)
  - `stadium_id` (Integer, Optional): `2` (경기장 ID, stadiums 테이블 참조)
  - `result` (String, Optional): `LOSS` (WIN, LOSS, DRAW 중 하나)
  - `memo` (String, Optional): `아쉬운 경기였지만 재미있었어요!`
  - `ticket_image` (File, Optional): 새로운 티켓 이미지 파일 (jpg, png, jpeg 지원)
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "matchLog": {
      "id": 10,
      "user_id": 5,
      "match_date": "2024-07-22T00:00:00.000Z",
      "home_team": {
        "id": 3,
        "name": "키움 히어로즈"
      },
      "away_team": {
        "id": 4,
        "name": "삼성 라이온즈"
      },
      "stadium": {
        "id": 2,
        "name": "고척스카이돔",
        "city": "서울"
      },
      "result": "LOSS",
      "memo": "아쉬운 경기였지만 재미있었어요!",
      "ticket_image_url": "https://mymatchlog-bucket.s3.amazonaws.com/tickets/abc123.jpg",
      "created_at": "2024-07-21T10:30:00.000Z",
      "updated_at": "2024-07-22T15:45:00.000Z"
    }
  },
  "message": "직관 기록이 성공적으로 수정되었습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `400 BAD REQUEST`: 유효하지 않은 입력값 (같은 팀 ID, 존재하지 않는 팀 등)
  - `401 UNAUTHORIZED`: 인증 실패
  - `403 FORBIDDEN`: 접근 권한 없음 (다른 사용자의 기록)
  - `404 NOT FOUND`: 존재하지 않는 직관 기록

### 5. 직관 기록 삭제

- **URL**: `DELETE /api/match-logs/:id`
- **설명**: 지정된 ID의 직관 기록을 삭제합니다. 본인의 기록만 삭제 가능합니다.
- **인증**: 필요 (Bearer Token)
- **Path Parameters**:
  - `id` (Integer, required): 직관 기록 ID
- **요청 본문**: 없음
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": null,
  "message": "직관 기록이 성공적으로 삭제되었습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 인증 실패
  - `403 FORBIDDEN`: 접근 권한 없음 (다른 사용자의 기록)
  - `404 NOT FOUND`: 존재하지 않는 직관 기록

---

## 🔍 OCR (Optical Character Recognition)

### 1. 티켓 OCR 정보 추출

- **URL**: `POST /api/ocr/parse-ticket`
- **설명**: 업로드된 티켓 이미지에서 OCR을 통해 경기 정보를 자동 추출합니다.
- **인증**: 필요 (Bearer Token)
- **요청 본문 (Request Body)**: `multipart/form-data`
  - `ticket_image` (File, required): 티켓 이미지 파일 (jpg, png, jpeg 지원)
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "extractedInfo": {
      "match_date": "2024-07-21",
      "stadium": "잠실야구장",
      "home_team": "LG 트윈스",
      "away_team": "두산 베어스",
      "confidence": 0.85
    }
  },
  "message": "티켓 정보 추출에 성공했습니다."
}
```

- **응답 (OCR 실패 시)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "extractedInfo": null,
    "error": "티켓 정보를 인식할 수 없습니다."
  },
  "message": "티켓 정보 추출을 완료했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공 (OCR 성공/실패 관계없이)
  - `400 BAD REQUEST`: 지원하지 않는 파일 형식
  - `401 UNAUTHORIZED`: 인증 실패
  - `413 PAYLOAD TOO LARGE`: 파일 크기 초과

---

## 🎉 이벤트 (Events)

### 1. 진행 중인 이벤트 목록 조회

- **URL**: `GET /api/events`
- **설명**: 현재 진행 중인 이벤트 목록을 조회합니다.
- **인증**: 불필요
- **요청 본문**: 없음
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 1,
        "title": "야구 직관 이벤트",
        "description": "직관 기록을 남기고 선착순으로 참여하는 이벤트입니다.",
        "start_at": "2024-07-21T10:00:00.000Z",
        "end_at": "2024-07-21T18:00:00.000Z",
        "gift": "야구 굿즈",
        "capacity": 100,
        "participant_count": 45,
        "created_at": "2024-07-20T09:00:00.000Z",
        "updated_at": "2024-07-21T12:30:00.000Z"
      },
      {
        "id": 2,
        "title": "선착순 할인 이벤트",
        "description": "선착순 50명에게 50% 할인 쿠폰을 제공합니다.",
        "start_at": "2024-07-22T14:00:00.000Z",
        "end_at": "2024-07-22T16:00:00.000Z",
        "gift": "50% 할인 쿠폰",
        "capacity": 50,
        "participant_count": 12,
        "created_at": "2024-07-21T10:00:00.000Z",
        "updated_at": "2024-07-22T14:15:00.000Z"
      }
    ]
  },
  "message": "진행 중인 이벤트 목록 조회에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공

### 2. 이벤트 상세 조회

- **URL**: `GET /api/events/:id`
- **설명**: 지정된 ID의 이벤트 상세 정보를 조회합니다.
- **인증**: 불필요
- **Path Parameters**:
  - `id` (Integer, required): 이벤트 ID
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "event": {
      "id": 1,
      "title": "야구 직관 이벤트",
      "description": "직관 기록을 남기고 선착순으로 참여하는 이벤트입니다.",
      "start_at": "2024-07-21T10:00:00.000Z",
      "end_at": "2024-07-21T18:00:00.000Z",
      "gift": "야구 굿즈",
      "capacity": 100,
      "participant_count": 45,
      "created_at": "2024-07-20T09:00:00.000Z",
      "updated_at": "2024-07-21T12:30:00.000Z"
    }
  },
  "message": "이벤트 상세 조회에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `404 NOT FOUND`: 존재하지 않는 이벤트

### 3. 이벤트 선착순 참여

- **URL**: `POST /api/events/:id/participate`
- **설명**: 지정된 ID의 이벤트에 선착순으로 참여를 신청합니다. 동시성 제어가 필수적입니다.
- **인증**: 필요 (Bearer Token)
- **Path Parameters**:
  - `id` (Integer, required): 이벤트 ID
- **요청 본문 (Request Body)**: 없음
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "participationId": 123
  },
  "message": "이벤트 참여 신청이 완료되었습니다. 결과를 기다려주세요."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 인증 실패
  - `403 FORBIDDEN`: 이벤트 참여 기간이 아님
  - `404 NOT FOUND`: 존재하지 않는 이벤트
  - `409 CONFLICT`: 이미 참여한 이벤트입니다. (`EVENT_ALREADY_PARTICIPATED`)
  - `409 CONFLICT`: 선착순 정원이 마감되었습니다. (`EVENT_CAPACITY_EXCEEDED`)
  - `429 TOO MANY REQUESTS`: 과도한 요청 (Rate Limit)

---

## 👑 관리자 (Admin)

### 1. 이벤트 생성

- **URL**: `POST /api/admin/events`
- **설명**: 새로운 이벤트를 생성합니다. 관리자 권한이 필요합니다.
- **인증**: 필요 (Bearer Token)
- **요청 본문 (Request Body)**: `application/json`

```json
{
  "title": "야구 직관 이벤트",
  "description": "직관 기록을 남기고 선착순으로 참여하는 이벤트입니다.",
  "start_at": "2024-07-25T10:00:00.000Z",
  "end_at": "2024-07-25T18:00:00.000Z",
  "gift": "야구 굿즈",
  "capacity": 100
}
```

- **응답 (Response)**: `201 CREATED`

```json
{
  "success": true,
  "data": {
    "event": {
      "id": 3,
      "title": "야구 직관 이벤트",
      "description": "직관 기록을 남기고 선착순으로 참여하는 이벤트입니다.",
      "start_at": "2024-07-25T10:00:00.000Z",
      "end_at": "2024-07-25T18:00:00.000Z",
      "gift": "야구 굿즈",
      "capacity": 100,
      "participant_count": 0,
      "created_at": "2024-07-22T15:30:00.000Z",
      "updated_at": "2024-07-22T15:30:00.000Z"
    }
  },
  "message": "이벤트가 성공적으로 생성되었습니다."
}
```

- **주요 상태 코드**:
  - `201 CREATED`: 성공
  - `400 BAD REQUEST`: 유효하지 않은 입력값
  - `401 UNAUTHORIZED`: 인증 실패
  - `403 FORBIDDEN`: 관리자 권한 없음

### 2. 이벤트 참여자 목록 조회

- **URL**: `GET /api/admin/events/:id/participants`
- **설명**: 지정된 이벤트의 참여자 목록을 조회합니다. 관리자 권한이 필요합니다.
- **인증**: 필요 (Bearer Token)
- **Path Parameters**:
  - `id` (Integer, required): 이벤트 ID
- **응답 (Response)**: `200 OK`

```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "id": 1,
        "user_id": 5,
        "event_id": 1,
        "status": "ACTIVE",
        "created_at": "2024-07-21T10:15:00.000Z",
        "user": {
          "nickname": "야구팬1",
          "email": "user1@example.com"
        }
      },
      {
        "id": 2,
        "user_id": 8,
        "event_id": 1,
        "status": "ACTIVE",
        "created_at": "2024-07-21T10:16:00.000Z",
        "user": {
          "nickname": "야구팬2",
          "email": "user2@example.com"
        }
      }
    ]
  },
  "message": "이벤트 참여자 목록 조회에 성공했습니다."
}
```

- **주요 상태 코드**:
  - `200 OK`: 성공
  - `401 UNAUTHORIZED`: 인증 실패
  - `403 FORBIDDEN`: 관리자 권한 없음
  - `404 NOT FOUND`: 존재하지 않는 이벤트
