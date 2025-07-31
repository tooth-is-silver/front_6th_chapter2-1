import { useState, useCallback, useMemo, useEffect } from "react";
import type { Product, CartItem } from "../types";
import {
  DISCOUNT_THRESHOLDS,
  DISCOUNT_RATES,
  POINTS_SYSTEM,
  INITIAL_PRODUCTS,
  TIMING,
  MESSAGES,
} from "../constants";
import {
  ManualModal,
  Header,
  ProductSelector,
  CartDisplay,
  OrderSummary,
} from "../components";

type ItemDiscount = {
  name: string;
  discount: number;
};

export function CartPage() {
  // 상태 관리
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    INITIAL_PRODUCTS[0].id
  );
  const [lastSelectedProductId, setLastSelectedProductId] = useState<
    string | null
  >(null);

  // 화요일 여부 확인
  const isTuesday = useMemo(() => new Date().getDay() === 2, []);

  // 전체 아이템 개수 계산
  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  // 소계 계산 (할인 적용 전)
  const subTotalPrice = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      ),
    [cartItems]
  );

  // 개별 상품 할인 정보 계산
  const itemDiscounts = useMemo(() => {
    const discounts: ItemDiscount[] = [];

    cartItems.forEach((item) => {
      if (item.quantity >= DISCOUNT_THRESHOLDS.INDIVIDUAL_DISCOUNT) {
        let discountRate = 0;
        switch (item.product.id) {
          case "p1":
            discountRate = DISCOUNT_RATES.INDIVIDUAL.KEYBOARD;
            break;
          case "p2":
            discountRate = DISCOUNT_RATES.INDIVIDUAL.MOUSE;
            break;
          case "p3":
            discountRate = DISCOUNT_RATES.INDIVIDUAL.MONITOR_ARM;
            break;
          case "p4":
            discountRate = DISCOUNT_RATES.INDIVIDUAL.LAPTOP_POUCH;
            break;
          case "p5":
            discountRate = DISCOUNT_RATES.INDIVIDUAL.SPEAKER;
            break;
        }

        if (discountRate > 0) {
          discounts.push({
            name: item.product.name,
            discount: Math.round(discountRate * 100),
          });
        }
      }
    });

    return discounts;
  }, [cartItems]);

  // 총 할인율 및 최종 금액 계산
  const { totalAmount, originalTotal, discountRate } = useMemo(() => {
    let finalAmount = subTotalPrice;
    const originalAmount = subTotalPrice;

    // 대량구매 할인 (30개 이상)
    if (itemCount >= DISCOUNT_THRESHOLDS.BULK_DISCOUNT) {
      finalAmount = finalAmount * (1 - DISCOUNT_RATES.BULK);
    } else {
      // 개별 상품 할인
      cartItems.forEach((item) => {
        if (item.quantity >= DISCOUNT_THRESHOLDS.INDIVIDUAL_DISCOUNT) {
          let discountRate = 0;
          switch (item.product.id) {
            case "p1":
              discountRate = DISCOUNT_RATES.INDIVIDUAL.KEYBOARD;
              break;
            case "p2":
              discountRate = DISCOUNT_RATES.INDIVIDUAL.MOUSE;
              break;
            case "p3":
              discountRate = DISCOUNT_RATES.INDIVIDUAL.MONITOR_ARM;
              break;
            case "p4":
              discountRate = DISCOUNT_RATES.INDIVIDUAL.LAPTOP_POUCH;
              break;
            case "p5":
              discountRate = DISCOUNT_RATES.INDIVIDUAL.SPEAKER;
              break;
          }

          if (discountRate > 0) {
            const itemTotal = item.product.price * item.quantity;
            const discount = itemTotal * discountRate;
            finalAmount -= discount;
          }
        }
      });
    }

    // 화요일 추가 할인
    if (isTuesday && finalAmount > 0) {
      finalAmount = finalAmount * (1 - DISCOUNT_RATES.TUESDAY);
    }

    const totalDiscountRate =
      originalAmount > 0 ? (originalAmount - finalAmount) / originalAmount : 0;

    return {
      totalAmount: Math.max(0, finalAmount),
      originalTotal: originalAmount,
      discountRate: totalDiscountRate,
    };
  }, [subTotalPrice, itemCount, cartItems, isTuesday]);

  // 포인트 계산
  const { bonusPoints, pointsDetails } = useMemo(() => {
    let points = Math.floor(totalAmount * POINTS_SYSTEM.BASE_RATE);
    const details: string[] = [
      `기본 ${Math.floor(totalAmount * POINTS_SYSTEM.BASE_RATE)}p`,
    ];

    // 화요일 2배 적립
    if (isTuesday) {
      points *= POINTS_SYSTEM.TUESDAY_MULTIPLIER;
      details.push("화요일 2배");
    }

    // 콤보 보너스
    const hasKeyboard = cartItems.some((item) => item.product.id === "p1");
    const hasMouse = cartItems.some((item) => item.product.id === "p2");
    const hasMonitorArm = cartItems.some((item) => item.product.id === "p3");

    if (hasKeyboard && hasMouse) {
      points += POINTS_SYSTEM.COMBO_BONUS.KEYBOARD_MOUSE;
      details.push(
        `키보드+마우스 세트 +${POINTS_SYSTEM.COMBO_BONUS.KEYBOARD_MOUSE}p`
      );
    }

    if (hasKeyboard && hasMouse && hasMonitorArm) {
      points += POINTS_SYSTEM.COMBO_BONUS.FULL_SET;
      details.push(`풀세트 구매 +${POINTS_SYSTEM.COMBO_BONUS.FULL_SET}p`);
    }

    // 수량별 보너스
    if (itemCount >= POINTS_SYSTEM.QUANTITY_BONUS.TIER_3.threshold) {
      points += POINTS_SYSTEM.QUANTITY_BONUS.TIER_3.points;
      details.push(
        `대량구매(${POINTS_SYSTEM.QUANTITY_BONUS.TIER_3.threshold}개+) +${POINTS_SYSTEM.QUANTITY_BONUS.TIER_3.points}p`
      );
    } else if (itemCount >= POINTS_SYSTEM.QUANTITY_BONUS.TIER_2.threshold) {
      points += POINTS_SYSTEM.QUANTITY_BONUS.TIER_2.points;
      details.push(
        `대량구매(${POINTS_SYSTEM.QUANTITY_BONUS.TIER_2.threshold}개+) +${POINTS_SYSTEM.QUANTITY_BONUS.TIER_2.points}p`
      );
    } else if (itemCount >= POINTS_SYSTEM.QUANTITY_BONUS.TIER_1.threshold) {
      points += POINTS_SYSTEM.QUANTITY_BONUS.TIER_1.points;
      details.push(
        `대량구매(${POINTS_SYSTEM.QUANTITY_BONUS.TIER_1.threshold}개+) +${POINTS_SYSTEM.QUANTITY_BONUS.TIER_1.points}p`
      );
    }

    return { bonusPoints: points, pointsDetails: details };
  }, [totalAmount, itemCount, isTuesday, cartItems]);

  // 상품 선택 핸들러
  const handleProductSelect = useCallback((productId: string) => {
    setSelectedProductId(productId);
  }, []);

  // 장바구니에 상품 추가
  const handleAddToCart = useCallback(() => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product || product.quantity <= 0) return;

    const existingItemIndex = cartItems.findIndex(
      (item) => item.product.id === selectedProductId
    );

    if (existingItemIndex >= 0) {
      // 기존 아이템 수량 증가
      setCartItems((prev) =>
        prev.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // 새 아이템 추가
      const newCartItem: CartItem = {
        id: `cart-${selectedProductId}-${Date.now()}`,
        product: { ...product },
        quantity: 1,
      };
      setCartItems((prev) => [...prev, newCartItem]);
    }

    // 상품 재고 감소
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProductId ? { ...p, quantity: p.quantity - 1 } : p
      )
    );

    // 마지막 선택 상품 추적 (추천 세일용)
    setLastSelectedProductId(selectedProductId);
  }, [selectedProductId, products, cartItems]);

  // 수량 변경 핸들러
  const handleQuantityChange = useCallback(
    (productId: string, change: number) => {
      setCartItems((prev) => {
        return prev
          .map((item) => {
            if (item.product.id === productId) {
              const newQuantity = item.quantity + change;
              if (newQuantity <= 0) {
                // 상품 재고 복원
                setProducts((prevProducts) =>
                  prevProducts.map((p) =>
                    p.id === productId
                      ? { ...p, quantity: p.quantity + item.quantity }
                      : p
                  )
                );
                return null; // 아이템 제거
              }

              // 재고 조정
              if (change > 0) {
                const product = products.find((p) => p.id === productId);
                if (!product || product.quantity <= 0) return item; // 재고 부족시 변경 없음

                setProducts((prevProducts) =>
                  prevProducts.map((p) =>
                    p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
                  )
                );
              } else {
                setProducts((prevProducts) =>
                  prevProducts.map((p) =>
                    p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
                  )
                );
              }

              return { ...item, quantity: newQuantity };
            }
            return item;
          })
          .filter(Boolean) as CartItem[];
      });
    },
    [products]
  );

  // 아이템 제거 핸들러
  const handleRemoveItem = useCallback(
    (productId: string) => {
      const itemToRemove = cartItems.find(
        (item) => item.product.id === productId
      );
      if (!itemToRemove) return;

      // 재고 복원
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, quantity: p.quantity + itemToRemove.quantity }
            : p
        )
      );

      // 아이템 제거
      setCartItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    },
    [cartItems]
  );

  // 번개세일 효과 - basic 폴더와 동일한 로직
  useEffect(() => {
    const lightningDelay = Math.random() * 10000; // 0-10초 랜덤 지연

    const startLightningTimer = () => {
      const lightningTimer = setInterval(() => {
        setProducts((prev) => {
          const availableProducts = prev.filter(
            (product) => product.quantity > 0 && !product.isOnLightningSale
          );

          if (availableProducts.length === 0) return prev;

          const randomIndex = Math.floor(
            Math.random() * availableProducts.length
          );
          const luckyProduct = availableProducts[randomIndex];

          if (
            luckyProduct &&
            luckyProduct.quantity > 0 &&
            !luckyProduct.isOnLightningSale
          ) {
            alert(
              MESSAGES.LIGHTNING_SALE.replace(
                "{productName}",
                luckyProduct.name
              )
            );

            return prev.map((product) => {
              if (product.id === luckyProduct.id) {
                return {
                  ...product,
                  isOnLightningSale: true,
                  price: Math.round((product.originalPrice * 80) / 100),
                };
              }
              return product;
            });
          }

          return prev;
        });
      }, TIMING.LIGHTNING_SALE_INTERVAL);

      return lightningTimer;
    };

    const delayTimer = setTimeout(() => {
      const lightningTimer = startLightningTimer();
      return () => clearInterval(lightningTimer);
    }, lightningDelay);

    return () => {
      clearTimeout(delayTimer);
    };
  }, []);

  // 추천 상품 효과
  useEffect(() => {
    const suggestedDelay = Math.random() * TIMING.SUGGESTION_DELAY_MAX;

    const startSuggestTimer = () => {
      const suggestTimer = setInterval(() => {
        if (!lastSelectedProductId) return;

        setProducts((prev) => {
          const suggestedProduct = prev.find(
            (product) =>
              product.id !== lastSelectedProductId &&
              product.quantity > 0 &&
              !product.isSuggestedSale
          );

          if (!suggestedProduct) return prev;

          if (
            suggestedProduct.quantity > 0 &&
            !suggestedProduct.isSuggestedSale
          ) {
            alert(
              MESSAGES.SUGGESTED_SALE.replace(
                "{productName}",
                suggestedProduct.name
              )
            );

            return prev.map((product) => {
              if (product.id === suggestedProduct.id) {
                return {
                  ...product,
                  isSuggestedSale: true,
                  price: Math.round((product.price * 95) / 100),
                };
              }
              return product;
            });
          }

          return prev;
        });
      }, TIMING.SUGGESTION_INTERVAL);

      return suggestTimer;
    };

    const delayTimer = setTimeout(() => {
      const suggestTimer = startSuggestTimer();
      return () => clearInterval(suggestTimer);
    }, suggestedDelay);

    return () => {
      clearTimeout(delayTimer);
    };
  }, [lastSelectedProductId]);

  return (
    <>
      <ManualModal />
      <Header itemCount={itemCount} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
        <div className="p-8 bg-white border border-gray-200 p-8 overflow-y-auto">
          <ProductSelector
            products={products}
            selectedProductId={selectedProductId}
            onProductSelect={handleProductSelect}
            onAddToCart={handleAddToCart}
          />

          <CartDisplay
            items={cartItems}
            products={products}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />
        </div>

        <OrderSummary
          cartItems={cartItems}
          subTotalPrice={subTotalPrice}
          totalAmount={totalAmount}
          originalTotal={originalTotal}
          discountRate={discountRate}
          itemCount={itemCount}
          itemDiscounts={itemDiscounts}
          isTuesday={isTuesday}
          bonusPoints={bonusPoints}
          pointsDetails={pointsDetails}
        />
      </div>
    </>
  );
}
