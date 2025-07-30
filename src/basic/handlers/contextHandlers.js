import { handleCalculateCartStuff } from "../core/cart.js";
import {
  updateCartUI,
  onUpdateSelectOptions,
  updateStockInfo,
  doUpdatePricesInCart,
} from "../ui/cartRenderer.js";

export function createContextHandlers(context) {
  function onUpdateSelectOptionsWrapper() {
    const productSelectElement = context.getRef("productSelectElement");
    const prodList = context.getState().prodList;
    onUpdateSelectOptions(productSelectElement, prodList);
  }

  function handleCalculateCartStuffWrapper() {
    const cartItemsContainer = context.getRef("cartItemsContainer");
    const prodList = context.getState().prodList;
    const stockStatusDisplay = context.getRef("stockStatusDisplay");

    const result = handleCalculateCartStuff(
      cartItemsContainer,
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
          cartItemsContainer,
          prodList,
          context.getRef("cartTotalElement")
        ),
      () => updateStockInfo(stockStatusDisplay, prodList)
    );

    // Context 상태 업데이트 (리액트에서는 setState로 관리 예정)
    context.updateCartTotals(result.totalAmount, result.bonusPoints, 0);
  }

  function createUpdatePricesHandler() {
    return () =>
      doUpdatePricesInCart(
        context.getRef("cartItemsContainer"),
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
