#!/bin/bash
# GCP Compute Engine VM 생성 및 초기 설정 스크립트

set -e

PROJECT_ID="carbide-sensor-475207-a2"
REGION="asia-northeast3"
ZONE="asia-northeast3-a"
VM_NAME="smarttrade-server"
MACHINE_TYPE="e2-small"  # 2GB RAM, 2 vCPU (월 $15)
# MACHINE_TYPE="e2-micro"  # 0.5GB RAM (월 $7, 더 저렴하지만 메모리 부족 가능)

echo "🚀 SmartTrade VM 생성 중..."
echo "📍 프로젝트: $PROJECT_ID"
echo "📍 리전: $REGION"
echo "📍 VM 이름: $VM_NAME"
echo "📍 머신 타입: $MACHINE_TYPE"

# 1. VM 인스턴스 생성
gcloud compute instances create $VM_NAME \
  --project=$PROJECT_ID \
  --zone=$ZONE \
  --machine-type=$MACHINE_TYPE \
  --network-interface=network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default \
  --maintenance-policy=MIGRATE \
  --provisioning-model=STANDARD \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --tags=http-server,https-server \
  --create-disk=auto-delete=yes,boot=yes,device-name=$VM_NAME,image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20241004,mode=rw,size=20,type=projects/$PROJECT_ID/zones/$ZONE/diskTypes/pd-balanced \
  --no-shielded-secure-boot \
  --shielded-vtpm \
  --shielded-integrity-monitoring \
  --labels=app=smarttrade,env=production \
  --reservation-affinity=any

echo "✅ VM 생성 완료!"

# 2. 방화벽 규칙 생성 (HTTP/HTTPS)
echo "🔥 방화벽 규칙 생성 중..."

gcloud compute firewall-rules create allow-http-smarttrade \
  --project=$PROJECT_ID \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server \
  --description="Allow HTTP traffic for SmartTrade frontend" \
  || echo "방화벽 규칙이 이미 존재합니다"

gcloud compute firewall-rules create allow-backend-smarttrade \
  --project=$PROJECT_ID \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:8080 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server \
  --description="Allow backend API traffic for SmartTrade" \
  || echo "방화벽 규칙이 이미 존재합니다"

echo "✅ 방화벽 규칙 설정 완료!"

# 3. VM에 Docker 설치
echo "🐳 VM에 Docker 설치 중..."

gcloud compute ssh $VM_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --command="
    set -e
    echo '📦 시스템 업데이트...'
    sudo apt-get update
    
    echo '🐳 Docker 설치...'
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    echo '👤 Docker 권한 설정...'
    sudo usermod -aG docker \$USER
    
    echo '✅ Docker 설치 완료!'
    docker --version
    docker compose version
  "

# 4. VM 외부 IP 출력
echo ""
echo "🎉 VM 생성 및 설정 완료!"
echo ""
VM_IP=$(gcloud compute instances describe $VM_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "======================================"
echo "📌 VM 정보"
echo "======================================"
echo "VM 이름: $VM_NAME"
echo "Zone: $ZONE"
echo "외부 IP: $VM_IP"
echo ""
echo "🌐 서비스 URL (배포 후):"
echo "  - Frontend: http://$VM_IP"
echo "  - Backend:  http://$VM_IP:8080"
echo ""
echo "======================================"
echo "📝 GitHub Secrets에 추가할 값:"
echo "======================================"
echo "VM_INSTANCE_NAME=$VM_NAME"
echo "VM_ZONE=$ZONE"
echo "DB_PASSWORD=<강력한_비밀번호>"
echo "OPENAI_API_KEY=<선택사항>"
echo ""
echo "======================================"
echo "🚀 다음 단계:"
echo "======================================"
echo "1. GitHub Repository Settings > Secrets 에서 위 값들 추가"
echo "2. 코드를 main 브랜치에 push하면 자동 배포됩니다"
echo "3. 배포 확인: http://$VM_IP"
echo ""

