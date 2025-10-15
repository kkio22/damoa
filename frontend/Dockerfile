# 프론트엔드 Dockerfile
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (package-lock.json 없어도 작동)
RUN npm install

# 소스 코드 복사
COPY . .

# 환경변수 설정 (빌드 시)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 프로덕션 빌드
RUN npm run build

# Nginx를 사용한 프로덕션 이미지
FROM nginx:alpine

# 빌드된 파일 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]

