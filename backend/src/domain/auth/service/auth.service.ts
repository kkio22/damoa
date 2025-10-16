/**
 * 인증 Service
 * 회원가입, 로그인, JWT 발급 등 비즈니스 로직
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repository/user.repository';
import { RefreshTokenRepository } from '../repository/refresh-token.repository';
import {
  UserCreateRequest,
  UserLoginRequest,
  LoginResponse,
  RegisterResponse,
  JwtPayload,
  UserResponse,
} from '../types';

export class AuthService {
  private userRepo: UserRepository;
  private refreshTokenRepo: RefreshTokenRepository;
  private jwtSecret: string;
  private accessTokenExpiresIn: string;
  private refreshTokenExpiresIn: string;

  constructor(userRepo: UserRepository, refreshTokenRepo: RefreshTokenRepository) {
    this.userRepo = userRepo;
    this.refreshTokenRepo = refreshTokenRepo;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.accessTokenExpiresIn = '15m'; // Access Token: 15분
    this.refreshTokenExpiresIn = '30d'; // Refresh Token: 30일
  }

  /**
   * 회원가입
   */
  async register(request: UserCreateRequest): Promise<RegisterResponse> {
    // 1. 유효성 검사
    this.validateRegisterInput(request);

    // 2. 이메일 중복 체크
    const existingUser = await this.userRepo.findByEmail(request.email);
    if (existingUser) {
      throw new Error('이미 사용 중인 이메일입니다');
    }

    // 3. 비밀번호 해싱 (bcrypt, salt rounds: 12)
    const passwordHash = await bcrypt.hash(request.password, 12);

    // 4. 사용자 생성
    const user = await this.userRepo.create(
      request.email,
      passwordHash,
      request.name,
      request.phone
    );

    console.log(`✅ 회원가입 성공: ${user.email}`);

    return {
      success: true,
      message: '회원가입이 완료되었습니다',
      user,
    };
  }

  /**
   * 로그인
   */
  async login(request: UserLoginRequest): Promise<LoginResponse> {
    // 1. 이메일로 사용자 찾기
    const user = await this.userRepo.findByEmail(request.email);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(request.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다');
    }

    // 3. JWT Access Token 생성 (15분)
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload as object, this.jwtSecret, {
      expiresIn: this.accessTokenExpiresIn, // 15분
    } as jwt.SignOptions);

    // 4. Refresh Token 생성 (30일)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30); // 30일 후

    // 5. Refresh Token DB에 저장
    await this.refreshTokenRepo.create(user.id, refreshToken, refreshTokenExpiresAt);

    // 6. 사용자 정보 반환 (비밀번호 제외)
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      created_at: user.created_at,
    };

    console.log(`✅ 로그인 성공: ${user.email}`);

    return {
      success: true,
      message: '로그인 성공',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * JWT 토큰 검증
   */
  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다');
    }
  }

  /**
   * Refresh Token으로 새 Access Token 발급
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Refresh Token 검증
    const storedToken = await this.refreshTokenRepo.findByToken(refreshToken);
    
    if (!storedToken) {
      throw new Error('유효하지 않은 Refresh Token입니다');
    }

    // 2. 만료 확인
    if (new Date(storedToken.expires_at) < new Date()) {
      await this.refreshTokenRepo.revoke(refreshToken);
      throw new Error('Refresh Token이 만료되었습니다');
    }

    // 3. 사용자 확인
    const user = await this.userRepo.findById(storedToken.user_id);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    // 4. 새 Access Token 생성 (15분)
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    const newAccessToken = jwt.sign(payload as object, this.jwtSecret, {
      expiresIn: this.accessTokenExpiresIn,
    } as jwt.SignOptions);

    // 5. 새 Refresh Token 생성 (Refresh Token Rotation)
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenExpiresAt = new Date();
    newRefreshTokenExpiresAt.setDate(newRefreshTokenExpiresAt.getDate() + 30);

    // 6. 이전 Refresh Token 폐기 및 새 토큰 저장
    await this.refreshTokenRepo.revoke(refreshToken, newRefreshToken);
    await this.refreshTokenRepo.create(user.id, newRefreshToken, newRefreshTokenExpiresAt);

    console.log(`✅ Access Token 갱신 성공: ${user.email}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * 사용자 정보 조회 (인증 필요)
   */
  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      created_at: user.created_at,
    };
  }

  /**
   * 회원가입 입력 유효성 검사
   */
  private validateRegisterInput(request: UserCreateRequest): void {
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('올바른 이메일 형식이 아닙니다');
    }

    // 비밀번호 규칙: 8글자 이상, 영문, 특수문자 1개 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(request.password)) {
      throw new Error('비밀번호는 8글자 이상, 영문, 특수문자 1개 이상 포함해야 합니다');
    }

    // 비밀번호 확인 일치 검사
    if (request.password !== request.passwordConfirm) {
      throw new Error('비밀번호가 일치하지 않습니다');
    }

    // 이름 검사 (2글자 이상)
    if (!request.name || request.name.trim().length < 2) {
      throw new Error('이름은 2글자 이상 입력해주세요');
    }

    // 전화번호 검사 (10-11자리 숫자)
    const phoneRegex = /^010\d{7,8}$/;
    const phoneOnly = request.phone.replace(/[^0-9]/g, '');
    if (!phoneRegex.test(phoneOnly)) {
      throw new Error('올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)');
    }
  }
}

