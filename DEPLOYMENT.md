# 🚀 SmartTrade GCP 배포 가이드

Compute Engine + Docker Compose를 사용한 배포 방법입니다.

## 💰 예상 비용 (무료 크레딧 사용)
- **e2-small VM**: 월 $15
- **스토리지 20GB**: 월 $2
- **총**: 월 $17 → **$300 크레딧으로 17개월 사용 가능!** ✅

---

## 📋 1단계: VM 생성

터미널에서 다음 명령어를 실행하세요:

```bash
cd scripts
chmod +x create-vm.sh
./create-vm.sh
```

이 스크립트는 자동으로:
- ✅ VM 인스턴스 생성 (e2-small)
- ✅ 방화벽 규칙 설정 (포트 80, 8080)
- ✅ Docker & Docker Compose 설치

완료되면 **VM 외부 IP**와 **GitHub Secrets 값**이 출력됩니다!

---

## 🔐 2단계: GitHub Secrets 설정

`https://github.com/kkio22/usedTrade/settings/secrets/actions` 에서 다음 값들을 추가하세요:

### 필수 Secrets

```
GCP_PROJECT_ID=carbide-sensor-475207-a2

GCP_SA_KEY=
(서비스 계정 키 JSON 전체)

VM_INSTANCE_NAME=smarttrade-server

VM_ZONE=asia-northeast3-a

DB_PASSWORD=
(강력한 비밀번호 설정 - 예: MySecurePass123!)
```

### 선택적 Secrets

```
OPENAI_API_KEY=sk-...
(AI 기능 사용 시 필요, 없으면 기본 추천만 동작)
```

---

## 🎯 3단계: 배포

이제 코드를 main 브랜치에 push하면 **자동으로 배포됩니다!**

```bash
git add .
git commit -m "feat: Compute Engine 배포 설정 완료"
git push origin main
```

GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다:
`https://github.com/kkio22/usedTrade/actions`

---

## 🌐 4단계: 접속 확인

배포가 완료되면 (약 5분 소요):

- **Frontend**: `http://<VM_IP>`
- **Backend API**: `http://<VM_IP>:8080`
- **Health Check**: `http://<VM_IP>:8080/health`

---

## 🔧 수동 배포 (필요 시)

VM에 SSH로 접속하여 수동 배포:

```bash
# VM 접속
gcloud compute ssh smarttrade-server \
  --zone=asia-northeast3-a \
  --project=carbide-sensor-475207-a2

# 코드 업데이트
cd ~/usedTrade
git pull origin main

# 환경 변수 설정
cat > .env << EOF
NODE_ENV=production
DB_PASSWORD=<비밀번호>
OPENAI_API_KEY=<선택사항>
ENABLE_CRAWLER_SCHEDULER=true
REACT_APP_API_URL=http://$(curl -s ifconfig.me):8080
EOF

# Docker Compose 재시작
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 상태 확인
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 📊 모니터링

### 컨테이너 상태 확인
```bash
gcloud compute ssh smarttrade-server --zone=asia-northeast3-a
docker ps
```

### 로그 확인
```bash
# 전체 로그
docker-compose -f docker-compose.prod.yml logs

# Backend 로그만
docker-compose -f docker-compose.prod.yml logs backend

# 실시간 로그
docker-compose -f docker-compose.prod.yml logs -f
```

### 리소스 사용량
```bash
docker stats
```

---

## 🛠️ 트러블슈팅

### 1. 배포 실패 시
```bash
# VM 상태 확인
gcloud compute instances list

# SSH 접속 테스트
gcloud compute ssh smarttrade-server --zone=asia-northeast3-a
```

### 2. 서비스가 안 뜰 때
```bash
# VM에 접속하여 확인
cd ~/usedTrade
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs backend
```

### 3. 방화벽 문제
```bash
# 방화벽 규칙 확인
gcloud compute firewall-rules list

# 포트 80, 8080이 열려있는지 확인
```

---

## 💡 유용한 명령어

```bash
# VM 중지 (과금 중지)
gcloud compute instances stop smarttrade-server --zone=asia-northeast3-a

# VM 시작
gcloud compute instances start smarttrade-server --zone=asia-northeast3-a

# VM 삭제 (완전 제거)
gcloud compute instances delete smarttrade-server --zone=asia-northeast3-a

# 비용 확인
gcloud billing accounts list
```

---

## 🎉 배포 완료!

축하합니다! SmartTrade가 성공적으로 배포되었습니다! 🚀

문제가 있으면 GitHub Issues에 남겨주세요.

