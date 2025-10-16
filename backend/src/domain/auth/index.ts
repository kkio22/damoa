/**
 * Auth 도메인 모듈 초기화
 */

import { Pool } from 'pg';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { AuthRoutes } from './routes/auth.routes';

export class AuthContainer {
  private userRepository: UserRepository;
  private authService: AuthService;
  private authController: AuthController;
  private authRoutes: AuthRoutes;

  constructor(pool: Pool) {
    this.userRepository = new UserRepository(pool);
    this.authService = new AuthService(this.userRepository);
    this.authController = new AuthController(this.authService);
    this.authRoutes = new AuthRoutes(this.authController);
  }

  getRoutes(): AuthRoutes {
    return this.authRoutes;
  }

  getController(): AuthController {
    return this.authController;
  }

  getService(): AuthService {
    return this.authService;
  }
}

/**
 * Auth 모듈 초기화 함수
 */
export async function initAuthModule(pool: Pool): Promise<AuthContainer> {
  console.log('🔐 Auth 모듈 초기화 중...');
  
  const container = new AuthContainer(pool);
  
  console.log('✅ Auth 모듈 초기화 완료');
  
  return container;
}

