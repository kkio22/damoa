/**
 * 지역(동) 정보 컨트롤러
 * 지역 수동 등록 및 관리
 */

import { Request, Response } from 'express';
import { AreaService } from '../service/area.service';
import { Area } from '../repository/area.repository';

export class AreaController {
  private areaService: AreaService;

  constructor(areaService: AreaService) {
    this.areaService = areaService;
  }

  /**
   * 지역 추가 (POST /api/areas)
   * Body: { "id": "6035", "name": "역삼동" }
   */
  addArea = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, name } = req.body as Area;

      if (!id || !name) {
        res.status(400).json({
          success: false,
          message: 'id와 name이 필요합니다',
        });
        return;
      }

      await this.areaService.addArea({ id, name });

      res.status(201).json({
        success: true,
        message: `${name} 지역이 추가되었습니다`,
      });

    } catch (error) {
      console.error('❌ 지역 추가 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  };

  /**
   * 여러 지역 일괄 추가 (POST /api/areas/bulk)
   * Body: { "areas": [{ "id": "6035", "name": "역삼동" }, ...] }
   */
  addAreas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { areas } = req.body;

      if (!areas || !Array.isArray(areas)) {
        res.status(400).json({
          success: false,
          message: 'areas 배열이 필요합니다',
        });
        return;
      }

      const result = await this.areaService.addAreas(areas);

      res.status(201).json({
        success: true,
        ...result,
        message: `${result.inserted}개 지역이 추가되었습니다`,
      });

    } catch (error) {
      console.error('❌ 일괄 추가 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  };

  /**
   * 전체 지역 조회 (GET /api/areas)
   */
  getAllAreas = async (req: Request, res: Response): Promise<void> => {
    try {
      const areas = await this.areaService.getAllAreas();

      res.status(200).json({
        success: true,
        totalCount: areas.length,
        areas,
      });

    } catch (error) {
      console.error('❌ 지역 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  };

  /**
   * 지역 통계 (GET /api/areas/stats)
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.areaService.getStats();

      res.status(200).json({
        success: true,
        stats,
      });

    } catch (error) {
      console.error('❌ 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  };

  /**
   * 지역 삭제 (DELETE /api/areas/:id)
   */
  deleteArea = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deleted = await this.areaService.deleteArea(id);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: '지역이 삭제되었습니다',
        });
      } else {
        res.status(404).json({
          success: false,
          message: '지역을 찾을 수 없습니다',
        });
      }

    } catch (error) {
      console.error('❌ 지역 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  };
}

