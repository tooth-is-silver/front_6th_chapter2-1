import { DISCOUNT_RATES } from "../constants/index.js";

export function startLightningSale(
  prodList,
  onUpdateSelectOptions,
  doUpdatePricesInCart
) {
  const lightningDelay = Math.random() * 10000;
  setTimeout(() => {
    setInterval(function () {
      let luckyIdx = Math.floor(Math.random() * prodList.length);
      let luckyItem = prodList[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
        luckyItem.onSale = true;
        alert("⚡번개세일! " + luckyItem.name + "이(가) 20% 할인 중입니다!");
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, 30000);
  }, lightningDelay);
}

export function startSuggestedPromotion(
  cartDisp,
  prodList,
  lastSel,
  onUpdateSelectOptions,
  doUpdatePricesInCart
) {
  setTimeout(function () {
    setInterval(function () {
      if (cartDisp.children.length === 0) {
      }
      if (lastSel) {
        const suggest = prodList.find(
          (product) =>
            product.id !== lastSel &&
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
    }, 60000);
  }, Math.random() * 20000);
}
