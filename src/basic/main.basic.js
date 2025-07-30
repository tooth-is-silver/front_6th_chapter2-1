import { productList } from "./data/products.js";
import {
  setupAddToCartHandler,
  setupCartItemHandler,
} from "./handlers/cartHandlers.js";
import { createContextHandlers } from "./handlers/contextHandlers.js";
import { setupHelpPanelHandlers } from "./handlers/helpPanelHandlers.js";
import {
  startLightningSale,
  startSuggestedPromotion,
} from "./services/promotions.js";
import { CartProvider } from "./context/CartContext.js";
import { initializeDOM } from "./dom/domInitializer.js";

// Context 초기화 (리액트에서는 <CartProvider>로 감쌀 예정)
const context = CartProvider({ prodList: productList });

function main() {
  // Context 상태 초기화
  context.updateCartTotals(0, 0, 0);
  context.setLastSelected(null);

  // DOM 초기화
  const domElements = initializeDOM(context);
  const { manualToggle, manualOverlay, manualColumn } = domElements;

  // Context handlers 생성
  const handlers = createContextHandlers(context);
  const { onUpdateSelectOptionsWrapper, handleCalculateCartStuffWrapper } =
    handlers;

  // Help panel handlers 설정
  setupHelpPanelHandlers(manualToggle, manualOverlay, manualColumn);

  // 초기 UI 업데이트
  onUpdateSelectOptionsWrapper();
  handleCalculateCartStuffWrapper();

  // 프로모션 시작
  const updatePricesHandler = handlers.createUpdatePricesHandler();
  startLightningSale(
    context.getState().prodList,
    onUpdateSelectOptionsWrapper,
    updatePricesHandler
  );
  startSuggestedPromotion(
    context.getState().prodList,
    context.getState().ui.lastSelected,
    onUpdateSelectOptionsWrapper,
    updatePricesHandler
  );
}

main();

// Context handlers 생성 및 Cart event handlers 설정
const handlers = createContextHandlers(context);
const { handleCalculateCartStuffWrapper, onUpdateSelectOptionsWrapper } =
  handlers;

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
