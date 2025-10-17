/**
 * Express 앱 설정
 * 크롤링 모듈 사용 예시
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { initCrawlingModule } from './domain/crawling';
import { initAuthModule } from './domain/auth';
import { sanitizeInput, preventSQLInjection } from './middlewares/validation.middleware';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
  }

  /**
   * 미들웨어 초기화
   */
  private initializeMiddlewares(): void {
    // 보안 헤더 설정 (Helmet)
    this.app.use(helmet());

    // CORS 설정 (HTTP-only Cookies 지원)
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || ['http://localhost', 'http://localhost:80'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true, // 쿠키 전송 허용 (중요!)
      maxAge: 86400, // 24시간
    };
    this.app.use(cors(corsOptions));

    // Cookie Parser (HTTP-only Cookies 파싱)
    this.app.use(cookieParser());

    // Body parser (크기 제한 추가)
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 입력 검증 미들웨어 (XSS, SQL Injection 방어)
    this.app.use(sanitizeInput);
    this.app.use(preventSQLInjection);

    // Rate Limiting (전역)
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // 최대 100 요청
      message: {
        success: false,
        message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(globalLimiter);

    // API Rate Limiting (더 제한적)
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 50, // 최대 50 요청
      message: {
        success: false,
        message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      },
    });
    this.app.use('/api/', apiLimiter);

    // 크롤링 Rate Limiting (매우 제한적)
    const crawlingLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1시간
      max: 5, // 최대 5 요청
      message: {
        success: false,
        message: '크롤링 요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요.',
      },
    });
    this.app.use('/api/crawling/trigger', crawlingLimiter);

    // 로깅 (개선 - 응답 시간 포함)
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }

  /**
   * 에러 핸들링 미들웨어 초기화 (라우트 등록 후)
   */
  private initializeErrorHandling(): void {
    // 404 핸들러
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });

    // 에러 핸들링 미들웨어
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err.stack);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        ...(process.env.NODE_ENV === 'development' && { error: err.message }),
      });
    });
  }

  /**
   * 라우트 초기화
   */
  public async initializeRoutes(): Promise<void> {
    // 크롤링 모듈 초기화
    const container = await initCrawlingModule();

    // Auth 모듈 초기화 (회원가입/로그인)
    const pgPool = container.getPostgresPool();
    const authContainer = await initAuthModule(pgPool);
    const authRoutes = authContainer.getRoutes();
    this.app.use('/api/auth', authRoutes.getRouter());

    // 크롤링 라우트 등록 (Postman 트리거용)
    const crawlingRoutes = container.getCrawlingRoutes();
    this.app.use('/api/crawling', crawlingRoutes.getRouter());

    // 지역 정보 라우트 등록
    const areaRoutes = container.getAreaRoutes();
    this.app.use('/api/areas', areaRoutes.getRouter());

    // 검색 라우트 등록 (todolist 2일차)
    const searchRoutes = container.getSearchRoutes();
    this.app.use('/api/search', searchRoutes.getRouter());

    // AI 라우트 등록 (todolist 3일차)
    const aiContainer = container.getAIContainer();
    const aiRoutes = aiContainer.getRoutes();
    this.app.use('/api/ai', aiRoutes.getRouter());

    // 시스템 상태 라우트 등록 (todolist 3일차)
    const systemContainer = container.getSystemContainer();
    const systemRoutes = systemContainer.getRoutes();
    this.app.use('/api/system', systemRoutes.getRouter());

    // 즐겨찾기 라우트 등록
    const favoriteContainer = container.getFavoriteContainer();
    const favoriteRoutes = favoriteContainer.getRoutes();
    this.app.use('/api/favorites', favoriteRoutes.router);

    // 루트 경로
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Damoa API Server',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          auth: '/api/auth',
          areas: '/api/areas',
          crawling: '/api/crawling',
          search: '/api/search',
          ai: '/api/ai',
          system: '/api/system',
        },
      });
    });

    // 헬스체크
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      });
    });

    // 에러 핸들링 초기화 (라우트 등록 후)
    this.initializeErrorHandling();

    console.log('✅ 라우트 초기화 완료');
  }

  /**
   * 서버 시작
   */
  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`
🚀 Server is running!
📡 Port: ${port}
🌐 URL: http://localhost:${port}
📊 Health: http://localhost:${port}/health
🔐 Auth API: http://localhost:${port}/api/auth
🕷️  Crawling API: http://localhost:${port}/api/crawling
🔍 Search API: http://localhost:${port}/api/search
🤖 AI Analysis API: http://localhost:${port}/api/ai
📈 System Status API: http://localhost:${port}/api/system
      `);
    });
  }
}

export default App;

