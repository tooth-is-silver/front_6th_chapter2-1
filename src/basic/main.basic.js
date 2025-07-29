let prodList;
let bonusPts = 0;
let stockInfo;
let itemCnt;
let lastSel;
let sel;
let addBtn;
let totalAmt = 0;

const PRODUCT_IDS = {
  KEYBOARD: "p1",
  MOUSE: "p2",
  MONITOR_ARM: "p3",
  LAPTOP_POUCH: "p4",
  SPEAKER: "p5",
};

const DISCOUNT_RATES = {
  DEFAULT: 0.1,
  KEYBOARD: 0.1,
  MOUSE: 0.15,
  MONITOR_ARM: 0.2,
  LAPTOP_POUCH: 0.05,
  SPEAKER: 0.25,
  BULK_DISCOUNT: 0.25,
  TUESDAY_DISCOUNT: 0.1,
  LIGHTNING_SALE: 0.2,
  SUGGESTED_DISCOUNT: 0.05,
};

const BULK_ITEM_COUNT = 10;

let cartDisp;

// 상품 목록에서 총 재고 계산
function calculateTotalStock(products) {
  return products.reduce((total, product) => total + product.q, 0);
}

// 상품 옵션 텍스트 생성
function createProductOptionText(product) {
  let discountText = "";
  if (product.onSale) discountText += " ⚡SALE";
  if (product.suggestSale) discountText += " 💝추천";

  if (product.q === 0) {
    return {
      text: product.name + " - " + product.val + "원 (품절)" + discountText,
      disabled: true,
      className: "text-gray-400",
    };
  }

  if (product.onSale && product.suggestSale) {
    return {
      text:
        "⚡💝" +
        product.name +
        " - " +
        product.originalVal +
        "원 → " +
        product.val +
        "원 (25% SUPER SALE!)",
      disabled: false,
      className: "text-purple-600 font-bold",
    };
  } else if (product.onSale) {
    return {
      text:
        "⚡" +
        product.name +
        " - " +
        product.originalVal +
        "원 → " +
        product.val +
        "원 (20% SALE!)",
      disabled: false,
      className: "text-red-500 font-bold",
    };
  } else if (product.suggestSale) {
    return {
      text:
        "💝" +
        product.name +
        " - " +
        product.originalVal +
        "원 → " +
        product.val +
        "원 (5% 추천할인!)",
      disabled: false,
      className: "text-blue-500 font-bold",
    };
  } else {
    return {
      text: product.name + " - " + product.val + "원" + discountText,
      disabled: false,
      className: "",
    };
  }
}

// 상품별 할인율 계산
function calculateProductDiscount(product, quantity) {
  if (quantity < BULK_ITEM_COUNT) return 0;

  switch (product.id) {
    case PRODUCT_IDS.KEYBOARD:
      return DISCOUNT_RATES.KEYBOARD;
    case PRODUCT_IDS.MOUSE:
      return DISCOUNT_RATES.MOUSE;
    case PRODUCT_IDS.MONITOR_ARM:
      return DISCOUNT_RATES.MONITOR_ARM;
    case PRODUCT_IDS.LAPTOP_POUCH:
      return DISCOUNT_RATES.LAPTOP_POUCH;
    case PRODUCT_IDS.SPEAKER:
      return DISCOUNT_RATES.SPEAKER;
    default:
      return 0;
  }
}

// 화요일 할인 계산
function calculateTuesdayDiscount(totalAmount, isTuesday) {
  if (!isTuesday || totalAmount <= 0) return 0;
  return totalAmount * DISCOUNT_RATES.TUESDAY_DISCOUNT;
}

// 대량구매 할인 계산
function calculateBulkDiscount(subtotal, totalQuantity) {
  if (totalQuantity >= 30) {
    return subtotal * DISCOUNT_RATES.BULK_DISCOUNT;
  }
  return 0;
}

