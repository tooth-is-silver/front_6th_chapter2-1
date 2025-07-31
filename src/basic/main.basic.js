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

let sum;
let prodList = [...INITIAL_PRODUCTS];
let bonusPts = 0;
let stockInfo;
let itemCnt = 0;
let lastSel = null;
let selectElement;
let addBtn;
let totalAmt = 0;
let cartDisp;

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

  root = document.getElementById(DOM_IDS.APP);

  header = document.createElement("div");
  header.className = "mb-8";
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;

  selectElement = document.createElement("select");
  selectElement.id = DOM_IDS.PRODUCT_SELECT;
  selectElement.className =
    "w-full p-3 border border-gray-300 rounded-lg text-base mb-3";

  leftColumn = document.createElement("div");
  leftColumn.className = "bg-white border border-gray-200 p-8 overflow-y-auto";

  selectorContainer = document.createElement("div");
  selectorContainer.className = "mb-6 pb-6 border-b border-gray-200";

  gridContainer = document.createElement("div");
  gridContainer.className =
    "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden";

  stockInfo = document.createElement("div");
  stockInfo.id = DOM_IDS.STOCK_STATUS;
  stockInfo.className = "text-xs text-red-500 mt-3 whitespace-pre-line";

  addBtn = document.createElement("button");
  addBtn.id = DOM_IDS.ADD_TO_CART;
  addBtn.innerHTML = "Add to Cart";
  addBtn.className =
    "w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all";

  selectorContainer.appendChild(selectElement);
  selectorContainer.appendChild(addBtn);
  selectorContainer.appendChild(stockInfo);

  leftColumn.appendChild(selectorContainer);
  cartDisp = document.createElement("div");
  leftColumn.appendChild(cartDisp);
  cartDisp.id = DOM_IDS.CART_ITEMS;
  rightColumn = document.createElement("div");
  rightColumn.className = "bg-black text-white p-8 flex flex-col";
  rightColumn.innerHTML = `
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;

  sum = rightColumn.querySelector("#cart-total");

  manualToggle = document.createElement("button");
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle("hidden");
    manualColumn.classList.toggle("translate-x-full");
  };
  manualToggle.className =
    "fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50";
  manualToggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;

  manualOverlay = document.createElement("div");
  manualOverlay.className =
    "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300";
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add("hidden");
      manualColumn.classList.add("translate-x-full");
    }
  };

  manualColumn = document.createElement("div");
  manualColumn.className =
    "fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300";
  manualColumn.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br>
            • ⚡번개세일: 20%<br>
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br>
            • 키보드+마우스: +50p<br>
            • 풀세트: +100p<br>
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `;

  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);

  onUpdateSelectOptions();
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
        onUpdateSelectOptions();
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
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, TIMING.SUGGESTION_INTERVAL);
  }, Math.random() * TIMING.SUGGESTION_DELAY_MAX);
}

function onUpdateSelectOptions() {
  let totalStock = 0;
  let discountText = "";

  selectElement.innerHTML = "";

  for (let idx = 0; idx < prodList.length; idx++) {
    const product = prodList[idx];
    totalStock = totalStock + product.quantity;
  }
  for (let i = 0; i < prodList.length; i++) {
    (function () {
      const item = prodList[i];
      const optionElement = document.createElement("option");
      optionElement.value = item.id;
      if (item.isOnLightningSale) discountText += " ⚡SALE";
      if (item.isSuggestedSale) discountText += " 💝추천";
      if (item.quantity === 0) {
        optionElement.textContent =
          item.name + " - " + item.price + "원 (품절)" + discountText;
        optionElement.disabled = true;
        optionElement.className = "text-gray-400";
      } else {
        if (item.isOnLightningSale && item.isSuggestedSale) {
          optionElement.textContent =
            "⚡💝" +
            item.name +
            " - " +
            item.originalPrice +
            "원 → " +
            item.price +
            "원 (25% SUPER SALE!)";
          optionElement.className = "text-purple-600 font-bold";
        } else if (item.isOnLightningSale) {
          optionElement.textContent =
            "⚡" +
            item.name +
            " - " +
            item.originalPrice +
            "원 → " +
            item.price +
            "원 (20% SALE!)";
          optionElement.className = "text-red-500 font-bold";
        } else if (item.isSuggestedSale) {
          optionElement.textContent =
            "💝" +
            item.name +
            " - " +
            item.originalPrice +
            "원 → " +
            item.price +
            "원 (5% 추천할인!)";
          optionElement.className = "text-blue-500 font-bold";
        } else {
          optionElement.textContent =
            item.name + " - " + item.price + "원" + discountText;
        }
      }
      selectElement.appendChild(optionElement);
    })();
  }

  if (totalStock < MAGIC_NUMBERS.STOCK_WARNING_THRESHOLD) {
    selectElement.style.borderColor = "orange";
  } else {
    selectElement.style.borderColor = "";
  }
}

