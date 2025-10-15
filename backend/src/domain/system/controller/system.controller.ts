/**
 * 시스템 상태 컨트롤러 (todolist 3일차)
 */

import { Request, Response } from 'express';
import { SystemService } from '../service/system.service';

export class SystemController {
  private systemService: SystemService;

  constructor(systemService: SystemService) {
    this.systemService = systemService;
  }

  /**
   * GET /api/system/status
   * 전체 시스템 상태 조회
   */
  getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📊 시스템 상태 조회 요청');
      
      const status = await this.systemService.getSystemStatus();
      
      console.log('✅ 시스템 상태 조회 성공');
      res.status(200).json(status);

    } catch (error) {
      console.error('❌ 시스템 상태 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '시스템 상태 조회 실패',
      });
    }
  };

  /**
   * GET /api/system/health
   * 간단한 헬스체크 (빠른 응답)
   */
  getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
      });
    }
  };
}

