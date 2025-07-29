// OrderSummary 관련 템플릿 컴포넌트들 (리액트 마이그레이션 대비)
// 나중에 리액트에서는 각각 JSX 컴포넌트로 변환 예정

/**
 * 개별 장바구니 아이템 요약 템플릿
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.product - 상품 정보
 * @param {number} props.quantity - 수량
 * @param {number} props.itemTotal - 아이템 총액
 * @returns {string} 아이템 요약 HTML
 */
export function CartItemSummaryTemplate({ product, quantity, itemTotal }) {
  return `
    <div class="flex justify-between text-xs tracking-wide text-gray-400">
      <span>${product.name} x ${quantity}</span>
      <span>₩${itemTotal.toLocaleString()}</span>
    </div>
  `;
}

/**
 * 소계 정보 템플릿
 * @param {Object} props - 컴포넌트 props  
 * @param {number} props.originalTotal - 원래 총액
 * @returns {string} 소계 HTML
 */
export function SubtotalTemplate({ originalTotal }) {
  return `
    <div class="border-t border-white/10 my-3"></div>
    <div class="flex justify-between text-sm tracking-wide">
      <span>Subtotal</span>
      <span>₩${originalTotal.toLocaleString()}</span>
    </div>
  `;
}

/**
 * 대량구매 할인 정보 템플릿
 * @returns {string} 대량구매 할인 HTML
 */
export function BulkDiscountTemplate() {
  return `
    <div class="flex justify-between text-sm tracking-wide text-green-400">
      <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
      <span class="text-xs">-25%</span>
    </div>
  `;
}

/**
 * 개별 상품 할인 정보 템플릿
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.discount - 할인 정보 { name, discount }
 * @returns {string} 개별 할인 HTML
 */
export function ItemDiscountTemplate({ discount }) {
  return `
    <div class="flex justify-between text-sm tracking-wide text-green-400">
      <span class="text-xs">${discount.name} (10개↑)</span>
      <span class="text-xs">-${discount.discount}%</span>
    </div>
  `;
}

/**
 * 화요일 할인 정보 템플릿
 * @returns {string} 화요일 할인 HTML
 */
export function TuesdayDiscountTemplate() {
  return `
    <div class="flex justify-between text-sm tracking-wide text-purple-400">
      <span class="text-xs">🌟 화요일 추가 할인</span>
      <span class="text-xs">-10%</span>
    </div>
  `;
}

/**
 * 배송 정보 템플릿
 * @returns {string} 배송 정보 HTML
 */
export function ShippingInfoTemplate() {
  return `
    <div class="flex justify-between text-sm tracking-wide text-gray-400">
      <span>Shipping</span>
      <span>Free</span>
    </div>
  `;
}

/**
 * 할인 배너 템플릿
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.discountRate - 할인율 (0~1)
 * @param {number} props.savedAmount - 절약 금액
 * @returns {string} 할인 배너 HTML
 */
export function DiscountBannerTemplate({ discountRate, savedAmount }) {
  return `
    <div class="bg-green-500/20 rounded-lg p-3">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
        <span class="text-sm font-medium text-green-400">${(discountRate * 100).toFixed(1)}%</span>
      </div>
      <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
    </div>
  `;
}

/**
 * 포인트 정보 템플릿
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.points - 적립 포인트
 * @param {Array<string>} props.details - 포인트 상세 정보
 * @returns {string} 포인트 정보 HTML
 */
export function PointsInfoTemplate({ points, details }) {
  return `
    <div>적립 포인트: <span class="font-bold">${points}p</span></div>
    <div class="text-2xs opacity-70 mt-1">${details.join(", ")}</div>
  `;
}

/**
 * 할인 섹션 전체 템플릿 (조건부 렌더링 포함)
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.itemCount - 총 아이템 수
 * @param {Array} props.itemDiscounts - 개별 할인 배열
 * @param {boolean} props.isTuesday - 화요일 여부
 * @returns {string} 할인 섹션 HTML
 */
export function DiscountSectionTemplate({ itemCount, itemDiscounts, isTuesday }) {
  let html = "";
  
  // 대량구매 할인 vs 개별 할인
  if (itemCount >= 30) {
    html += BulkDiscountTemplate();
  } else if (itemDiscounts.length > 0) {
    html += itemDiscounts.map(discount => ItemDiscountTemplate({ discount })).join("");
  }
  
  // 화요일 할인
  if (isTuesday) {
    html += TuesdayDiscountTemplate();
  }
  
  return html;
}