/**
 * 인증 라우트
 */

import { Router } from 'express';
import { AuthController } from '../controller/auth.controller';
import { authenticateJWT } from '../../../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

export class AuthRoutes {
  private router: Router;
  private controller: AuthController;

  constructor(controller: AuthController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Rate Limiting (로그인/회원가입 보호)
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 5, // 최대 5회 시도
      message: {
        success: false,
        message: '너무 많은 시도가 발생했습니다. 15분 후 다시 시도해주세요.',
      },
    });

    /**
     * POST /api/auth/register
     * 회원가입
     * Request Body:
     *   {
     *     "email": "user@example.com",
     *     "password": "Password1!",
     *     "passwordConfirm": "Password1!",
     *     "name": "홍길동",
     *     "phone": "01012345678"
     *   }
     * Response:
     *   {
     *     "success": true,
     *     "message": "회원가입이 완료되었습니다",
     *     "user": { id, email, name, phone, created_at }
     *   }
     */
    this.router.post('/register', authLimiter, this.controller.register);

    /**
     * POST /api/auth/login
     * 로그인
     * Request Body:
     *   {
     *     "email": "user@example.com",
     *     "password": "Password1!"
     *   }
     * Response:
     *   {
     *     "success": true,
     *     "message": "로그인 성공",
     *     "user": { id, email, name, phone, created_at },
     *     "tokens": { "accessToken": "JWT_TOKEN" }
     *   }
     */
    this.router.post('/login', authLimiter, this.controller.login);

    /**
     * GET /api/auth/me
     * 내 정보 조회 (인증 필요)
     * Headers: Authorization: Bearer <JWT_TOKEN>
     * Response:
     *   {
     *     "success": true,
     *     "user": { id, email, name, phone, created_at }
     *   }
     */
    this.router.get('/me', authenticateJWT, this.controller.getMe);

    /**
     * POST /api/auth/refresh
     * Access Token 갱신 (Refresh Token 사용)
     * Cookies: refreshToken (HTTP-only)
     * Response:
     *   {
     *     "success": true,
     *     "message": "Access Token이 갱신되었습니다"
     *   }
     */
    this.router.post('/refresh', this.controller.refresh);

    /**
     * POST /api/auth/logout
     * 로그아웃 (쿠키 삭제)
     * Response:
     *   {
     *     "success": true,
     *     "message": "로그아웃 되었습니다"
     *   }
     */
    this.router.post('/logout', this.controller.logout);
  }

  getRouter(): Router {
    return this.router;
  }
}

