/**
 * 비즈니스 로직 관련 상수들
 * 할인율, 임계값, 포인트 시스템 등의 핵심 비즈니스 규칙
 */

// 할인 시스템 상수
export const DISCOUNT_THRESHOLDS = {
  /** 개별 상품 할인 적용 임계값 */
  INDIVIDUAL_DISCOUNT: 10,
  /** 대량구매 할인 적용 임계값 */
  BULK_DISCOUNT: 30,
} as const;

export const DISCOUNT_RATES = {
  // 개별 상품 할인율 (10개 이상)
  INDIVIDUAL: {
    KEYBOARD: 0.1,    // 10%
    MOUSE: 0.15,      // 15%
    MONITOR_ARM: 0.2, // 20%
    SPEAKER: 0.25,    // 25%
  },
  
  // 대량구매 할인율 (30개 이상)
  BULK: 0.25,         // 25%
  
  // 특별 할인
  TUESDAY: 0.1,       // 10% 추가 할인
  LIGHTNING_SALE: 0.2, // 20% 번개세일
  SUGGEST_SALE: 0.05,  // 5% 추천할인
  SUPER_SALE: 0.25,    // 25% 슈퍼세일 (번개+추천 중복)
} as const;

// 포인트 시스템 상수
export const POINTS_SYSTEM = {
  /** 기본 적립률 */
  BASE_RATE: 0.001,  // 0.1%
  
  /** 화요일 포인트 배수 */
  TUESDAY_MULTIPLIER: 2,
  
  /** 콤보 보너스 포인트 */
  COMBO_BONUS: {
    KEYBOARD_MOUSE: 50,  // 키보드+마우스 조합
    FULL_SET: 100,       // 전체 상품 조합
  },
  
  /** 수량별 보너스 포인트 */
  QUANTITY_BONUS: {
    TIER_1: { threshold: 10, points: 20 },
    TIER_2: { threshold: 20, points: 50 },
    TIER_3: { threshold: 30, points: 100 },
  },
} as const;

// 재고 관리 상수
export const STOCK_THRESHOLDS = {
  /** 품절 상태 */
  OUT_OF_STOCK: 0,
  /** 재고 부족 경고 임계값 */
  LOW_STOCK: 5,
  /** 재고 경고 기본 임계값 */
  WARNING_THRESHOLD: 10,
} as const;

// 수량 조정 상수
export const QUANTITY_CHANGE = {
  DECREASE: -1,
  INCREASE: 1,
} as const;