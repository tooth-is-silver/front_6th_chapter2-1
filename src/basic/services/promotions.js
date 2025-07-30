import { DISCOUNT_RATES } from "../constants/index.js";
import { useCartContext } from "../context/CartContext.js";

// 타이머 상수들
const LIGHTNING_SALE_INTERVAL_MS = 30000;
const SUGGESTED_PROMOTION_INTERVAL_MS = 60000;
const MAX_PROMOTION_INITIAL_DELAY_MS = 20000;
const LIGHTNING_SALE_MAX_DELAY_MS = 10000;
const randomLightningSaleDelay = Math.random() * LIGHTNING_SALE_MAX_DELAY_MS;
const randomSuggestedPromotionDelay =
  Math.random() * MAX_PROMOTION_INITIAL_DELAY_MS;

// 타이머 ID 저장용
let lightningSaleTimerId = null;
let suggestedPromotionTimerId = null;

export function startLightningSale(
  productList,
  updateSelectOptionsCallback,
  updateCartPricesCallback
) {
  // 기존 타이머 정리
  if (lightningSaleTimerId) {
    clearInterval(lightningSaleTimerId);
  }

  setTimeout(() => {
    lightningSaleTimerId = setInterval(() => {
      const eligibleProducts = productList.filter(
        (product) => product.quantity > 0 && !product.onSale
      );

      if (eligibleProducts.length === 0) return;

      const randomProductIndex = Math.floor(
        Math.random() * eligibleProducts.length
      );
      const selectedProduct = eligibleProducts[randomProductIndex];

      // 번개세일 적용
      applyLightningSale(selectedProduct);

      // UI 업데이트
      updateSelectOptionsCallback();
      updateCartPricesCallback();
    }, LIGHTNING_SALE_INTERVAL_MS);
  }, randomLightningSaleDelay);
}

// 번개세일 적용 로직 분리
function applyLightningSale(product) {
  product.value = Math.round(product.originalValue * 0.8); // 20% 할인
  product.onSale = true;
  alert(`⚡번개세일! ${product.name}이(가) 20% 할인 중입니다!`);
}

export function startSuggestedPromotion(
  productList,
  lastSelectedProduct, // 하위 호환성을 위해 유지, 내부에서 Context 사용
  updateSelectOptionsCallback,
  updateCartPricesCallback
) {
  const context = useCartContext();

  // 기존 타이머 정리
  if (suggestedPromotionTimerId) {
    clearInterval(suggestedPromotionTimerId);
  }

  setTimeout(function () {
    suggestedPromotionTimerId = setInterval(() => {
      // Context에서 lastSelected 가져오기 (리액트에서는 useContext로 자동 처리)
      const currentlySelectedProductId = context.getState().ui.lastSelected;

      if (currentlySelectedProductId) {
        const suggestedProduct = productList.find(
          (product) =>
            product.id !== currentlySelectedProductId &&
            product.quantity > 0 &&
            !product.suggestSale
        );
        if (suggestedProduct) {
          alert(
            "💝 " +
              suggestedProduct.name +
              `은(는) 어떠세요? 지금 구매하시면 ${
                DISCOUNT_RATES.SUGGESTED_DISCOUNT * 100
              }% 추가 할인!`
          );
          suggestedProduct.value = Math.round(
            (suggestedProduct.value * (100 - 5)) / 100
          );
          suggestedProduct.suggestSale = true;
          updateSelectOptionsCallback();
          updateCartPricesCallback();
        }
      }
    }, SUGGESTED_PROMOTION_INTERVAL_MS);
  }, randomSuggestedPromotionDelay);
}
