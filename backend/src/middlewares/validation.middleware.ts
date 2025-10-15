/**
 * 입력 검증 미들웨어 (보안 강화)
 */

import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';

/**
 * 검증 결과 확인 미들웨어
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: '입력값이 유효하지 않습니다',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? (err as any).path : 'unknown',
        message: err.msg,
      })),
    });
    return;
  }
  next();
};

/**
 * 검색 요청 검증
 */
export const validateSearchRequest = [
  body('query')
    .trim()
    .notEmpty().withMessage('검색어를 입력해주세요')
    .isLength({ min: 1, max: 100 }).withMessage('검색어는 1-100자 사이여야 합니다')
    .matches(/^[가-힣a-zA-Z0-9\s\-_]+$/).withMessage('검색어에 특수문자는 사용할 수 없습니다'),
  
  body('filters.priceRange.min')
    .optional()
    .isInt({ min: 0, max: 100000000 }).withMessage('최저가는 0-100,000,000 사이여야 합니다'),
  
  body('filters.priceRange.max')
    .optional()
    .isInt({ min: 0, max: 100000000 }).withMessage('최고가는 0-100,000,000 사이여야 합니다'),
  
  body('filters.locations')
    .optional()
    .isArray().withMessage('지역은 배열 형식이어야 합니다'),
  
  body('filters.locations.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('지역명은 1-50자 사이여야 합니다'),
  
  validateRequest,
];

/**
 * AI 분석 요청 검증
 */
export const validateAIRequest = [
  body('query')
    .trim()
    .notEmpty().withMessage('검색어를 입력해주세요')
    .isLength({ min: 1, max: 100 }).withMessage('검색어는 1-100자 사이여야 합니다'),
  
  body('products')
    .isArray({ min: 1, max: 100 }).withMessage('상품은 1-100개 사이여야 합니다'),
  
  body('maxResults')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('최대 결과는 1-50 사이여야 합니다'),
  
  validateRequest,
];

/**
 * 크롤링 파라미터 검증 (쿼리 스트링)
 */
export const validateCrawlingParams = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit은 1-100 사이여야 합니다'),
  
  validateRequest,
];

/**
 * XSS 방어 - HTML 태그 제거
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // HTML 태그 제거
      return value.replace(/<[^>]*>/g, '');
    }
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        value[key] = sanitizeValue(value[key]);
      }
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  
  next();
};

/**
 * SQL Injection 방어 - 위험한 문자 확인
 */
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  const dangerousPatterns = [
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(;.*--)/,
    /('.*OR.*'.*=.*')/i,
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return dangerousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkValue(value[key])) {
          return true;
        }
      }
    }
    return false;
  };

  const hasDangerousInput = 
    checkValue(req.body) || 
    checkValue(req.query) || 
    checkValue(req.params);

  if (hasDangerousInput) {
    res.status(400).json({
      success: false,
      message: '잘못된 입력값이 감지되었습니다',
    });
    return;
  }

  next();
};

