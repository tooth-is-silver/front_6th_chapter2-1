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
  const { sel, addBtn, stockInfo } = createCartControls();
  selectorContainer.appendChild(sel);
  selectorContainer.appendChild(addBtn);
  selectorContainer.appendChild(stockInfo);

  // 카트 디스플레이 요소
  const cartDisp = createCartDisplay();

  // 왼쪽 열에 요소 추가
  leftColumn.appendChild(selectorContainer);
  leftColumn.appendChild(cartDisp);

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
  const sum = rightColumn.querySelector("#cart-total");

  // dom 요소 참조를 Context에 저장
  context.setRef("sel", sel);
  context.setRef("addBtn", addBtn);
  context.setRef("stockInfo", stockInfo);
  context.setRef("cartDisp", cartDisp);
  context.setRef("sum", sum);

  return {
    root,
    header,
    gridContainer,
    leftColumn,
    rightColumn,
    manualToggle,
    manualOverlay,
    manualColumn,
    sel,
    addBtn,
    stockInfo,
    cartDisp,
    sum,
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
  const sel = document.createElement("select");
  sel.id = "product-select";
  sel.className = "w-full p-3 border border-gray-300 rounded-lg text-base mb-3";

  const addBtn = document.createElement("button");
  addBtn.id = "add-to-cart";
  addBtn.innerHTML = "Add to Cart";
  addBtn.className =
    "w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all";

  const stockInfo = document.createElement("div");
  stockInfo.id = "stock-status";
  stockInfo.className = "text-xs text-red-500 mt-3 whitespace-pre-line";

  return { sel, addBtn, stockInfo };
}

function createCartDisplay() {
  const cartDisp = document.createElement("div");
  cartDisp.id = "cart-items";
  return cartDisp;
}

function createHelpElements() {
  const manualOverlay = document.createElement("div");
  manualOverlay.className =
    "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300";

  const manualColumn = createHelpPanel();

  return { manualOverlay, manualColumn };
}
