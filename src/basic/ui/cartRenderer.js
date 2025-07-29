import {
  calculateTotalStock,
  createProductOptionText,
  generateStockMessage,
} from "../data/products.js";

export function updateCartUI(
  finalTotal,
  itemCnt,
  originalTotal,
  itemDiscounts,
  isTuesday,
  pointsData,
  cartDisp,
  prodList,
  sum
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
      .join('');
    
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

export function onUpdateSelectOptions(sel, prodList) {
  sel.innerHTML = "";
  const totalStock = calculateTotalStock(prodList);

  prodList.forEach((item) => {
    const opt = document.createElement("option");
    const optionData = createProductOptionText(item);

    opt.value = item.id;
    opt.textContent = optionData.text;
    opt.disabled = optionData.disabled;
    if (optionData.className) {
      opt.className = optionData.className;
    }

    sel.appendChild(opt);
  });

  if (totalStock < 50) {
    sel.style.borderColor = "orange";
  } else {
    sel.style.borderColor = "";
  }
}

export function updateStockInfo(stockInfo, prodList) {
  const stockMessage = generateStockMessage(prodList);
  stockInfo.textContent = stockMessage;
}

export function doUpdatePricesInCart(
  cartDisp,
  prodList,
  handleCalculateCartStuffWrapper
) {
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
