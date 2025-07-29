// 상품 표시 관련 유틸리티 함수들 (리액트 마이그레이션 대비)
// 나중에 리액트에서는 각각 custom hook이나 utility function으로 사용 예정

/**
 * 상품명에 아이콘을 추가하여 표시명을 생성
 * @param {Object} product - 상품 객체
 * @returns {string} 아이콘이 포함된 상품명
 */
export function getProductDisplayName(product) {
  const icons = [];
  if (product.onSale && product.suggestSale) {
    icons.push("⚡💝");
  } else if (product.onSale) {
    icons.push("⚡");
  } else if (product.suggestSale) {
    icons.push("💝");
  }
  return icons.join("") + product.name;
}

/**
 * 상품 가격 표시 HTML 생성 (할인 가격 포함)
 * @param {Object} product - 상품 객체
 * @returns {string} 가격 표시 HTML
 */
export function getProductPriceHTML(product) {
  if (product.onSale || product.suggestSale) {
    const colorClass = getDiscountColorClass(product);
    return `<span class="line-through text-gray-400">₩${product.originalVal.toLocaleString()}</span> <span class="${colorClass}">₩${product.val.toLocaleString()}</span>`;
  }
  return `₩${product.val.toLocaleString()}`;
}

/**
 * 할인 유형에 따른 색상 클래스 반환
 * @param {Object} product - 상품 객체 
 * @returns {string} CSS 클래스명
 */
export function getDiscountColorClass(product) {
  if (product.onSale && product.suggestSale) {
    return "text-purple-600";
  } else if (product.onSale) {
    return "text-red-500";
  } else if (product.suggestSale) {
    return "text-blue-500";
  }
  return "";
}

/**
 * 상품이 할인 중인지 확인
 * @param {Object} product - 상품 객체
 * @returns {boolean} 할인 여부
 */
export function isProductOnDiscount(product) {
  return product.onSale || product.suggestSale;
}