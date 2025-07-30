export interface Product {
  id: string;
  name: string;
  value: number;
  originalValue: number;
  quantity: number;
  onSale: boolean;
  suggestSale: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  totalDiscountAmount: number;
  bonusPoints: number;
  lastSelected: string | null;
}

export interface DiscountInfo {
  type: 'individual' | 'bulk' | 'tuesday' | 'lightning' | 'suggested';
  rate: number;
  applicable: boolean;
  amount: number;
}

export interface ProductOptionText {
  text: string;
  disabled: boolean;
  className: string;
}

export const PRODUCT_IDS = {
  KEYBOARD: "p1",
  MOUSE: "p2",
  MONITOR_ARM: "p3",
  LAPTOP_POUCH: "p4",
  SPEAKER: "p5",
} as const;

export const DISCOUNT_RATES = {
  DEFAULT: 0.1,
  KEYBOARD: 0.1,
  MOUSE: 0.15,
  MONITOR_ARM: 0.2,
  LAPTOP_POUCH: 0.05,
  SPEAKER: 0.25,
  BULK_DISCOUNT: 0.25,
  TUESDAY_DISCOUNT: 0.1,
  LIGHTNING_SALE: 0.2,
  SUGGESTED_DISCOUNT: 0.05,
} as const;

export const BULK_ITEM_COUNT = 10;