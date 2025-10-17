/**
 * 즐겨찾기 Routes
 */

import { Router } from 'express';
import { FavoriteController } from '../controller/favorite.controller';
import { authenticateJWT, optionalAuthenticateJWT } from '../../../middlewares/auth.middleware';

export class FavoriteRoutes {
  public router: Router;

  constructor(private controller: FavoriteController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // 즐겨찾기 추가 (인증 필요)
    this.router.post('/', authenticateJWT, this.controller.addFavorite);

    // 즐겨찾기 삭제 (인증 필요)
    this.router.delete('/:productId', authenticateJWT, this.controller.deleteFavorite);

    // 즐겨찾기 목록 조회 (인증 필요)
    this.router.get('/', authenticateJWT, this.controller.getFavorites);

    // 상품의 즐겨찾기 수 조회 (인증 선택)
    this.router.get('/count/:productId', this.controller.getFavoriteCount);

    // 여러 상품의 즐겨찾기 수 일괄 조회 (인증 선택)
    this.router.post('/counts', this.controller.getFavoriteCounts);

    // 즐겨찾기 여부 확인 (인증 선택)
    this.router.get('/check/:productId', optionalAuthenticateJWT, this.controller.checkFavorite);
  }
}

