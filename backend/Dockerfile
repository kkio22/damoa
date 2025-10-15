# 백엔드 Dockerfile
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (빌드를 위해 devDependencies도 설치)
RUN npm install

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 프로덕션 의존성만 재설치
RUN npm install --only=production

# 프로덕션 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 파일과 node_modules 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# scripts 폴더 복사 (마이그레이션용)
COPY --from=builder /app/scripts ./scripts

# 포트 노출
EXPOSE 3000

# 서버 시작
CMD ["node", "dist/server.js"]

