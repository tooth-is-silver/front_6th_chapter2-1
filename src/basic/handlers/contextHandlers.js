import { handleCalculateCartStuff } from "../core/cart.js";
import {
  updateCartUI,
  onUpdateSelectOptions,
  updateStockInfo,
  doUpdatePricesInCart,
} from "../ui/cartRenderer.js";

export function createContextHandlers(context) {
  function onUpdateSelectOptionsWrapper() {
    const sel = context.getRef("sel");
    const prodList = context.getState().prodList;
    onUpdateSelectOptions(sel, prodList);
  }

  function handleCalculateCartStuffWrapper() {
    const cartDisp = context.getRef("cartDisp");
    const prodList = context.getState().prodList;
    const stockInfo = context.getRef("stockInfo");

    const result = handleCalculateCartStuff(
      cartDisp,
      prodList,
      (
        finalTotal,
        itemCnt,
        originalTotal,
        itemDiscounts,
        isTuesday,
        pointsData
      ) =>
        updateCartUI(
          finalTotal,
          itemCnt,
          originalTotal,
          itemDiscounts,
          isTuesday,
          pointsData,
          cartDisp,
          prodList,
          context.getRef("sum")
        ),
      () => updateStockInfo(stockInfo, prodList)
    );

    // Context 상태 업데이트 (리액트에서는 setState로 관리 예정)
    context.updateCartTotals(result.totalAmount, result.bonusPoints, 0);
  }

  function createUpdatePricesHandler() {
    return () =>
      doUpdatePricesInCart(
        context.getRef("cartDisp"),
        context.getState().prodList,
        handleCalculateCartStuffWrapper
      );
  }

  return {
    onUpdateSelectOptionsWrapper,
    handleCalculateCartStuffWrapper,
    createUpdatePricesHandler,
  };
}
