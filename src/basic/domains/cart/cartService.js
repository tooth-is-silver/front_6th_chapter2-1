import {
  PRODUCT_IDS,
  DISCOUNT_RATES,
  QUANTITY_THRESHOLDS,
  MAGIC_NUMBERS,
} from "../../shared/constants/index.js";

export function calculateItemDiscount(productId, quantity) {
  if (quantity < QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT) {
    return 0;
  }

  const discountRates = {
    [PRODUCT_IDS.KEYBOARD]: DISCOUNT_RATES.INDIVIDUAL.KEYBOARD,
    [PRODUCT_IDS.MOUSE]: DISCOUNT_RATES.INDIVIDUAL.MOUSE,
    [PRODUCT_IDS.MONITOR_ARM]: DISCOUNT_RATES.INDIVIDUAL.MONITOR_ARM,
    [PRODUCT_IDS.LAPTOP_POUCH]: DISCOUNT_RATES.INDIVIDUAL.LAPTOP_POUCH,
    [PRODUCT_IDS.SPEAKER]: DISCOUNT_RATES.INDIVIDUAL.SPEAKER,
  };

  return discountRates[productId] || 0;
}

export function calculateSubtotal(cartItems, products) {
  let subtotal = 0;
  let totalItemCount = 0;
  const itemDiscounts = [];

  for (let i = 0; i < cartItems.length; i++) {
    const cartItem = cartItems[i];
    const product = products.find((p) => p.id === cartItem.id);

    if (product) {
      const quantity = parseInt(
        cartItem.querySelector(".quantity-number").textContent
      );
      const itemTotal = product.price * quantity;

      subtotal += itemTotal;
      totalItemCount += quantity;

      const discountRate = calculateItemDiscount(product.id, quantity);
      if (discountRate > 0) {
        itemDiscounts.push({
          name: product.name,
          discount: discountRate * 100,
        });
      }
    }
  }

  return { subtotal, totalItemCount, itemDiscounts };
}

export function applyDiscounts(subtotal, totalItemCount) {
  let finalTotal = subtotal;
  let discountRate = 0;

  if (totalItemCount >= QUANTITY_THRESHOLDS.BULK_DISCOUNT) {
    finalTotal = subtotal * (1 - DISCOUNT_RATES.BULK);
    discountRate = DISCOUNT_RATES.BULK;
  } else {
    finalTotal = subtotal;
    discountRate = (subtotal - finalTotal) / subtotal;
  }

  return { finalTotal, discountRate };
}

export function applyTuesdayDiscount(total, isTuesday) {
  if (!isTuesday || total <= 0) {
    return total;
  }

  return total * (1 - DISCOUNT_RATES.TUESDAY);
}

export function calculateFinalTotal(subtotal, totalItemCount) {
  let total = subtotal;

  if (totalItemCount >= QUANTITY_THRESHOLDS.BULK_DISCOUNT) {
    total = subtotal * (1 - DISCOUNT_RATES.BULK);
  } else {
    total = subtotal;
  }

  const today = new Date();
  const isTuesday = today.getDay() === MAGIC_NUMBERS.TUESDAY_DAY_INDEX;

  if (isTuesday) {
    total = applyTuesdayDiscount(total, isTuesday);
  }

  const originalTotal = subtotal;
  const discountRate = total > 0 ? 1 - total / originalTotal : 0;

  return {
    finalTotal: total,
    discountRate,
    originalTotal: subtotal,
    isTuesday,
  };
}

export function getCartItemQuantity(cartItem) {
  const qtyElem = cartItem.querySelector(".quantity-number");
  return qtyElem ? parseInt(qtyElem.textContent) : 0;
}

export function updateCartItemQuantity(cartItem, newQuantity) {
  const qtyElem = cartItem.querySelector(".quantity-number");
  if (qtyElem) {
    qtyElem.textContent = newQuantity;
  }
}
