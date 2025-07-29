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

  return {
    totalAmount: finalTotal,
    bonusPoints: pointsData.points,
  };
}
