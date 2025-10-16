/**
 * 인증 Controller
 * HTTP 요청/응답 처리
 */

import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { UserCreateRequest, UserLoginRequest } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * POST /api/auth/register
   * 회원가입
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: UserCreateRequest = req.body;
      
      // 필수 필드 체크
      if (!request.email || !request.password || !request.passwordConfirm || !request.name || !request.phone) {
        res.status(400).json({
          success: false,
          message: '모든 필드를 입력해주세요',
        });
        return;
      }

      const result = await this.authService.register(request);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || '회원가입 중 오류가 발생했습니다',
      });
    }
  };

  /**
   * POST /api/auth/login
   * 로그인
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const request: UserLoginRequest = req.body;
      
      // 필수 필드 체크
      if (!request.email || !request.password) {
        res.status(400).json({
          success: false,
          message: '이메일과 비밀번호를 입력해주세요',
        });
        return;
      }

      const result = await this.authService.login(request);
      
      // Access Token을 HTTP-only 쿠키로 설정 (15분)
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15분
        path: '/',
      });

      // Refresh Token을 HTTP-only 쿠키로 설정 (30일)
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
        path: '/',
      });

      // 토큰은 쿠키로 전송하므로 응답 body에서는 제외
      res.status(200).json({
        success: result.success,
        message: result.message,
        user: result.user,
      });
    } catch (error: any) {
      console.error('❌ 로그인 실패:', error.message);
      res.status(401).json({
        success: false,
        message: error.message || '로그인 중 오류가 발생했습니다',
      });
    }
  };

  /**
   * GET /api/auth/me
   * 내 정보 조회 (인증 필요)
   */
  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      // JWT 미들웨어에서 req.user 설정됨
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다',
        });
        return;
      }

      const user = await this.authService.getMe(req.user.userId);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      console.error('❌ 사용자 정보 조회 실패:', error.message);
      res.status(404).json({
        success: false,
        message: error.message || '사용자 정보 조회 중 오류가 발생했습니다',
      });
    }
  };

  /**
   * POST /api/auth/refresh
   * Access Token 갱신 (Refresh Token 사용)
   */
  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh Token이 없습니다',
        });
        return;
      }

      const result = await this.authService.refreshAccessToken(refreshToken);

      // 새 Access Token을 쿠키로 설정 (15분)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15분
        path: '/',
      });

      // 새 Refresh Token을 쿠키로 설정 (30일)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'Access Token이 갱신되었습니다',
      });
    } catch (error: any) {
      console.error('❌ Token 갱신 실패:', error.message);
      res.status(401).json({
        success: false,
        message: error.message || 'Token 갱신 중 오류가 발생했습니다',
      });
    }
  };

  /**
   * POST /api/auth/logout
   * 로그아웃 (쿠키 삭제)
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    // Access Token 쿠키 삭제
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Refresh Token 쿠키 삭제
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: '로그아웃 되었습니다',
    });
  };
}

