// CartItem 템플릿 컴포넌트 (리액트 마이그레이션 대비)
// 나중에 리액트에서는 JSX 컴포넌트로 변환 예정

import { getProductDisplayName, getProductPriceHTML } from "../utils/productUtils.js";

/**
 * 장바구니 아이템 HTML 템플릿 생성 (리액트의 컴포넌트 함수와 유사한 구조)
 * @param {Object} props - 컴포넌트 props (리액트와 동일한 패턴)
 * @param {Object} props.product - 상품 정보
 * @param {number} props.quantity - 수량 (기본값: 1)
 * @returns {string} 장바구니 아이템 HTML
 */
export function CartItemTemplate({ product, quantity = 1 }) {
  const displayName = getProductDisplayName(product);
  const priceDisplay = getProductPriceHTML(product);
  
  return `
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${displayName}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">${priceDisplay}</p>
      ${QuantityControlsTemplate({ productId: product.id, quantity })}
    </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${priceDisplay}</div>
      ${RemoveButtonTemplate({ productId: product.id })}
    </div>
  `;
}

/**
 * 수량 조절 컨트롤 템플릿 (리액트에서는 별도 컴포넌트로 분리 예정)
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.productId - 상품 ID
 * @param {number} props.quantity - 현재 수량
 * @returns {string} 수량 조절 HTML
 */
function QuantityControlsTemplate({ productId, quantity }) {
  return `
    <div class="flex items-center gap-4">
      <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${productId}" data-change="-1">−</button>
      <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">${quantity}</span>
      <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${productId}" data-change="1">+</button>
    </div>
  `;
}

/**
 * 제거 버튼 템플릿 (리액트에서는 별도 컴포넌트로 분리 예정)
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.productId - 상품 ID
 * @returns {string} 제거 버튼 HTML
 */
function RemoveButtonTemplate({ productId }) {
  return `
    <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${productId}">Remove</a>
  `;
}

/**
 * 완전한 장바구니 아이템 요소 생성 (기존 코드와의 호환성 유지)
 * @param {Object} product - 상품 정보
 * @param {number} quantity - 수량
 * @returns {HTMLElement} DOM 요소
 */
export function createCartItemElement(product, quantity = 1) {
  const newItem = document.createElement("div");
  newItem.id = product.id;
  newItem.className = "grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0";
  newItem.innerHTML = CartItemTemplate({ product, quantity });
  return newItem;
}