function handleCalculateCartStuff() {
  let cartItems = cartDisp.children;
  let subTotalPrice = 0;
  let itemDiscounts = [];
  let lowStockItems = [];
  let summaryDetails = document.getElementById(DOM_IDS.SUMMARY_DETAILS);
  let itemCountElement = document.getElementById(DOM_IDS.ITEM_COUNT);

  totalAmt = 0;
  itemCnt = 0;

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
      itemCnt += quantity;
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
  if (itemCnt >= QUANTITY_THRESHOLDS.BULK_DISCOUNT) {
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
  const tuesdaySpecial = document.getElementById(DOM_IDS.TUESDAY_SPECIAL);
  if (isTuesday) {
    if (totalAmt > 0) {
      totalAmt =
        (totalAmt *
          (MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER -
            DISCOUNT_RATES.TUESDAY * MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER)) /
        MAGIC_NUMBERS.PERCENTAGE_MULTIPLIER;

      discRate = 1 - totalAmt / originalTotal;
      tuesdaySpecial.classList.remove("hidden");
    } else {
      tuesdaySpecial.classList.add("hidden");
    }
  } else {
    tuesdaySpecial.classList.add("hidden");
  }
  itemCountElement.textContent = "🛍️ " + itemCnt + " items in cart";

  summaryDetails.innerHTML = "";
  if (subTotalPrice > 0) {
    for (let i = 0; i < cartItems.length; i++) {
      let curItem;
      for (let j = 0; j < prodList.length; j++) {
        if (prodList[j].id === cartItems[i].id) {
          curItem = prodList[j];
          break;
        }
      }
      const qtyElem = cartItems[i].querySelector(CSS_SELECTORS.QUANTITY_NUMBER);
      const quantity = parseInt(qtyElem.textContent);
      const itemTotal = curItem.price * quantity;
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${curItem.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }

    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${subTotalPrice.toLocaleString()}</span>
      </div>
    `;

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
      if (totalAmt > 0) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-purple-400">
            <span class="text-xs">🌟 화요일 추가 할인</span>
            <span class="text-xs">-10%</span>
          </div>
        `;
      }
    }

    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }

  const totalPriceElement = sum.querySelector(".text-2xl");
  if (totalPriceElement) {
    totalPriceElement.textContent = "₩" + Math.round(totalAmt).toLocaleString();
  }
  const loyaltyPointsDiv = document.getElementById("loyalty-points");
  if (loyaltyPointsDiv) {
    const points = Math.floor(totalAmt / 1000);
    if (points > 0) {
      loyaltyPointsDiv.textContent = "적립 포인트: " + points + "p";
      loyaltyPointsDiv.style.display = "block";
    } else {
      loyaltyPointsDiv.textContent = "적립 포인트: 0p";
      loyaltyPointsDiv.style.display = "block";
    }
  }

  const discountInfoDiv = document.getElementById(DOM_IDS.DISCOUNT_INFO);

  if (discRate > 0 && totalAmt > 0) {
    const savedAmount = originalTotal - totalAmt;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(
            discRate * 100
          ).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(
          savedAmount
        ).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }

  if (itemCountElement) {
    const previousCount = parseInt(
      itemCountElement.textContent.match(/\d+/) || 0
    );
    itemCountElement.textContent = "🛍️ " + itemCnt + " items in cart";
    if (previousCount !== itemCnt) {
      itemCountElement.setAttribute("data-changed", "true");
    }
  }

  let stockMsg = "";
  for (let stockIdx = 0; stockIdx < prodList.length; stockIdx++) {
    const item = prodList[stockIdx];
    if (item.quantity < QUANTITY_THRESHOLDS.LOW_STOCK) {
      if (item.quantity > 0) {
        stockMsg += item.name + ": 재고 부족 (" + item.quantity + "개 남음)\n";
      } else {
        stockMsg += item.name + ": 품절\n";
      }
    }
  }
  stockInfo.textContent = stockMsg;

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
  let nodes = cartDisp.children;

  if (cartDisp.children.length === 0) {
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

  if (itemCnt >= POINTS_CONFIG.QUANTITY_BONUS.TIER_3.min) {
    finalPoints = finalPoints + POINTS_CONFIG.QUANTITY_BONUS.TIER_3.points;
    pointsDetail.push(
      "대량구매(" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_3.min +
        "개+) +" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_3.points +
        "p"
    );
  } else if (itemCnt >= POINTS_CONFIG.QUANTITY_BONUS.TIER_2.min) {
    finalPoints = finalPoints + POINTS_CONFIG.QUANTITY_BONUS.TIER_2.points;
    pointsDetail.push(
      "대량구매(" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_2.min +
        "개+) +" +
        POINTS_CONFIG.QUANTITY_BONUS.TIER_2.points +
        "p"
    );
  } else if (itemCnt >= POINTS_CONFIG.QUANTITY_BONUS.TIER_1.min) {
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

  while (cartDisp.children[j]) {
    const quantity = cartDisp.children[j].querySelector(".quantity-number");
    totalCount += quantity ? parseInt(quantity.textContent) : 0;
    j++;
  }
  totalCount = 0;
  for (j = 0; j < cartDisp.children.length; j++) {
    totalCount += parseInt(
      cartDisp.children[j].querySelector(".quantity-number").textContent
    );
  }
  let cartItems = cartDisp.children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    let product = null;

    for (let productIdx = 0; productIdx < prodList.length; productIdx++) {
      if (prodList[productIdx].id === itemId) {
        product = prodList[productIdx];
        break;
      }
    }
    if (product) {
      const priceDiv = cartItems[i].querySelector(".text-lg");
      const nameDiv = cartItems[i].querySelector("h3");
      if (product.isOnLightningSale && product.isSuggestedSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalPrice.toLocaleString() +
          '</span> <span class="text-purple-600">₩' +
          product.price.toLocaleString() +
          "</span>";
        nameDiv.textContent = "⚡💝" + product.name;
      } else if (product.isOnLightningSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalPrice.toLocaleString() +
          '</span> <span class="text-red-500">₩' +
          product.price.toLocaleString() +
          "</span>";
        nameDiv.textContent = "⚡" + product.name;
      } else if (product.isSuggestedSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalPrice.toLocaleString() +
          '</span> <span class="text-blue-500">₩' +
          product.price.toLocaleString() +
          "</span>";
        nameDiv.textContent = "💝" + product.name;
      } else {
        priceDiv.textContent = "₩" + product.price.toLocaleString();
        nameDiv.textContent = product.name;
      }
    }
  }
  handleCalculateCartStuff();
}

main();

addBtn.addEventListener("click", function () {
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
      const newItem = document.createElement("div");
      newItem.id = itemToAdd.id;
      newItem.className =
        "grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0";
      newItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${
            itemToAdd.isOnLightningSale && itemToAdd.isSuggestedSale
              ? "⚡💝"
              : itemToAdd.isOnLightningSale
              ? "⚡"
              : itemToAdd.isSuggestedSale
              ? "💝"
              : ""
          }${itemToAdd.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${
            itemToAdd.isOnLightningSale || itemToAdd.isSuggestedSale
              ? '<span class="line-through text-gray-400">₩' +
                itemToAdd.originalPrice.toLocaleString() +
                '</span> <span class="' +
                (itemToAdd.isOnLightningSale && itemToAdd.isSuggestedSale
                  ? "text-purple-600"
                  : itemToAdd.isOnLightningSale
                  ? "text-red-500"
                  : "text-blue-500") +
                '">₩' +
                itemToAdd.price.toLocaleString() +
                "</span>"
              : "₩" + itemToAdd.price.toLocaleString()
          }</p>
          <div class="flex items-center gap-4">
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${
              itemToAdd.id
            }" data-change="-1">−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${
              itemToAdd.id
            }" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg mb-2 tracking-tight tabular-nums">${
            itemToAdd.isOnLightningSale || itemToAdd.isSuggestedSale
              ? '<span class="line-through text-gray-400">₩' +
                itemToAdd.originalPrice.toLocaleString() +
                '</span> <span class="' +
                (itemToAdd.isOnLightningSale && itemToAdd.isSuggestedSale
                  ? "text-purple-600"
                  : itemToAdd.isOnLightningSale
                  ? "text-red-500"
                  : "text-blue-500") +
                '">₩' +
                itemToAdd.price.toLocaleString() +
                "</span>"
              : "₩" + itemToAdd.price.toLocaleString()
          }</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${
            itemToAdd.id
          }">Remove</a>
        </div>
      `;
      cartDisp.appendChild(newItem);
      itemToAdd.quantity--;
    }
    handleCalculateCartStuff();
    lastSel = selItem;
  }
});

cartDisp.addEventListener("click", (event) => {
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
    onUpdateSelectOptions();
  }
});
