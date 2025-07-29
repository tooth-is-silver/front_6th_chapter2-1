import {
  PRODUCT_IDS,
  DISCOUNT_RATES,
  BULK_ITEM_COUNT,
} from "../constants/index.js";

// 상품별 할인율 계산
export function calculateProductDiscount(product, quantity) {
  if (quantity < BULK_ITEM_COUNT) return 0;

  switch (product.id) {
    case PRODUCT_IDS.KEYBOARD:
      return DISCOUNT_RATES.KEYBOARD;
    case PRODUCT_IDS.MOUSE:
      return DISCOUNT_RATES.MOUSE;
    case PRODUCT_IDS.MONITOR_ARM:
      return DISCOUNT_RATES.MONITOR_ARM;
    case PRODUCT_IDS.LAPTOP_POUCH:
      return DISCOUNT_RATES.LAPTOP_POUCH;
    case PRODUCT_IDS.SPEAKER:
      return DISCOUNT_RATES.SPEAKER;
    default:
      return 0;
  }
}

// 화요일 할인 계산
export function calculateTuesdayDiscount(totalAmount, isTuesday) {
  if (!isTuesday || totalAmount <= 0) return 0;
  return totalAmount * DISCOUNT_RATES.TUESDAY_DISCOUNT;
}

// 대량구매 할인 계산
export function calculateBulkDiscount(subtotal, totalQuantity) {
  if (totalQuantity >= 30) {
    return subtotal * DISCOUNT_RATES.BULK_DISCOUNT;
  }
  return 0;
}
