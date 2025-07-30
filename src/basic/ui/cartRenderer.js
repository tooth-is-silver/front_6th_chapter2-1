import {
  calculateTotalStock,
  createProductOptionText,
  generateStockMessage,
} from "../data/products.js";
import {
  CartItemSummaryTemplate,
  SubtotalTemplate,
  DiscountSectionTemplate,
  ShippingInfoTemplate,
  DiscountBannerTemplate,
  PointsInfoTemplate,
} from "../components/OrderSummaryTemplate.js";
import { getProductPriceHTML, getProductDisplayName } from "../utils/productUtils.js";

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
    // 상품별 요약 추가 (컴포넌트 기반)
    const cartItems = cartDisp.children;
    const cartItemsHTML = Array.from(cartItems)
      .map((itemElement) => {
        const productId = itemElement.id;
        const product = prodList.find((p) => p.id === productId);
        const qtyElem = itemElement.querySelector(".quantity-number");
        const quantity = parseInt(qtyElem.textContent);
        const itemTotal = product.value * quantity;

        return CartItemSummaryTemplate({ product, quantity, itemTotal });
      })
      .join('');
    
    summaryDetails.innerHTML += cartItemsHTML;

    summaryDetails.innerHTML += SubtotalTemplate({ originalTotal });

    // 할인 정보 추가 (컴포넌트 기반)
    summaryDetails.innerHTML += DiscountSectionTemplate({ itemCnt, itemDiscounts, isTuesday });

    summaryDetails.innerHTML += ShippingInfoTemplate();
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
      loyaltyPointsDiv.innerHTML = PointsInfoTemplate({ 
        points: pointsData.points, 
        details: pointsData.details 
      });
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
    discountInfoDiv.innerHTML = DiscountBannerTemplate({ discountRate, savedAmount });
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

      // 유틸 함수 사용으로 코드 간소화 (리액트 마이그레이션 대비)
      priceDiv.innerHTML = getProductPriceHTML(product);
      nameDiv.textContent = getProductDisplayName(product);
    }
  });

  handleCalculateCartStuffWrapper();
}
