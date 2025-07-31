import {
  PRODUCT_IDS,
  DISCOUNT_RATES,
  QUANTITY_THRESHOLDS,
  POINTS_CONFIG,
  TIMING,
  MESSAGES,
  INITIAL_PRODUCTS,
  DOM_IDS,
  CSS_SELECTORS,
  CSS_CLASS_NAMES,
  MAGIC_NUMBERS,
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

let sum;
let prodList = [...INITIAL_PRODUCTS];
let bonusPts = 0;
let itemCount = 0;
let lastSel = null;
let totalAmt = 0;
let cartDisplay;

const onAddToCart = () => {
  const selItem = selectElement.value;

  let hasItem = false;
  for (let idx = 0; idx < prodList.length; idx++) {
    if (prodList[idx].id === selItem) {
      hasItem = true;
      break;
    }
  }
  if (!selItem || !hasItem) {
    return;
  }
  let itemToAdd = null;
  for (let j = 0; j < prodList.length; j++) {
    if (prodList[j].id === selItem) {
      itemToAdd = prodList[j];
      break;
    }
  }

  if (itemToAdd && itemToAdd.quantity > 0) {
    const item = document.getElementById(itemToAdd.id);
    if (item) {
      const qtyElem = item.querySelector(CSS_SELECTORS.QUANTITY_NUMBER);
      const currentQty = parseInt(qtyElem.textContent);
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
    handleCalculateCartStuff();
    lastSel = selItem;
  }
};

const { selectorContainer, selectElement, stockInfo } = createProductSelector({
  onAddToCart,
});

function main() {
  let root;
  const header = createHeader({ itemCount });
  const gridContainer = createGridContainer();
  const leftColumn = createLeftColumn();

  root = document.getElementById(DOM_IDS.APP);

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
  handleCalculateCartStuff();

  const lightningDelay = Math.random() * 10000;

  setTimeout(() => {
    setInterval(function () {
      const luckyIdx = Math.floor(Math.random() * prodList.length);
      const luckyItem = prodList[luckyIdx];
      if (luckyItem.quantity > 0 && !luckyItem.isOnLightningSale) {
        luckyItem.price = Math.round((luckyItem.originalPrice * 80) / 100);
        luckyItem.isOnLightningSale = true;
        alert(MESSAGES.LIGHTNING_SALE.replace("{productName}", luckyItem.name));
        updateProductOptions({ selectElement, products: prodList });
        doUpdatePricesInCart();
      }
    }, TIMING.LIGHTNING_SALE_INTERVAL);
  }, lightningDelay);

  setTimeout(() => {
    setInterval(() => {
      if (lastSel) {
        let suggest = null;

        for (let k = 0; k < prodList.length; k++) {
          if (prodList[k].id !== lastSel) {
            if (prodList[k].quantity > 0) {
              if (!prodList[k].isSuggestedSale) {
                suggest = prodList[k];
                break;
              }
            }
          }
        }
        if (suggest) {
          alert(MESSAGES.SUGGESTED_SALE.replace("{productName}", suggest.name));

          suggest.price = Math.round((suggest.price * (100 - 5)) / 100);
          suggest.isSuggestedSale = true;
          updateProductOptions({ selectElement, products: prodList });
          doUpdatePricesInCart();
        }
      }
    }, TIMING.SUGGESTION_INTERVAL);
  }, Math.random() * TIMING.SUGGESTION_DELAY_MAX);
}

function handleCalculateCartStuff() {
  let cartItems = cartDisplay.children;
  let subTotalPrice = 0;
  let itemDiscounts = [];
  let lowStockItems = [];
  let summaryDetails = document.getElementById(DOM_IDS.SUMMARY_DETAILS);
  let itemCountElement = document.getElementById(DOM_IDS.ITEM_COUNT);

  totalAmt = 0;
  itemCount = 0;

  for (let idx = 0; idx < prodList.length; idx++) {
    if (
      prodList[idx].quantity < QUANTITY_THRESHOLDS.LOW_STOCK &&
      prodList[idx].quantity > 0
    ) {
      lowStockItems.push(prodList[idx].name);
    }
  }
  for (let i = 0; i < cartItems.length; i++) {
    (function () {
      let curItem;
      for (let j = 0; j < prodList.length; j++) {
        if (prodList[j].id === cartItems[i].id) {
          curItem = prodList[j];
          break;
        }
      }

      const qtyElem = cartItems[i].querySelector(CSS_SELECTORS.QUANTITY_NUMBER);
      let quantity = parseInt(qtyElem.textContent);
      let discountPrice = 0;
      const itemTot = curItem.price * quantity;
      itemCount += quantity;
      subTotalPrice += itemTot;
      const itemDiv = cartItems[i];
      const priceElems = itemDiv.querySelectorAll(CSS_SELECTORS.PRICE_ELEMENTS);
      priceElems.forEach(function (elem) {
        if (elem.classList.contains(CSS_CLASS_NAMES.TEXT_LG)) {
          elem.style.fontWeight =
            quantity >= QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT
              ? "bold"
              : "normal";
        }
      });
      if (quantity >= QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT) {
        if (curItem.id === PRODUCT_IDS.KEYBOARD) {
          discountPrice = DISCOUNT_RATES.INDIVIDUAL.KEYBOARD;
        } else if (curItem.id === PRODUCT_IDS.MOUSE) {
          discountPrice = DISCOUNT_RATES.INDIVIDUAL.MOUSE;
        } else if (curItem.id === PRODUCT_IDS.MONITOR_ARM) {
          discountPrice = DISCOUNT_RATES.INDIVIDUAL.MONITOR_ARM;
        } else if (curItem.id === PRODUCT_IDS.LAPTOP_POUCH) {
          discountPrice = DISCOUNT_RATES.INDIVIDUAL.LAPTOP_POUCH;
        } else if (curItem.id === PRODUCT_IDS.SPEAKER) {
          discountPrice = DISCOUNT_RATES.INDIVIDUAL.SPEAKER;
        }
        if (discountPrice > 0) {
          itemDiscounts.push({
            name: curItem.name,
            discount: discountPrice * 100,
          });
        }
      }
      totalAmt += itemTot * (1 - discountPrice);
    })();
  }

  let discRate = 0;
  const originalTotal = subTotalPrice;
  if (itemCount >= QUANTITY_THRESHOLDS.BULK_DISCOUNT) {
    totalAmt =
      (subTotalPrice *
        (MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER -
          DISCOUNT_RATES.BULK * MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER)) /
      MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER;
    discRate = DISCOUNT_RATES.BULK;
  } else {
    discRate = (subTotalPrice - totalAmt) / subTotalPrice;
  }

  const today = new Date();
  const isTuesday = today.getDay() === MAGIC_NUMBERS.TUESDAY_DAY_INDEX;
  if (isTuesday) {
    if (totalAmt > 0) {
      totalAmt =
        (totalAmt *
          (MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER -
            DISCOUNT_RATES.TUESDAY * MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER)) /
        MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER;
      discRate = 1 - totalAmt / originalTotal;
    }
  }

  updateTuesdaySpecial({ isTuesday, totalAmt });
  itemCountElement.textContent = "🛍️ " + itemCount + " items in cart";

  updateSummaryDetails({
    summaryDetails,
    cartItems,
    products: prodList,
    subTotalPrice,
    itemCount,
    itemDiscounts,
    isTuesday,
    totalAmt,
  });

  const totalPriceElement = sum.querySelector(".text-2xl");
  updateCartTotal({ totalPriceElement, totalAmt });

  updateLoyaltyPoints({ totalAmt });

  updateDiscountInfo({ discRate, originalTotal, totalAmt });

  updateItemCount({ itemCountElement, itemCount });

  updateStockInfo({ stockInfo, products: prodList });

  handleStockInfoUpdate();
  doRenderBonusPoints();
}

const doRenderBonusPoints = function () {
  let basePoints = Math.floor(totalAmt / 1000);
  let finalPoints = 0;
  let pointsDetail = [];
  let hasKeyboard = false;
  let hasMouse = false;
  let hasMonitorArm = false;
  let nodes = cartDisplay.children;

  if (cartDisplay.children.length === 0) {
    document.getElementById(DOM_IDS.LOYALTY_POINTS).style.display = "none";
    return;
  }

  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push("기본: " + basePoints + "p");
  }
  if (new Date().getDay() === 2) {
    if (basePoints > 0) {
      finalPoints = basePoints * POINTS_CONFIG.TUESDAY_MULTIPLIER;
      pointsDetail.push("화요일 2배");
    }
  }

  for (const node of nodes) {
    let product = null;

    for (let pIdx = 0; pIdx < prodList.length; pIdx++) {
      if (prodList[pIdx].id === node.id) {
        product = prodList[pIdx];
        break;
      }
    }
    if (!product) continue;
    if (product.id === PRODUCT_IDS.KEYBOARD) {
      hasKeyboard = true;
    } else if (product.id === PRODUCT_IDS.MOUSE) {
      hasMouse = true;
    } else if (product.id === PRODUCT_IDS.MONITOR_ARM) {
      hasMonitorArm = true;
    }
  }

  if (hasKeyboard && hasMouse) {
    finalPoints = finalPoints + POINTS_CONFIG.COMBO_BONUS.KEYBOARD_MOUSE;
    pointsDetail.push(
      "키보드+마우스 세트 +" + POINTS_CONFIG.COMBO_BONUS.KEYBOARD_MOUSE + "p"
    );
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints = finalPoints + POINTS_CONFIG.COMBO_BONUS.FULL_SET;
    pointsDetail.push(
      "풀세트 구매 +" + POINTS_CONFIG.COMBO_BONUS.FULL_SET + "p"
    );
  }

  if (itemCount >= POINTS_CONFIG.QUANTITY_BONUS.TIER_3.min) {
    finalPoints = finalPoints + POINTS_CONFIG.QUANTITY_BONUS.TIER_3.points;
    pointsDetail.push(
      "대량구매(" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_3.min +
        "개+) +" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_3.points +
        "p"
    );
  } else if (itemCount >= POINTS_CONFIG.QUANTITY_BONUS.TIER_2.min) {
    finalPoints = finalPoints + POINTS_CONFIG.QUANTITY_BONUS.TIER_2.points;
    pointsDetail.push(
      "대량구매(" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_2.min +
        "개+) +" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_2.points +
        "p"
    );
  } else if (itemCount >= POINTS_CONFIG.QUANTITY_BONUS.TIER_1.min) {
    finalPoints = finalPoints + POINTS_CONFIG.QUANTITY_BONUS.TIER_1.points;
    pointsDetail.push(
      "대량구매(" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_1.min +
        "개+) +" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_1.points +
        "p"
    );
  }
  bonusPts = finalPoints;
  const ptsTag = document.getElementById("loyalty-points");
  if (ptsTag) {
    if (bonusPts > 0) {
      ptsTag.innerHTML =
        '<div>적립 포인트: <span class="font-bold">' +
        bonusPts +
        "p</span></div>" +
        '<div class="text-2xs opacity-70 mt-1">' +
        pointsDetail.join(", ") +
        "</div>";
      ptsTag.style.display = "block";
    } else {
      ptsTag.textContent = "적립 포인트: 0p";
      ptsTag.style.display = "block";
    }
  }
};

const handleStockInfoUpdate = function () {
  let infoMsg = "";
  prodList.forEach((item) => {
    if (item.quantity < QUANTITY_THRESHOLDS.LOW_STOCK) {
      if (item.quantity > 0) {
        infoMsg =
          infoMsg + item.name + ": 재고 부족 (" + item.quantity + "개 남음)\n";
      } else {
        infoMsg = infoMsg + item.name + ": 품절\n";
      }
    }
  });
  stockInfo.textContent = infoMsg;
};

function doUpdatePricesInCart() {
  let totalCount = 0;
  let j = 0;

  while (cartDisplay.children[j]) {
    const quantity = cartDisplay.children[j].querySelector(".quantity-number");
    totalCount += quantity ? parseInt(quantity.textContent) : 0;
    j++;
  }
  totalCount = 0;
  for (j = 0; j < cartDisplay.children.length; j++) {
    totalCount += parseInt(
      cartDisplay.children[j].querySelector(".quantity-number").textContent
    );
  }
  updateCartItemPrices({ cartDisplay, products: prodList });
  handleCalculateCartStuff();
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
    let product = null;

    for (let prdIdx = 0; prdIdx < prodList.length; prdIdx++) {
      if (prodList[prdIdx].id === prodId) {
        product = prodList[prdIdx];
        break;
      }
    }
    if (target.classList.contains(CSS_CLASS_NAMES.QUANTITY_CHANGE)) {
      const qtyChange = parseInt(target.dataset.change);
      const qtyElem = itemElem.querySelector(".quantity-number");
      const currentQty = parseInt(qtyElem.textContent);
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
      const remQty = parseInt(qtyElem.textContent);
      product.quantity += remQty;
      itemElem.remove();
    }

    handleCalculateCartStuff();
    updateProductOptions({ selectElement, products: prodList });
  }
});
