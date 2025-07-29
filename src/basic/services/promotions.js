import { DISCOUNT_RATES } from "../constants/index.js";
import { useCartContext } from "../context/CartContext.js";

// 타이머 상수들
const LIGHTNING_SALE_INTERVAL = 30000;
const SUGGESTED_PROMOTION_INTERVAL = 60000;
const MAX_INITIAL_DELAY = 20000;
const LIGHTNING_MAX_DELAY = 10000;
const RANDOM_LIGHTNING_DELAY = Math.random() * LIGHTNING_MAX_DELAY;
const RANDOM_SUGGESTED_DELAY = Math.random() * MAX_INITIAL_DELAY;

// 타이머 ID 저장용
let lightningTimer = null;
let suggestionTimer = null;

export function startLightningSale(
  prodList,
  onUpdateSelectOptions,
  doUpdatePricesInCart
) {
  // 기존 타이머 정리
  if (lightningTimer) {
    clearInterval(lightningTimer);
  }

  setTimeout(() => {
    lightningTimer = setInterval(() => {
      const availableProducts = prodList.filter(
        (product) => product.q > 0 && !product.onSale
      );

      if (availableProducts.length === 0) return;

      const randomIndex = Math.floor(Math.random() * availableProducts.length);
      const luckyItem = availableProducts[randomIndex];

      // 번개세일 적용
      applyLightningSale(luckyItem);

      // UI 업데이트
      onUpdateSelectOptions();
      doUpdatePricesInCart();
    }, LIGHTNING_SALE_INTERVAL);
  }, RANDOM_LIGHTNING_DELAY);
}

// 번개세일 적용 로직 분리
function applyLightningSale(product) {
  product.val = Math.round(product.originalVal * 0.8); // 20% 할인
  product.onSale = true;
  alert(`⚡번개세일! ${product.name}이(가) 20% 할인 중입니다!`);
}

export function startSuggestedPromotion(
  prodList,
  lastSel, // 하위 호환성을 위해 유지, 내부에서 Context 사용
  onUpdateSelectOptions,
  doUpdatePricesInCart
) {
  const context = useCartContext();

  // 기존 타이머 정리
  if (suggestionTimer) {
    clearInterval(suggestionTimer);
  }

  setTimeout(function () {
    suggestionTimer = setInterval(() => {
      // Context에서 lastSelected 가져오기 (리액트에서는 useContext로 자동 처리)
      const currentLastSel = context.getState().ui.lastSelected;

      if (currentLastSel) {
        const suggest = prodList.find(
          (product) =>
            product.id !== currentLastSel &&
            product.q > 0 &&
            !product.suggestSale
        );
        if (suggest) {
          alert(
            "💝 " +
              suggest.name +
              `은(는) 어떠세요? 지금 구매하시면 ${
                DISCOUNT_RATES.SUGGESTED_DISCOUNT * 100
              }% 추가 할인!`
          );
          suggest.val = Math.round((suggest.val * (100 - 5)) / 100);
          suggest.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, SUGGESTED_PROMOTION_INTERVAL);
  }, RANDOM_SUGGESTED_DELAY);
}
