import {
  MESSAGES,
  INITIAL_PRODUCTS,
  DOM_IDS,
  CSS_SELECTORS,
  CSS_CLASS_NAMES,
} from "./shared/constants/index.js";

import {
  createCartItem,
  updateCartItemPrices,
} from "./ui/CartDisplayComponent.js";

import {
  createGridContainer,
  createLeftColumn,
} from "./ui/GridContainerComponent.js";

import { createHeader } from "./ui/HeaderComponent.js";
import { updateItemCount } from "./ui/ItemCountComponent.js";
import { createManualModal } from "./ui/ManualModalComponent.js";

import {
  createOrderSummary,
  updateSummaryDetails,
  updateCartTotal,
  updateLoyaltyPoints,
  updateDiscountInfo,
  updateTuesdaySpecial,
} from "./ui/OrderSummaryComponent.js";

import {
  createProductSelector,
  updateProductOptions,
  updateStockInfo,
} from "./ui/ProductSelectorComponent.js";

// Business Logic Imports
import {
  findProductById,
  startLightningSaleTimer,
  startSuggestionTimer,
} from "./domains/products/index.js";

import { calculateTotalDiscount } from "./domains/cart/index.js";

import { calculateTotalPoints } from "./domains/points/index.js";

import { parseInteger, isTuesday as checkIsTuesday } from "./utils/index.js";

// State
let sum;
let prodList = [...INITIAL_PRODUCTS];
let bonusPts = 0;
let itemCount = 0;
let lastSel = null;
let totalAmt = 0;
let cartDisplay;

const onAddToCart = () => {
  const selectedItem = selectElement.value;

  if (!selectedItem || !findProductById(prodList, selectedItem)) {
    return;
  }

  const itemToAdd = findProductById(prodList, selectedItem);

  if (itemToAdd && itemToAdd.quantity > 0) {
    const existingItem = document.getElementById(itemToAdd.id);

    if (existingItem) {
      const qtyElem = existingItem.querySelector(CSS_SELECTORS.QUANTITY_NUMBER);
      const currentQty = parseInteger(qtyElem.textContent);
      const newQty = currentQty + 1;

      if (newQty <= itemToAdd.quantity + currentQty) {
        qtyElem.textContent = newQty;
        itemToAdd.quantity--;
      } else {
        alert(MESSAGES.OUT_OF_STOCK);
      }
    } else {
      const newItem = createCartItem({ product: itemToAdd });
      cartDisplay.appendChild(newItem);
      itemToAdd.quantity--;
    }

    calculateAndUpdateCart();
    lastSel = selectedItem;
  }
};

const { selectorContainer, selectElement, stockInfo } = createProductSelector({
  onAddToCart,
});

function main() {
  const root = document.getElementById(DOM_IDS.APP);
  const header = createHeader({ itemCount });
  const gridContainer = createGridContainer();
  const leftColumn = createLeftColumn();

  leftColumn.appendChild(selectorContainer);
  cartDisplay = document.createElement("div");
  leftColumn.appendChild(cartDisplay);
  cartDisplay.id = DOM_IDS.CART_ITEMS;

  const orderSummary = createOrderSummary();
  sum = orderSummary.querySelector("#cart-total");

  const { manualToggle, manualOverlay } = createManualModal();

  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(orderSummary);

  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);

  updateProductOptions({ selectElement, products: prodList });
  calculateAndUpdateCart();

  startLightningSaleTimer(prodList, () => {
    updateProductOptions({ selectElement, products: prodList });
    updateCartItemPrices({ cartDisplay, products: prodList });
    calculateAndUpdateCart();
  });

  startSuggestionTimer(
    prodList,
    () => lastSel,
    () => {
      updateProductOptions({ selectElement, products: prodList });
      updateCartItemPrices({ cartDisplay, products: prodList });
      calculateAndUpdateCart();
    }
  );
}

