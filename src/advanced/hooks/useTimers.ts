import { useEffect, useRef } from "react";
import { Product } from "../types";

interface UseTimersProps {
  products: Product[];
  onLightningSale: (productIds: string[]) => void;
  onSuggestedSale: (productIds: string[]) => void;
}

export function useTimers({
  products,
  onLightningSale,
  onSuggestedSale,
}: UseTimersProps) {
  const lightningTimerRef = useRef<number | null>(null);
  const suggestedTimerRef = useRef<number | null>(null);

  const startLightningSale = () => {
    const availableProducts = products.filter((p) => p.quantity > 0);
    if (availableProducts.length === 0) return;

    const randomProduct =
      availableProducts[Math.floor(Math.random() * availableProducts.length)];
    onLightningSale([randomProduct.id]);

    setTimeout(() => {
      onLightningSale([]);
    }, 30000);
  };

  const startSuggestedSale = () => {
    const availableProducts = products.filter((p) => p.quantity > 0);
    if (availableProducts.length === 0) return;

    const randomProduct =
      availableProducts[Math.floor(Math.random() * availableProducts.length)];
    onSuggestedSale([randomProduct.id]);

    setTimeout(() => {
      onSuggestedSale([]);
    }, 60000);
  };

  useEffect(() => {
    lightningTimerRef.current = setInterval(() => {
      startLightningSale();
    }, 30000);

    suggestedTimerRef.current = setInterval(() => {
      startSuggestedSale();
    }, 60000);

    setTimeout(startLightningSale, 1000);
    setTimeout(startSuggestedSale, 2000);

    return () => {
      if (lightningTimerRef.current) {
        clearInterval(lightningTimerRef.current);
      }
      if (suggestedTimerRef.current) {
        clearInterval(suggestedTimerRef.current);
      }
    };
  }, [products]);

  return {
    startLightningSale,
    startSuggestedSale,
  };
}
