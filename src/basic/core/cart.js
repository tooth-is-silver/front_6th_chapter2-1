import {
  calculateProductDiscount,
  calculateTuesdayDiscount,
  calculateBulkDiscount,
} from "../services/discount.js";
import { calculatePoints } from "../services/points.js";

export function handleCalculateCartStuff(
  cartDisp,
  prodList,
  updateCartUI,
  updateStockInfo
) {
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
      const itemTotal = product.value * quantity;
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
        price: product.value,
        total: itemTotal * (1 - discount),
      });
    }
  }

  // 할인 계산
  const originalTotal = subTot;
  const finalTotal = calculateFinalTotal(subTot, itemCnt, cartItemData);

  // 화요일 할인 적용
  const today = new Date();
  const isTuesday = today.getDay() === 2;
  const tuesdayDiscount = calculateTuesdayDiscount(finalTotal, isTuesday);
  const finalTotalWithTuesday = finalTotal - tuesdayDiscount;

  // 포인트 계산
  const pointsData = calculatePoints(
    finalTotalWithTuesday,
    cartItemData,
    itemCnt,
    isTuesday
  );

  // UI 업데이트
  updateCartUI(
    finalTotalWithTuesday,
    itemCnt,
    originalTotal,
    itemDiscounts,
    isTuesday,
    pointsData
  );
  updateStockInfo();

  return {
    totalAmount: finalTotalWithTuesday,
    bonusPoints: pointsData.points,
  };
}

// 최종 총액 계산
function calculateFinalTotal(subtotal, itemCount, cartItemData) {
  if (itemCount >= 30) {
    // 30개 이상: 대량구매 할인 (25%)
    const bulkDiscount = calculateBulkDiscount(subtotal, itemCount);
    return subtotal - bulkDiscount;
  } else {
    // 30개 미만: 개별 상품 할인 적용
    return cartItemData.reduce((total, item) => total + item.total, 0);
  }
}