function calculateAndUpdateCart() {
  const cartItems = Array.from(cartDisplay.children);
  const summaryDetails = document.getElementById(DOM_IDS.SUMMARY_DETAILS);
  const itemCountElement = document.getElementById(DOM_IDS.ITEM_COUNT);

  if (cartItems.length === 0) {
    totalAmt = 0;
    itemCount = 0;
    updateAllDisplays();
    return;
  }

  let subtotal = 0;
  let totalItemCount = 0;

  for (const cartItem of cartItems) {
    const product = findProductById(prodList, cartItem.id);
    if (product) {
      const quantity = parseInteger(
        cartItem.querySelector(CSS_SELECTORS.QUANTITY_NUMBER).textContent
      );
      subtotal += product.price * quantity;
      totalItemCount += quantity;
    }
  }

  const discountResult = calculateTotalDiscount(subtotal, cartItems, prodList);

  totalAmt = discountResult.finalTotal;
  itemCount = totalItemCount;

  const pointsResult = calculateTotalPoints(
    totalAmt,
    cartItems,
    prodList,
    totalItemCount
  );
  bonusPts = pointsResult.totalPoints;

  updateSummaryDetails({
    summaryDetails,
    cartItems,
    products: prodList,
    subTotalPrice: subtotal,
    itemCount: totalItemCount,
    itemDiscounts: discountResult.itemDiscounts,
    isTuesday: discountResult.isTuesday,
    totalAmt,
  });

  const totalPriceElement = sum.querySelector(".text-2xl");
  updateCartTotal({ totalPriceElement, totalAmt });

  updateLoyaltyPoints({ totalAmt });

  updateDiscountInfo({
    discRate: discountResult.discountRate,
    originalTotal: discountResult.originalTotal,
    totalAmt,
  });

  updateTuesdaySpecial({ isTuesday: discountResult.isTuesday, totalAmt });

  updateItemCount({ itemCountElement, itemCount });

  updateStockInfo({ stockInfo, products: prodList });

  updateBonusPointsDisplay(pointsResult);
}

function updateBonusPointsDisplay(pointsResult) {
  const ptsTag = document.getElementById("loyalty-points");

  if (ptsTag) {
    if (bonusPts > 0) {
      ptsTag.innerHTML =
        '<div>적립 포인트: <span class="font-bold">' +
        bonusPts +
        "p</span></div>" +
        '<div class="text-2xs opacity-70 mt-1">' +
        pointsResult.pointsDetails.join(", ") +
        "</div>";
      ptsTag.style.display = "block";
    } else {
      ptsTag.textContent = "적립 포인트: 0p";
      ptsTag.style.display = "block";
    }
  }
}

function updateAllDisplays() {
  const summaryDetails = document.getElementById(DOM_IDS.SUMMARY_DETAILS);
  const itemCountElement = document.getElementById(DOM_IDS.ITEM_COUNT);
  const totalPriceElement = sum.querySelector(".text-2xl");

  summaryDetails.innerHTML = "";
  updateCartTotal({ totalPriceElement, totalAmt });
  updateLoyaltyPoints({ totalAmt });
  updateDiscountInfo({ discRate: 0, originalTotal: 0, totalAmt });
  updateTuesdaySpecial({ isTuesday: checkIsTuesday(), totalAmt });
  updateItemCount({ itemCountElement, itemCount });
  updateStockInfo({ stockInfo, products: prodList });

  const ptsTag = document.getElementById("loyalty-points");
  if (ptsTag) {
    ptsTag.style.display = "none";
  }
}

main();

cartDisplay.addEventListener("click", (event) => {
  const target = event.target;

  if (
    target.classList.contains(CSS_CLASS_NAMES.QUANTITY_CHANGE) ||
    target.classList.contains(CSS_CLASS_NAMES.REMOVE_ITEM)
  ) {
    const prodId = target.dataset.productId;
    const itemElem = document.getElementById(prodId);
    const product = findProductById(prodList, prodId);

    if (target.classList.contains(CSS_CLASS_NAMES.QUANTITY_CHANGE)) {
      const qtyChange = parseInteger(target.dataset.change);
      const qtyElem = itemElem.querySelector(".quantity-number");
      const currentQty = parseInteger(qtyElem.textContent);
      const newQty = currentQty + qtyChange;

      if (newQty > 0 && newQty <= product.quantity + currentQty) {
        qtyElem.textContent = newQty;
        product.quantity -= qtyChange;
      } else if (newQty <= 0) {
        product.quantity += currentQty;
        itemElem.remove();
      } else {
        alert(MESSAGES.OUT_OF_STOCK);
      }
    } else if (target.classList.contains(CSS_CLASS_NAMES.REMOVE_ITEM)) {
      const qtyElem = itemElem.querySelector(CSS_SELECTORS.QUANTITY_NUMBER);
      const remQty = parseInteger(qtyElem.textContent);
      product.quantity += remQty;
      itemElem.remove();
    }

    calculateAndUpdateCart();
    updateProductOptions({ selectElement, products: prodList });
  }
});
