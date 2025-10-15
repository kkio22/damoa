# 🤖 크롤링 스케줄러 가이드

## ⚠️ 중요한 사실

### 컴퓨터를 꺼도 돌아가나요?

**❌ 아니요!**

스케줄러는 **Node.js 프로세스가 실행 중일 때만** 작동합니다.

```
로컬 컴퓨터 끄면
    ↓
Docker 컨테이너 중지
    ↓
스케줄러 중지 ❌
```

**해결 방법:**
- 클라우드 서버에서 24시간 실행 (AWS, GCP, Azure)
- 또는 Railway, Render, DigitalOcean 같은 호스팅 서비스

---

## 🎛️ 스케줄러 제어

### 현재 상태: **비활성화** ✅

기본적으로 스케줄러는 **실행되지 않습니다**.

환경변수 `ENABLE_CRAWLER_SCHEDULER`가 `true`일 때만 작동합니다.

---

## 📝 사용 방법

### 1️⃣ 비활성화 (기본값) - 지금 상태

**아무것도 안 하면 비활성화입니다.**

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      # ENABLE_CRAWLER_SCHEDULER를 설정하지 않음 (기본값)
      # 또는
      ENABLE_CRAWLER_SCHEDULER: "false"
```

**실행 시:**
```bash
docker-compose up -d

# 로그 확인
docker-compose logs backend | grep "스케줄러"
```

**결과:**
```
⏸️  크롤링 스케줄러 비활성화 (ENABLE_CRAWLER_SCHEDULER=true로 활성화)
```

---

### 2️⃣ 활성화 (서버 배포 시)

클라우드 서버에 배포할 때만 활성화하세요.

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      ENABLE_CRAWLER_SCHEDULER: "true"  # 이 줄 추가
```

**실행 시:**
```bash
docker-compose up -d --build

# 로그 확인
docker-compose logs -f backend | grep "스케줄"
```

**결과:**
```
✅ 크롤링 스케줄러 등록: 매일 자정 (Asia/Seoul)
🚀 1개 크롤링 스케줄러 시작!
✅ 크롤링 스케줄러 활성화 (매일 자정)
```

---

## 🔧 스케줄 옵션

코드에서 변경 가능:

### 옵션 1: 매일 자정 (기본)
```typescript
scheduler.scheduleDailyCrawling();
```
- 매일 00:00에 실행
- 로그 + 백업 포함

### 옵션 2: 4시간마다
```typescript
scheduler.scheduleEvery4Hours();
```
- 0시, 4시, 8시, 12시, 16시, 20시

### 옵션 3: 1분마다 (테스트용)
```typescript
scheduler.scheduleEveryMinute();
```
- 테스트할 때만 사용

---

## 📂 코드 위치

### 스케줄러 설정
`backend/src/domain/crawling/index.ts` - 26~37번 라인

```typescript
// 환경변수로 스케줄러 제어
const enableScheduler = process.env.ENABLE_CRAWLER_SCHEDULER === 'true';

if (enableScheduler) {
  scheduler.scheduleDailyCrawling(); // 매일 자정
  scheduler.startAll();
  console.log('✅ 크롤링 스케줄러 활성화 (매일 자정)');
} else {
  console.log('⏸️  크롤링 스케줄러 비활성화 (ENABLE_CRAWLER_SCHEDULER=true로 활성화)');
}
```

### 스케줄러 클래스
`backend/src/domain/crawling/scheduler/crawling.scheduler.ts`

---

## 🧪 테스트 방법

### 1️⃣ 로컬에서 테스트 (비활성화 상태)

```bash
# 현재 상태 확인
docker-compose up -d
docker-compose logs backend | grep "스케줄러"

# 결과: "비활성화" 메시지
```

### 2️⃣ 활성화 테스트

```bash
# docker-compose.yml 수정
# ENABLE_CRAWLER_SCHEDULER: "true" 추가

# 재빌드
docker-compose down
docker-compose up -d --build

# 로그 확인
docker-compose logs -f backend | grep "스케줄"

# 결과: "활성화" 메시지
```

### 3️⃣ 1분마다 테스트 (코드 수정 필요)

`backend/src/domain/crawling/index.ts` 32번 라인 수정:

```typescript
scheduler.scheduleEveryMinute(); // 테스트용
```

재빌드 후 1분 기다리면 크롤링 시작!

---

## 🚀 배포 가이드

### 클라우드 서버에 배포할 때

1. **환경변수 설정**
   ```env
   ENABLE_CRAWLER_SCHEDULER=true
   ```

2. **Railway, Render, AWS 등에서**
   - 환경변수에 `ENABLE_CRAWLER_SCHEDULER=true` 추가
   - Docker 컨테이너 24시간 실행
   - 로그 모니터링 설정

3. **매일 자정에 자동 크롤링 실행**

---

## ⚠️ 주의사항

### 1. 로컬 개발 시
- **스케줄러 비활성화** (기본값)
- 수동으로 크롤링: `POST /api/crawling/trigger`

### 2. 서버 배포 시
- **스케줄러 활성화** (`ENABLE_CRAWLER_SCHEDULER=true`)
- 24시간 실행 필요
- 클라우드 서버 필수

### 3. 테스트 시
- 1분마다 스케줄 사용
- 테스트 후 다시 매일 자정으로 변경

---

## 📊 현재 상태 확인

```bash
# 스케줄러 상태 확인
docker-compose logs backend | grep -A 5 "스케줄러"

# 비활성화 상태 (기본)
⏸️  크롤링 스케줄러 비활성화 (ENABLE_CRAWLER_SCHEDULER=true로 활성화)

# 활성화 상태
✅ 크롤링 스케줄러 등록: 매일 자정 (Asia/Seoul)
🚀 1개 크롤링 스케줄러 시작!
✅ 크롤링 스케줄러 활성화 (매일 자정)
```

---

## 🎯 요약

| 항목 | 현재 상태 |
|------|-----------|
| 스케줄러 코드 | ✅ 완성 |
| 기본 상태 | ⏸️  비활성화 |
| 활성화 방법 | 환경변수 설정 |
| 컴퓨터 꺼도 작동? | ❌ 아니요 |
| 클라우드 서버 필요? | ✅ 네 (활성화 시) |

**지금은 코드만 있고 실행되지 않습니다!** ✅

