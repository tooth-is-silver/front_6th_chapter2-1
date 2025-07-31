import { useMemo, useCallback } from "react";
import type { CartItem } from "../types";
import { DISCOUNT_THRESHOLDS, QUANTITY_CHANGE } from "../constants";

type CartItemProps = {
  item: CartItem;
  onQuantityChange: (productId: string, change: number) => void;
  onRemove: (productId: string) => void;
};

type CartDisplayProps = {
  items: CartItem[];
  onQuantityChange: (productId: string, change: number) => void;
  onRemove: (productId: string) => void;
};

function CartItemComponent({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const { product, quantity } = item;

  const priceDisplay = useMemo(() => {
    if (product.isOnLightningSale && product.isSuggestedSale) {
      return (
        <>
          <span className="line-through text-gray-400">
            ₩{product.originalPrice.toLocaleString()}
          </span>{" "}
          <span className="text-purple-600">
            ₩{product.price.toLocaleString()}
          </span>
        </>
      );
    } else if (product.isOnLightningSale) {
      return (
        <>
          <span className="line-through text-gray-400">
            ₩{product.originalPrice.toLocaleString()}
          </span>{" "}
          <span className="text-red-500">
            ₩{product.price.toLocaleString()}
          </span>
        </>
      );
    } else if (product.isSuggestedSale) {
      return (
        <>
          <span className="line-through text-gray-400">
            ₩{product.originalPrice.toLocaleString()}
          </span>{" "}
          <span className="text-blue-500">
            ₩{product.price.toLocaleString()}
          </span>
        </>
      );
    } else {
      return `₩${product.price.toLocaleString()}`;
    }
  }, [
    product.isOnLightningSale,
    product.isSuggestedSale,
    product.originalPrice,
    product.price,
  ]);

  const nameDisplay = useMemo(() => {
    const saleIcon =
      product.isOnLightningSale && product.isSuggestedSale
        ? "⚡💝"
        : product.isOnLightningSale
        ? "⚡"
        : product.isSuggestedSale
        ? "💝"
        : "";
    return saleIcon + product.name;
  }, [product.isOnLightningSale, product.isSuggestedSale, product.name]);

  const shouldBoldPrice = quantity >= DISCOUNT_THRESHOLDS.INDIVIDUAL_DISCOUNT;

  const handleDecrease = useCallback(() => {
    onQuantityChange(product.id, QUANTITY_CHANGE.DECREASE);
  }, [onQuantityChange, product.id]);

  const handleIncrease = useCallback(() => {
    onQuantityChange(product.id, QUANTITY_CHANGE.INCREASE);
  }, [onQuantityChange, product.id]);

  const handleRemove = useCallback(() => {
    onRemove(product.id);
  }, [onRemove, product.id]);

  return (
    <div className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0">
      <div className="w-20 h-20 bg-gradient-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
      </div>

      <div>
        <h3 className="text-base font-normal mb-1 tracking-tight">
          {nameDisplay}
        </h3>
        <p className="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
        <p className="text-xs text-black mb-3">{priceDisplay}</p>

        <div className="flex items-center gap-4">
          <button
            onClick={handleDecrease}
            className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
          >
            {`−`}
          </button>
          <span className="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">
            {quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      <div className="text-right">
        <div
          className={`text-lg mb-2 tracking-tight tabular-nums ${
            shouldBoldPrice ? "font-bold" : ""
          }`}
        >
          {priceDisplay}
        </div>
        <button
          onClick={handleRemove}
          className="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export function CartDisplay({
  items,
  onQuantityChange,
  onRemove,
}: CartDisplayProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        장바구니가 비어있습니다.
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <CartItemComponent
          key={item.product.id}
          item={item}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
