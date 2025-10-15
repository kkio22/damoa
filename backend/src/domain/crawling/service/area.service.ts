/**
 * 지역(동) 관리 서비스
 * 지역 정보를 수동으로 등록/관리
 */

import { AreaRepository, Area } from '../repository/area.repository';

export class AreaService {
  private areaRepo: AreaRepository;

  constructor(areaRepo: AreaRepository) {
    this.areaRepo = areaRepo;
  }

  /**
   * 지역 추가
   */
  async addArea(area: Area): Promise<void> {
    return await this.areaRepo.insert(area);
  }

  /**
   * 여러 지역 일괄 추가
   */
  async addAreas(areas: Area[]): Promise<{ total: number; inserted: number }> {
    const inserted = await this.areaRepo.bulkInsert(areas);
    return {
      total: areas.length,
      inserted,
    };
  }

  /**
   * 전체 지역 조회
   */
  async getAllAreas(): Promise<Area[]> {
    return await this.areaRepo.getAll();
  }

  /**
   * 지역 통계
   */
  async getStats(): Promise<{ totalAreas: number }> {
    const count = await this.areaRepo.count();
    return {
      totalAreas: count,
    };
  }

  /**
   * 지역 삭제
   */
  async deleteArea(id: string): Promise<boolean> {
    return await this.areaRepo.deleteById(id);
  }

  /**
   * 전체 삭제
   */
  async deleteAll(): Promise<number> {
    return await this.areaRepo.deleteAll();
  }
}

