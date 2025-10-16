/**
 * 인증/사용자 관련 타입 정의
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: UserResponse;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: UserResponse;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Express Request 확장
 * JWT 인증 후 req.user에 사용자 정보 저장
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

