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
  let lightningDelay;
  
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
  context.setRef('sel', sel);
  context.setRef('addBtn', addBtn);
  context.setRef('stockInfo', stockInfo);
  context.setRef('cartDisp', cartDisp);
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
  startLightningSale(context.getState().prodList, onUpdateSelectOptionsWrapper, () =>
    doUpdatePricesInCart(cartDisp, context.getState().prodList, handleCalculateCartStuffWrapper)
  );
  startSuggestedPromotion(
    cartDisp,
    context.getState().prodList,
    context.getState().ui.lastSelected,
    onUpdateSelectOptionsWrapper,
    () =>
      doUpdatePricesInCart(cartDisp, context.getState().prodList, handleCalculateCartStuffWrapper)
  );
}
let sum;

function onUpdateSelectOptionsWrapper() {
  const sel = context.getRef('sel');
  const prodList = context.getState().prodList;
  onUpdateSelectOptions(sel, prodList);
}

function handleCalculateCartStuffWrapper() {
  const cartDisp = context.getRef('cartDisp');
  const prodList = context.getState().prodList;
  const stockInfo = context.getRef('stockInfo');
  
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

// UI 업데이트
function updateCartUI(
  finalTotal,
  itemCnt,
  originalTotal,
  itemDiscounts,
  isTuesday,
  pointsData
) {
  // 아이템 카운트
  document.getElementById("item-count").textContent =
    "🛍️ " + itemCnt + " items in cart";

  // 주문 요약
  const summaryDetails = document.getElementById("summary-details");
  summaryDetails.innerHTML = "";

  if (originalTotal > 0) {
    // 상품별 요약 추가
    const cartItems = cartDisp.children;
    const cartItemsHTML = Array.from(cartItems)
      .map((itemElement) => {
        const productId = itemElement.id;
        const product = prodList.find((p) => p.id === productId);
        const qtyElem = itemElement.querySelector(".quantity-number");
        const quantity = parseInt(qtyElem.textContent);
        const itemTotal = product.val * quantity;

        return `
          <div class="flex justify-between text-xs tracking-wide text-gray-400">
            <span>${product.name} x ${quantity}</span>
            <span>₩${itemTotal.toLocaleString()}</span>
          </div>
        `;
      })
      .join("");

    summaryDetails.innerHTML += cartItemsHTML;

    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${originalTotal.toLocaleString()}</span>
      </div>
    `;

    // 할인 정보 추가
    if (itemCnt >= 30) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-25%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach(function (item) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }

    if (isTuesday) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-purple-400">
          <span class="text-xs">🌟 화요일 추가 할인</span>
          <span class="text-xs">-10%</span>
        </div>
      `;
    }

    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }

  // 총액
  const totalDiv = sum.querySelector(".text-2xl");
  if (totalDiv) {
    totalDiv.textContent = "₩" + Math.round(finalTotal).toLocaleString();
  }

  // 포인트
  const loyaltyPointsDiv = document.getElementById("loyalty-points");
  if (loyaltyPointsDiv) {
    if (itemCnt === 0) {
      loyaltyPointsDiv.style.display = "none";
    } else if (pointsData.points > 0) {
      loyaltyPointsDiv.innerHTML =
        '<div>적립 포인트: <span class="font-bold">' +
        pointsData.points +
        "p</span></div>" +
        '<div class="text-2xs opacity-70 mt-1">' +
        pointsData.details.join(", ") +
        "</div>";
      loyaltyPointsDiv.style.display = "block";
    } else {
      loyaltyPointsDiv.textContent = "적립 포인트: 0p";
      loyaltyPointsDiv.style.display = "block";
    }
  }

  // 할인 정보
  const discountInfoDiv = document.getElementById("discount-info");
  discountInfoDiv.innerHTML = "";
  const discountRate =
    originalTotal > 0 ? (originalTotal - finalTotal) / originalTotal : 0;

  if (discountRate > 0 && finalTotal > 0) {
    const savedAmount = originalTotal - finalTotal;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(
            discountRate * 100
          ).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(
          savedAmount
        ).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }

  // 화요일 특별 배너
  const tuesdaySpecial = document.getElementById("tuesday-special");
  if (isTuesday && finalTotal > 0) {
    tuesdaySpecial.classList.remove("hidden");
  } else {
    tuesdaySpecial.classList.add("hidden");
  }
}

function updateStockInfo() {
  const stockMessage = generateStockMessage(prodList);
  stockInfo.textContent = stockMessage;
}

function doUpdatePricesInCart() {
  const cartItems = cartDisp.children;

  Array.from(cartItems).forEach((itemElement) => {
    const productId = itemElement.id;
    const product = prodList.find((p) => p.id === productId);

    if (product) {
      const priceDiv = itemElement.querySelector(".text-lg");
      const nameDiv = itemElement.querySelector("h3");

      if (product.onSale && product.suggestSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalVal.toLocaleString() +
          '</span> <span class="text-purple-600">₩' +
          product.val.toLocaleString() +
          "</span>";
        nameDiv.textContent = "⚡💝" + product.name;
      } else if (product.onSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalVal.toLocaleString() +
          '</span> <span class="text-red-500">₩' +
          product.val.toLocaleString() +
          "</span>";
        nameDiv.textContent = "⚡" + product.name;
      } else if (product.suggestSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalVal.toLocaleString() +
          '</span> <span class="text-blue-500">₩' +
          product.val.toLocaleString() +
          "</span>";
        nameDiv.textContent = "💝" + product.name;
      } else {
        priceDiv.textContent = "₩" + product.val.toLocaleString();
        nameDiv.textContent = product.name;
      }
    }
  });

  handleCalculateCartStuffWrapper();
}

main();

// Context에서 DOM 참조 및 상태 가져오기
const addBtn = context.getRef('addBtn');
const sel = context.getRef('sel');
const cartDisp = context.getRef('cartDisp');
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
