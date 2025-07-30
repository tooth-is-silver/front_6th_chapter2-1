import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Product, CartState } from "../types";

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}

type CartAction =
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "ADD_TO_CART"; payload: { product: Product; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | {
      type: "UPDATE_TOTALS";
      payload: {
        totalAmount: number;
        totalQuantity: number;
        totalDiscountAmount: number;
        bonusPoints: number;
      };
    }
  | { type: "SET_LAST_SELECTED"; payload: string | null }
  | { type: "CLEAR_CART" };

const CartContext = createContext<CartContextValue | undefined>(undefined);

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
  totalDiscountAmount: 0,
  bonusPoints: 0,
  lastSelected: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, { id: product.id, product, quantity }],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "UPDATE_TOTALS":
      return {
        ...state,
        ...action.payload,
      };

    case "SET_LAST_SELECTED":
      return {
        ...state,
        lastSelected: action.payload,
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalAmount: 0,
        totalQuantity: 0,
        totalDiscountAmount: 0,
        bonusPoints: 0,
      };

    default:
      return state;
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
