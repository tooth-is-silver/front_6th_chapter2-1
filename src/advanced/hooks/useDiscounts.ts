import { useState } from "react";
import { Product, DiscountInfo, DISCOUNT_RATES } from "../types";

export function useDiscounts() {
  const [lightningProducts, setLightningProducts] = useState<Set<string>>(
    new Set()
  );
  const [suggestedProducts, setSuggestedProducts] = useState<Set<string>>(
    new Set()
  );
  const [rate, setRate] = useState(Number(DISCOUNT_RATES.DEFAULT));

  const calculateIndividualDiscount = (
    product: Product,
    quantity: number
  ): DiscountInfo => {
    if (quantity < 10) {
      return { type: "individual", rate: 0, applicable: false, amount: 0 };
    }

    switch (product.id) {
      case "p1":
        setRate(DISCOUNT_RATES.KEYBOARD);
        break;
      case "p2":
        setRate(DISCOUNT_RATES.MOUSE);
        break;
      case "p3":
        setRate(DISCOUNT_RATES.MONITOR_ARM);
        break;
      case "p4":
        setRate(DISCOUNT_RATES.LAPTOP_POUCH);
        break;
      case "p5":
        setRate(DISCOUNT_RATES.SPEAKER);
        break;
    }

    const amount = product.value * quantity * rate;
    return { type: "individual", rate, applicable: true, amount };
  };

  const calculateBulkDiscount = (
    totalQuantity: number,
    totalAmount: number
  ): DiscountInfo => {
    if (totalQuantity < 30) {
      return { type: "bulk", rate: 0, applicable: false, amount: 0 };
    }

    const rate = DISCOUNT_RATES.BULK_DISCOUNT;
    const amount = totalAmount * rate;
    return { type: "bulk", rate, applicable: true, amount };
  };

  const calculateTuesdayDiscount = (amount: number): DiscountInfo => {
    const isTuesday = new Date().getDay() === 2;
    if (!isTuesday) {
      return { type: "tuesday", rate: 0, applicable: false, amount: 0 };
    }

    const rate = DISCOUNT_RATES.TUESDAY_DISCOUNT;
    const discountAmount = amount * rate;
    return { type: "tuesday", rate, applicable: true, amount: discountAmount };
  };

  const calculateLightningDiscount = (
    product: Product,
    quantity: number
  ): DiscountInfo => {
    if (!lightningProducts.has(product.id)) {
      return { type: "lightning", rate: 0, applicable: false, amount: 0 };
    }

    const rate = DISCOUNT_RATES.LIGHTNING_SALE;
    const amount = product.originalValue * quantity * rate;
    return { type: "lightning", rate, applicable: true, amount };
  };

  const calculateSuggestedDiscount = (
    product: Product,
    quantity: number
  ): DiscountInfo => {
    if (!suggestedProducts.has(product.id)) {
      return { type: "suggested", rate: 0, applicable: false, amount: 0 };
    }

    const rate = DISCOUNT_RATES.SUGGESTED_DISCOUNT;
    const amount = product.originalValue * quantity * rate;
    return { type: "suggested", rate, applicable: true, amount };
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
