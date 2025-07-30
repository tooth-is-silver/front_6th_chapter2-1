import { useState } from "react";
import { Product, DiscountInfo, DISCOUNT_RATES } from "../types";

export function useDiscounts() {
  const [lightningProducts, setLightningProducts] = useState<Set<string>>(
    new Set()
  );
  const [suggestedProducts, setSuggestedProducts] = useState<Set<string>>(
    new Set()
  );

  const calculateIndividualDiscount = (
    product: Product,
    quantity: number
  ): DiscountInfo => {
    if (quantity < 10) {
      return { type: "individual", rate: 0, applicable: false, amount: 0 };
    }

    let individualRate = Number(DISCOUNT_RATES.DEFAULT);
    switch (product.id) {
      case "p1":
        individualRate = DISCOUNT_RATES.KEYBOARD;
        break;
      case "p2":
        individualRate = DISCOUNT_RATES.MOUSE;
        break;
      case "p3":
        individualRate = DISCOUNT_RATES.MONITOR_ARM;
        break;
      case "p4":
        individualRate = DISCOUNT_RATES.LAPTOP_POUCH;
        break;
      case "p5":
        individualRate = DISCOUNT_RATES.SPEAKER;
        break;
    }

    const amount = product.value * quantity * individualRate;
    return {
      type: "individual",
      rate: individualRate,
      applicable: true,
      amount,
    };
  };

  const calculateBulkDiscount = (
    totalQuantity: number,
    totalAmount: number
  ): DiscountInfo => {
    if (totalQuantity < 30) {
      return { type: "bulk", rate: 0, applicable: false, amount: 0 };
    }

    const bulkRate = DISCOUNT_RATES.BULK_DISCOUNT;
    const amount = totalAmount * bulkRate;
    return { type: "bulk", rate: bulkRate, applicable: true, amount };
  };

  const calculateTuesdayDiscount = (amount: number): DiscountInfo => {
    const isTuesday = new Date().getDay() === 2;
    if (!isTuesday) {
      return { type: "tuesday", rate: 0, applicable: false, amount: 0 };
    }

    const tuesdayRate = DISCOUNT_RATES.TUESDAY_DISCOUNT;
    const discountAmount = amount * tuesdayRate;
    return {
      type: "tuesday",
      rate: tuesdayRate,
      applicable: true,
      amount: discountAmount,
    };
  };

  const calculateLightningDiscount = (
    product: Product,
    quantity: number
  ): DiscountInfo => {
    if (!lightningProducts.has(product.id)) {
      return { type: "lightning", rate: 0, applicable: false, amount: 0 };
    }

    const lightningRate = DISCOUNT_RATES.LIGHTNING_SALE;
    const amount = product.originalValue * quantity * lightningRate;
    return { type: "lightning", rate: lightningRate, applicable: true, amount };
  };

  const calculateSuggestedDiscount = (
    product: Product,
    quantity: number
  ): DiscountInfo => {
    if (!suggestedProducts.has(product.id)) {
      return { type: "suggested", rate: 0, applicable: false, amount: 0 };
    }

    const suggestedRate = DISCOUNT_RATES.SUGGESTED_DISCOUNT;
    const amount = product.originalValue * quantity * suggestedRate;
    return { type: "suggested", rate: suggestedRate, applicable: true, amount };
  };

  return {
    lightningProducts,
    suggestedProducts,
    setLightningProducts,
    setSuggestedProducts,
    calculateIndividualDiscount,
    calculateBulkDiscount,
    calculateTuesdayDiscount,
    calculateLightningDiscount,
    calculateSuggestedDiscount,
  };
}
