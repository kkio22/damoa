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
      res.status(200).json(result);
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
   * POST /api/auth/logout
   * 로그아웃 (프론트에서 토큰 삭제)
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    // JWT는 stateless이므로 서버에서 특별히 할 일 없음
    // 프론트엔드에서 토큰을 삭제하면 됨
    res.status(200).json({
      success: true,
      message: '로그아웃 되었습니다',
    });
  };
}

