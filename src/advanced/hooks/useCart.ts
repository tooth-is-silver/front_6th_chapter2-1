import { useCart as useCartContext } from '../context/CartContext';
import { Product } from '../types';

export function useCartOperations() {
  const { state, dispatch } = useCartContext();

  const addToCart = (product: Product, quantity: number = 1) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, quantity }
    });
  };

  const removeFromCart = (productId: string) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: productId, quantity }
      });
    }
  };

  const updateTotals = (totalAmount: number, totalQuantity: number, totalDiscountAmount: number, bonusPoints: number) => {
    dispatch({
      type: 'UPDATE_TOTALS',
      payload: { totalAmount, totalQuantity, totalDiscountAmount, bonusPoints }
    });
  };

  const setLastSelected = (productId: string | null) => {
    dispatch({
      type: 'SET_LAST_SELECTED',
      payload: productId
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return {
    cart: state,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateTotals,
    setLastSelected,
    clearCart
  };
}