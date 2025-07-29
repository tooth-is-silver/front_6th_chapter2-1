import { productList } from "./data/products.js";
import { handleCalculateCartStuff } from "./core/cart.js";
import {
  setupAddToCartHandler,
  setupCartItemHandler,
} from "./handlers/cartHandlers.js";
import {
  startLightningSale,
  startSuggestedPromotion,
} from "./services/promotions.js";
import {
  updateCartUI,
  onUpdateSelectOptions,
  updateStockInfo,
  doUpdatePricesInCart,
} from "./ui/cartRenderer.js";
import { useCartContext, CartProvider } from "./context/CartContext.js";

// Context 초기화 (리액트에서는 <CartProvider>로 감쌀 예정)
const context = CartProvider({ prodList: productList });

// 컴포넌트 import
import {
  createCartHeader,
  createProductSelect,
  createAddToCartButton,
  createStockStatusDiv,
  createCartItemsContainer,
  createOrderSummaryPanel,
  createHelpToggleButton,
  createHelpOverlay,
  createHelpPanel,
} from "./components/CartComponents";

function main() {
  let root;
  let header;
  let gridContainer;
  let leftColumn;
  let selectorContainer;
  let rightColumn;
  let manualToggle;
  let manualOverlay;
  let manualColumn;

  // Context 상태 초기화
  context.updateCartTotals(0, 0, 0);
  context.setLastSelected(null);

  root = document.getElementById("app");
  header = createCartHeader();
  const sel = createProductSelect();
  gridContainer = document.createElement("div");
  leftColumn = document.createElement("div");
  leftColumn["className"] =
    "bg-white border border-gray-200 p-8 overflow-y-auto";
  selectorContainer = document.createElement("div");
  selectorContainer.className = "mb-6 pb-6 border-b border-gray-200";
  sel.className = "w-full p-3 border border-gray-300 rounded-lg text-base mb-3";
  gridContainer.className =
    "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden";
  const addBtn = createAddToCartButton();
  const stockInfo = createStockStatusDiv();
  addBtn.id = "add-to-cart";
  stockInfo.id = "stock-status";
  stockInfo.className = "text-xs text-red-500 mt-3 whitespace-pre-line";
  addBtn.innerHTML = "Add to Cart";
  addBtn.className =
    "w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all";
  selectorContainer.appendChild(sel);
  selectorContainer.appendChild(addBtn);
  selectorContainer.appendChild(stockInfo);
  leftColumn.appendChild(selectorContainer);
  const cartDisp = createCartItemsContainer();
  leftColumn.appendChild(cartDisp);
  cartDisp.id = "cart-items";

  // DOM 참조를 Context에 저장 (리액트에서는 useRef로 관리 예정)
  context.setRef("sel", sel);
  context.setRef("addBtn", addBtn);
  context.setRef("stockInfo", stockInfo);
  context.setRef("cartDisp", cartDisp);
  rightColumn = createOrderSummaryPanel();
  sum = rightColumn.querySelector("#cart-total");
  manualToggle = createHelpToggleButton();
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle("hidden");
    manualColumn.classList.toggle("translate-x-full");
  };
  manualOverlay = createHelpOverlay();
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add("hidden");
      manualColumn.classList.add("translate-x-full");
    }
  };
  manualColumn = createHelpPanel();
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);
  onUpdateSelectOptionsWrapper();
  handleCalculateCartStuffWrapper();
  startLightningSale(
    context.getState().prodList,
    onUpdateSelectOptionsWrapper,
    () =>
      doUpdatePricesInCart(
        cartDisp,
        context.getState().prodList,
        handleCalculateCartStuffWrapper
      )
  );
  startSuggestedPromotion(
    cartDisp,
    context.getState().prodList,
    context.getState().ui.lastSelected,
    onUpdateSelectOptionsWrapper,
    () =>
      doUpdatePricesInCart(
        cartDisp,
        context.getState().prodList,
        handleCalculateCartStuffWrapper
      )
  );
}
let sum;

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
        sum
      ),
    () => updateStockInfo(stockInfo, prodList)
  );

  // Context 상태 업데이트 (리액트에서는 setState로 관리 예정)
  context.updateCartTotals(result.totalAmount, result.bonusPoints, 0);
}

main();

// Context에서 DOM 참조 및 상태 가져오기
const addBtn = context.getRef("addBtn");
const sel = context.getRef("sel");
const cartDisp = context.getRef("cartDisp");
const prodList = context.getState().prodList;

setupAddToCartHandler(
  addBtn,
  sel,
  cartDisp,
  prodList,
  handleCalculateCartStuffWrapper
);
setupCartItemHandler(
  cartDisp,
  prodList,
  handleCalculateCartStuffWrapper,
  onUpdateSelectOptionsWrapper
);
