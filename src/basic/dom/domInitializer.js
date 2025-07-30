import { createCartHeader } from "../components/render/cartHeader.js";
import { createHelpPanel } from "../components/render/helpPanel.js";
import { createHelpToggleButton } from "../components/render/helpToggleButton.js";
import { createOrderSummaryPanel } from "../components/render/orderSummaryPanel.js";

export function initializeDOM(context) {
  const root = document.getElementById("app");

  // 기본 구조 생성
  const header = createCartHeader();
  const gridContainer = createGridContainer();
  const leftColumn = createLeftColumn();
  const rightColumn = createOrderSummaryPanel();

  // 상품 선택 및 카트 조작 요소
  const selectorContainer = createSelectorContainer();
  const { productSelectElement, addToCartButton, stockStatusDisplay } =
    createCartControls();
  selectorContainer.appendChild(productSelectElement);
  selectorContainer.appendChild(addToCartButton);
  selectorContainer.appendChild(stockStatusDisplay);

  // 카트 디스플레이 요소
  const cartItemsContainer = createCartDisplay();

  // 왼쪽 열에 요소 추가
  leftColumn.appendChild(selectorContainer);
  leftColumn.appendChild(cartItemsContainer);

  // 오른쪽 열에 요약 패널 추가
  const manualToggle = createHelpToggleButton();
  const { manualOverlay, manualColumn } = createHelpElements();

  // 그리드 컨테이너에 열 추가
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);

  // 전체 구조를 root에 추가
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);

  // 카트 토탈 금액 ui 참조
  const cartTotalElement = rightColumn.querySelector("#cart-total");

  // dom 요소 참조를 Context에 저장
  context.setRef("productSelectElement", productSelectElement);
  context.setRef("addToCartButton", addToCartButton);
  context.setRef("stockStatusDisplay", stockStatusDisplay);
  context.setRef("cartItemsContainer", cartItemsContainer);
  context.setRef("cartTotalElement", cartTotalElement);

  return {
    root,
    header,
    gridContainer,
    leftColumn,
    rightColumn,
    manualToggle,
    manualOverlay,
    manualColumn,
    productSelectElement,
    addToCartButton,
    stockStatusDisplay,
    cartItemsContainer,
    cartTotalElement,
  };
}

function createGridContainer() {
  const gridContainer = document.createElement("div");
  gridContainer.className =
    "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden";
  return gridContainer;
}

function createLeftColumn() {
  const leftColumn = document.createElement("div");
  leftColumn.className = "bg-white border border-gray-200 p-8 overflow-y-auto";
  return leftColumn;
}

function createSelectorContainer() {
  const selectorContainer = document.createElement("div");
  selectorContainer.className = "mb-6 pb-6 border-b border-gray-200";
  return selectorContainer;
}

function createCartControls() {
  const productSelectElement = document.createElement("select");
  productSelectElement.id = "product-select";
  productSelectElement.className =
    "w-full p-3 border border-gray-300 rounded-lg text-base mb-3";

  const addToCartButton = document.createElement("button");
  addToCartButton.id = "add-to-cart";
  addToCartButton.innerHTML = "Add to Cart";
  addToCartButton.className =
    "w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all";

  const stockStatusDisplay = document.createElement("div");
  stockStatusDisplay.id = "stock-status";
  stockStatusDisplay.className =
    "text-xs text-red-500 mt-3 whitespace-pre-line";

  return { productSelectElement, addToCartButton, stockStatusDisplay };
}

function createCartDisplay() {
  const cartItemsContainer = document.createElement("div");
  cartItemsContainer.id = "cart-items";
  return cartItemsContainer;
}

function createHelpElements() {
  const manualOverlay = document.createElement("div");
  manualOverlay.className =
    "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300";

  const manualColumn = createHelpPanel();

  return { manualOverlay, manualColumn };
}
