/**
 * JWT 인증 미들웨어
 * HTTP-only 쿠키에서 JWT 토큰 검증
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../domain/auth/types';

/**
 * JWT 인증 미들웨어
 * HTTP-only 쿠키에서 토큰 추출 및 검증
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 쿠키에서 토큰 추출
    const token = req.cookies?.accessToken;
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: '인증 토큰이 없습니다',
      });
      return;
    }
    
    // JWT 시크릿 키
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    // 토큰 검증
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // req.user에 사용자 정보 저장 (다음 미들웨어/컨트롤러에서 사용)
    req.user = decoded;
    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다',
      });
      return;
    }
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다',
      });
      return;
    }
    
    console.error('JWT 인증 오류:', error);
    res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다',
    });
  }
};

/**
 * 선택적 JWT 인증 미들웨어
 * 토큰이 있으면 검증하고, 없으면 그냥 통과
 */
export const optionalAuthenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.accessToken;
    
    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded;
    
    next();
  } catch (error) {
    // 토큰 검증 실패해도 계속 진행 (선택적 인증)
    next();
  }
};