// 포인트 계산
function calculatePoints(totalAmount, cartItems, totalQuantity, isTuesday) {
  let basePoints = Math.floor(totalAmount / 1000);
  let finalPoints = basePoints;
  let pointsDetail = [];

  if (basePoints > 0) {
    pointsDetail.push("기본: " + basePoints + "p");
  }

  // 화요일 2배
  if (isTuesday && basePoints > 0) {
    finalPoints = basePoints * 2;
    pointsDetail.push("화요일 2배");
  }

  // 세트 보너스
  const hasKeyboard = cartItems.some(
    (item) => item.id === PRODUCT_IDS.KEYBOARD
  );
  const hasMouse = cartItems.some((item) => item.id === PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartItems.some(
    (item) => item.id === PRODUCT_IDS.MONITOR_ARM
  );

  if (hasKeyboard && hasMouse) {
    finalPoints += 50;
    pointsDetail.push("키보드+마우스 세트 +50p");
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints += 100;
    pointsDetail.push("풀세트 구매 +100p");
  }

  // 수량별 보너스
  if (totalQuantity >= 30) {
    finalPoints += 100;
    pointsDetail.push("대량구매(30개+) +100p");
  } else if (totalQuantity >= 20) {
    finalPoints += 50;
    pointsDetail.push("대량구매(20개+) +50p");
  } else if (totalQuantity >= 10) {
    finalPoints += 20;
    pointsDetail.push("대량구매(10개+) +20p");
  }

  return { points: finalPoints, details: pointsDetail };
}

// 재고 부족 상품 목록 생성
function getLowStockItems(products) {
  return products
    .filter((product) => product.q < 5 && product.q > 0)
    .map((product) => product.name);
}

// 재고 상태 메시지 생성
function generateStockMessage(products) {
  return products
    .filter((product) => product.q < 5)
    .map((product) => {
      if (product.q > 0) {
        return product.name + ": 재고 부족 (" + product.q + "개 남음)";
      } else {
        return product.name + ": 품절";
      }
    })
    .join("\n");
}

import {
  createHeader,
  createSelect,
  createButton,
  createStockInfo,
  createCartDisp,
  createRightColumn,
  createManualToggle,
  createManualOverlay,
  createManualColumn,
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
  totalAmt = 0;
  itemCnt = 0;
  lastSel = null;
  prodList = [
    {
      id: PRODUCT_IDS.KEYBOARD,
      name: "버그 없애는 키보드",
      val: 10000,
      originalVal: 10000,
      q: 50,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.MOUSE,
      name: "생산성 폭발 마우스",
      val: 20000,
      originalVal: 20000,
      q: 30,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.MONITOR_ARM,
      name: "거북목 탈출 모니터암",
      val: 30000,
      originalVal: 30000,
      q: 20,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.LAPTOP_POUCH,
      name: "에러 방지 노트북 파우치",
      val: 15000,
      originalVal: 15000,
      q: 0,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_IDS.SPEAKER,
      name: `코딩할 때 듣는 Lo-Fi 스피커`,
      val: 25000,
      originalVal: 25000,
      q: 10,
      onSale: false,
      suggestSale: false,
    },
  ];
  root = document.getElementById("app");
  header = createHeader();
  sel = createSelect();
  gridContainer = document.createElement("div");
  leftColumn = document.createElement("div");
  leftColumn["className"] =
    "bg-white border border-gray-200 p-8 overflow-y-auto";
  selectorContainer = document.createElement("div");
  selectorContainer.className = "mb-6 pb-6 border-b border-gray-200";
  sel.className = "w-full p-3 border border-gray-300 rounded-lg text-base mb-3";
  gridContainer.className =
    "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden";
  addBtn = createButton();
  stockInfo = createStockInfo();
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
  cartDisp = createCartDisp();
  leftColumn.appendChild(cartDisp);
  cartDisp.id = "cart-items";
  rightColumn = createRightColumn();
  sum = rightColumn.querySelector("#cart-total");
  manualToggle = createManualToggle();
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle("hidden");
    manualColumn.classList.toggle("translate-x-full");
  };
  manualOverlay = createManualOverlay();
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add("hidden");
      manualColumn.classList.add("translate-x-full");
    }
  };
  manualColumn = createManualColumn();
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);
  let initStock = 0;
  for (let i = 0; i < prodList.length; i++) {
    initStock += prodList[i].q;
  }
  onUpdateSelectOptions();
  handleCalculateCartStuff();
  lightningDelay = Math.random() * 10000;
  setTimeout(() => {
    setInterval(function () {
      let luckyIdx = Math.floor(Math.random() * prodList.length);
      let luckyItem = prodList[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round((luckyItem.originalVal * 80) / 100);
        luckyItem.onSale = true;
        alert("⚡번개세일! " + luckyItem.name + "이(가) 20% 할인 중입니다!");
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, 30000);
  }, lightningDelay);
  setTimeout(function () {
    setInterval(function () {
      if (cartDisp.children.length === 0) {
      }
      if (lastSel) {
        let suggest = null;
        for (let k = 0; k < prodList.length; k++) {
          if (prodList[k].id !== lastSel) {
            if (prodList[k].q > 0) {
              if (!prodList[k].suggestSale) {
                suggest = prodList[k];
                break;
              }
            }
          }
        }
        if (suggest) {
          alert(
            "💝 " +
              suggest.name +
              `은(는) 어떠세요? 지금 구매하시면 ${
                DISCOUNT_RATES.SUGGESTED_DISCOUNT * 100
              }% 추가 할인!`
          );
          suggest.val = Math.round((suggest.val * (100 - 5)) / 100);
          suggest.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
}
let sum;

function onUpdateSelectOptions() {
  sel.innerHTML = "";
  const totalStock = calculateTotalStock(prodList);

  for (let i = 0; i < prodList.length; i++) {
    const item = prodList[i];
    const opt = document.createElement("option");
    const optionData = createProductOptionText(item);

    opt.value = item.id;
    opt.textContent = optionData.text;
    opt.disabled = optionData.disabled;
    if (optionData.className) {
      opt.className = optionData.className;
    }

    sel.appendChild(opt);
  }

  if (totalStock < 50) {
    sel.style.borderColor = "orange";
  } else {
    sel.style.borderColor = "";
  }
}

function handleCalculateCartStuff() {
  const cartItems = cartDisp.children;
  let subTot = 0;
  let itemCnt = 0;
  const itemDiscounts = [];
  const cartItemData = [];

  // 장바구니 아이템 데이터 수집
  for (let i = 0; i < cartItems.length; i++) {
    const itemElement = cartItems[i];
    const productId = itemElement.id;
    const product = prodList.find((p) => p.id === productId);

    if (product) {
      const qtyElem = itemElement.querySelector(".quantity-number");
      const quantity = parseInt(qtyElem.textContent);
      const itemTotal = product.val * quantity;
      const discount = calculateProductDiscount(product, quantity);

      subTot += itemTotal;
      itemCnt += quantity;

      if (discount > 0) {
        itemDiscounts.push({ name: product.name, discount: discount * 100 });
      }

      cartItemData.push({
        id: product.id,
        name: product.name,
        quantity: quantity,
        price: product.val,
        total: itemTotal * (1 - discount),
      });
    }
  }

  // 대량구매 할인 우선 적용 (30개 이상 시 개별 할인 무시)
  const originalTotal = subTot;
  let finalTotal = subTot;

  if (itemCnt >= 30) {
    // 30개 이상: 개별 할인 무시하고 전체 25% 할인만 적용
    const bulkDiscount = calculateBulkDiscount(subTot, itemCnt);
    finalTotal = subTot - bulkDiscount;
  } else {
    // 30개 미만: 개별 상품 할인 적용
    let discountedTotal = subTot;
    for (let i = 0; i < cartItems.length; i++) {
      const itemElement = cartItems[i];
      const productId = itemElement.id;
      const product = prodList.find((p) => p.id === productId);

      if (product) {
        const qtyElem = itemElement.querySelector(".quantity-number");
        const quantity = parseInt(qtyElem.textContent);
        const itemTotal = product.val * quantity;
        const discount = calculateProductDiscount(product, quantity);
        discountedTotal -= itemTotal * discount;
      }
    }
    finalTotal = discountedTotal;
  }

  // 화요일 할인
  const today = new Date();
  const isTuesday = today.getDay() === 2;
  const tuesdayDiscount = calculateTuesdayDiscount(finalTotal, isTuesday);
  finalTotal -= tuesdayDiscount;

  // 포인트 계산
  const pointsData = calculatePoints(
    finalTotal,
    cartItemData,
    itemCnt,
    isTuesday
  );

  // UI 업데이트
  updateCartUI(
    finalTotal,
    itemCnt,
    originalTotal,
    itemDiscounts,
    isTuesday,
    pointsData
  );
  updateStockInfo();

  // 전역변수 업데이트
  totalAmt = finalTotal;
  bonusPts = pointsData.points;
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
    for (let i = 0; i < cartItems.length; i++) {
      const itemElement = cartItems[i];
      const productId = itemElement.id;
      const product = prodList.find((p) => p.id === productId);
      const qtyElem = itemElement.querySelector(".quantity-number");
      const quantity = parseInt(qtyElem.textContent);
      const itemTotal = product.val * quantity;

      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${product.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }

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

// 기존 함수 리팩토링
function onGetStockTotal() {
  return calculateTotalStock(prodList);
}

function doUpdatePricesInCart() {
  const cartItems = cartDisp.children;

  for (let i = 0; i < cartItems.length; i++) {
    const itemElement = cartItems[i];
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
  }

  handleCalculateCartStuff();
}

main();
addBtn.addEventListener("click", function () {
  let selItem = sel.value;
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
  if (itemToAdd && itemToAdd.q > 0) {
    let item = document.getElementById(itemToAdd["id"]);
    if (item) {
      let qtyElem = item.querySelector(".quantity-number");
      let newQty = parseInt(qtyElem["textContent"]) + 1;
      if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent)) {
        qtyElem.textContent = newQty;
        itemToAdd["q"]--;
      } else {
        alert("재고가 부족합니다.");
      }
    } else {
      let newItem = document.createElement("div");
      newItem.id = itemToAdd.id;
      newItem.className =
        "grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0";
      newItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${
            itemToAdd.onSale && itemToAdd.suggestSale
              ? "⚡💝"
              : itemToAdd.onSale
              ? "⚡"
              : itemToAdd.suggestSale
              ? "💝"
              : ""
          }${itemToAdd.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${
            itemToAdd.onSale || itemToAdd.suggestSale
              ? '<span class="line-through text-gray-400">₩' +
                itemToAdd.originalVal.toLocaleString() +
                '</span> <span class="' +
                (itemToAdd.onSale && itemToAdd.suggestSale
                  ? "text-purple-600"
                  : itemToAdd.onSale
                  ? "text-red-500"
                  : "text-blue-500") +
                '">₩' +
                itemToAdd.val.toLocaleString() +
                "</span>"
              : "₩" + itemToAdd.val.toLocaleString()
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
            itemToAdd.onSale || itemToAdd.suggestSale
              ? '<span class="line-through text-gray-400">₩' +
                itemToAdd.originalVal.toLocaleString() +
                '</span> <span class="' +
                (itemToAdd.onSale && itemToAdd.suggestSale
                  ? "text-purple-600"
                  : itemToAdd.onSale
                  ? "text-red-500"
                  : "text-blue-500") +
                '">₩' +
                itemToAdd.val.toLocaleString() +
                "</span>"
              : "₩" + itemToAdd.val.toLocaleString()
          }</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${
            itemToAdd.id
          }">Remove</a>
        </div>
      `;
      cartDisp.appendChild(newItem);
      itemToAdd.q--;
    }
    handleCalculateCartStuff();
    lastSel = selItem;
  }
});
cartDisp.addEventListener("click", function (event) {
  let tgt = event.target;
  if (
    tgt.classList.contains("quantity-change") ||
    tgt.classList.contains("remove-item")
  ) {
    let prodId = tgt.dataset.productId;
    let itemElem = document.getElementById(prodId);
    let prod = null;
    for (let prdIdx = 0; prdIdx < prodList.length; prdIdx++) {
      if (prodList[prdIdx].id === prodId) {
        prod = prodList[prdIdx];
        break;
      }
    }
    if (tgt.classList.contains("quantity-change")) {
      let qtyChange = parseInt(tgt.dataset.change);
      let qtyElem = itemElem.querySelector(".quantity-number");
      let currentQty = parseInt(qtyElem.textContent);
      let newQty = currentQty + qtyChange;
      if (newQty > 0 && newQty <= prod.q + currentQty) {
        qtyElem.textContent = newQty;
        prod.q -= qtyChange;
      } else if (newQty <= 0) {
        prod.q += currentQty;
        itemElem.remove();
      } else {
        alert("재고가 부족합니다.");
      }
    } else if (tgt.classList.contains("remove-item")) {
      let qtyElem = itemElem.querySelector(".quantity-number");
      let remQty = parseInt(qtyElem.textContent);
      prod.q += remQty;
      itemElem.remove();
    }
    if (prod && prod.q < 5) {
    }
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  }
});
