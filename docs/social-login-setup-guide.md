# 소셜 로그인 Provider 설정 가이드

이 가이드는 SmartOCR Pro에서 소셜 로그인을 실제로 설정하는 방법을 안내합니다.

## 🔧 설정이 필요한 Provider들

1. **Google OAuth**
2. **GitHub OAuth**  
3. **Facebook OAuth**
4. **Apple Sign In**

---

## 1. 🟦 Google OAuth 설정

### 1.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "OAuth 동의 화면" 이동
4. 외부 사용자 선택하고 애플리케이션 정보 입력:
   - 앱 이름: `SmartOCR Pro`
   - 사용자 지원 이메일: 본인 이메일
   - 앱 도메인: 
     - 홈페이지: `http://localhost:3000` (개발용)
     - 개인정보처리방침: `http://localhost:3000/privacy`
     - 서비스 약관: `http://localhost:3000/terms`

### 1.2 OAuth 클라이언트 ID 생성

1. "API 및 서비스" → "사용자 인증 정보" 이동
2. "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
3. 애플리케이션 유형: 웹 애플리케이션
4. 승인된 JavaScript 원본:
   ```
   http://localhost:3000
   ```
5. 승인된 리디렉션 URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

### 1.3 환경변수 설정

```bash
# frontend/.env.local
AUTH_GOOGLE_ID=your_google_client_id_here
AUTH_GOOGLE_SECRET=your_google_client_secret_here
```

---

## 2. 🐙 GitHub OAuth 설정

### 2.1 GitHub OAuth App 생성

1. GitHub → Settings → Developer settings → OAuth Apps
2. "New OAuth App" 클릭
3. 애플리케이션 정보 입력:
   - Application name: `SmartOCR Pro`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 2.2 환경변수 설정

```bash
# frontend/.env.local
AUTH_GITHUB_ID=your_github_client_id_here
AUTH_GITHUB_SECRET=your_github_client_secret_here
```

---

## 3. 🟦 Facebook OAuth 설정

### 3.1 Facebook for Developers 설정

1. [Facebook for Developers](https://developers.facebook.com/) 접속
2. "내 앱" → "앱 만들기"
3. 사용 사례: "사용자 인증"
4. 앱 유형: "없음"
5. 기본 설정에서 앱 정보 입력

### 3.2 Facebook 로그인 제품 추가

1. 대시보드에서 "Facebook 로그인" 제품 추가
2. 설정 → 기본 설정에서:
   - 유효한 OAuth 리디렉션 URI: `http://localhost:3000/api/auth/callback/facebook`
   - 웹 SDK 설정에서 앱 도메인: `localhost`

### 3.3 환경변수 설정

```bash
# frontend/.env.local
AUTH_FACEBOOK_ID=your_facebook_app_id_here
AUTH_FACEBOOK_SECRET=your_facebook_app_secret_here
```

---

## 4. 🍎 Apple Sign In 설정

### 4.1 Apple Developer Account 필요

⚠️ **주의**: Apple Sign In은 유료 Apple Developer Program 멤버십이 필요합니다.

### 4.2 Apple Developer Console 설정

1. [Apple Developer](https://developer.apple.com/) 접속
2. Certificates, Identifiers & Profiles → Keys
3. "+" 버튼으로 새 키 생성
4. Key Name: `SmartOCR SignIn Key`
5. "Sign in with Apple" 체크
6. 키 다운로드 (한 번만 가능!)

### 4.3 Service ID 생성

1. Identifiers → "+" → Service IDs
2. Description: `SmartOCR Pro Web`
3. Identifier: `com.smartocr.web`
4. "Sign in with Apple" 구성:
   - Primary App ID: 앞서 생성한 App ID
   - Domains: `localhost` (개발용)
   - Return URLs: `http://localhost:3000/api/auth/callback/apple`

### 4.4 환경변수 설정

```bash
# frontend/.env.local
AUTH_APPLE_ID=com.smartocr.web
AUTH_APPLE_TEAM_ID=your_team_id_here
AUTH_APPLE_KEY_ID=your_key_id_here
AUTH_APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_content_here
-----END PRIVATE KEY-----"
```

---

## 5. 🔐 최종 환경변수 파일

### frontend/.env.local 완성본

```bash
# NextAuth.js 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_nextauth_secret_here

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVER_URL=http://localhost:8000

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# GitHub OAuth
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Facebook OAuth
AUTH_FACEBOOK_ID=your_facebook_client_id
AUTH_FACEBOOK_SECRET=your_facebook_client_secret

# Apple OAuth (선택사항 - 유료 계정 필요)
AUTH_APPLE_ID=com.smartocr.web
AUTH_APPLE_TEAM_ID=your_apple_team_id
AUTH_APPLE_KEY_ID=your_apple_key_id
AUTH_APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_apple_private_key_here
-----END PRIVATE KEY-----"
```

---

## 6. 🧪 테스트 방법

### 6.1 개발 환경 테스트

1. 환경변수 설정 후 프론트엔드 재시작:
   ```bash
   ./deploy.sh frontend
   ```

2. 로그인 페이지 접속: `http://localhost:3000/login`

3. 각 소셜 로그인 버튼 테스트

### 6.2 로그 확인

```bash
# 프론트엔드 로그
./deploy.sh logs frontend

# 백엔드 로그
./deploy.sh logs backend
```

---

## 7. 🚨 주의사항

### 보안
- **절대로** 실제 프로덕션 키를 Git에 커밋하지 마세요
- `.env.local` 파일은 `.gitignore`에 포함되어 있는지 확인
- 프로덕션에서는 HTTPS 필수

### 도메인 설정
- 개발: `localhost:3000`
- 스테이징: `staging.smartocrpro.com`
- 프로덕션: `smartocrpro.com`

### 콜백 URL 패턴
모든 Provider의 콜백 URL은 다음 패턴을 따릅니다:
```
{NEXTAUTH_URL}/api/auth/callback/{provider}
```

---

## 8. 🔧 문제 해결

### Google OAuth 오류
- "redirect_uri_mismatch": 콜백 URL 확인
- "invalid_client": 클라이언트 ID/Secret 확인

### GitHub OAuth 오류
- "incorrect_client_credentials": 클라이언트 정보 확인
- "redirect_uri_mismatch": 콜백 URL 확인

### 일반적인 NextAuth.js 오류
- `NEXTAUTH_SECRET` 환경변수 설정 확인
- `NEXTAUTH_URL` 정확한 도메인 설정 확인

---

## 9. ✅ 완료 체크리스트

- [ ] Google OAuth 설정 완료
- [ ] GitHub OAuth 설정 완료  
- [ ] Facebook OAuth 설정 완료
- [ ] Apple Sign In 설정 완료 (선택사항)
- [ ] 환경변수 파일 설정
- [ ] 각 Provider 로그인 테스트
- [ ] 계정 연동 기능 테스트
- [ ] 보안 설정 확인

각 Provider 설정 완료 후 `fullstack_todolist.md`에서 해당 항목을 `[x]`로 체크하세요!