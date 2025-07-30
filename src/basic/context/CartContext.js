// CartContext - React 마이그레이션을 고려한 Context 패턴
// 리액트로 변환 시 createContext와 useContext로 쉽게 변경 가능

class CartContext {
  constructor() {
    // 상태 데이터 (리액트에서는 useState/useReducer로 관리될 예정)
    this.state = {
      prodList: [],
      cart: {
        totalAmount: 0,
        bonusPoints: 0,
        itemCount: 0,
      },
      ui: {
        lastSelected: null,
      }
    };

    // DOM 참조 (리액트에서는 useRef로 관리될 예정)
    this.refs = {
      stockStatusDisplay: null,
      productSelectElement: null,
      addToCartButton: null,
      cartItemsContainer: null,
      cartTotalElement: null,
    };

    // 구독자들 (리액트에서는 자동으로 리렌더링됨)
    this.listeners = [];
  }

  // 상태 업데이트 (리액트의 setState 패턴)
  setState(updates) {
    if (updates.prodList !== undefined) {
      this.state.prodList = updates.prodList;
    }
    
    if (updates.cart) {
      this.state.cart = { ...this.state.cart, ...updates.cart };
    }
    
    if (updates.ui) {
      this.state.ui = { ...this.state.ui, ...updates.ui };
    }

    // 구독자들에게 상태 변경 알림
    this.notifyListeners();
  }

  // 상태 조회 (리액트에서는 useContext로 자동 제공)
  getState() {
    return this.state;
  }

  // DOM 참조 설정 (리액트에서는 useRef로 관리)
  setRef(name, element) {
    this.refs[name] = element;
  }

  // DOM 참조 조회
  getRef(name) {
    return this.refs[name];
  }

  // 구독자 등록 (리액트에서는 자동으로 처리됨)
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 구독자들에게 알림
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // 액션 함수들 (리액트에서는 custom hooks로 분리 예정)
  updateCartTotals(totalAmount, bonusPoints, itemCount) {
    this.setState({
      cart: {
        totalAmount,
        bonusPoints, 
        itemCount,
      }
    });
  }

  setLastSelected(productId) {
    this.setState({
      ui: {
        lastSelected: productId,
      }
    });
  }

  setProductList(prodList) {
    this.setState({
      prodList: prodList,
    });
  }
}

// 싱글톤 인스턴스 (리액트에서는 Provider로 교체 예정)
export const cartContext = new CartContext();

// Context 사용을 위한 헬퍼 함수 (리액트의 useContext 역할)
export function useCartContext() {
  return cartContext;
}

// Provider 함수 (리액트에서는 <CartProvider> 컴포넌트로 교체)
export function CartProvider(initialState = {}) {
  if (initialState.prodList) {
    cartContext.setProductList(initialState.prodList);
  }
  
  return cartContext;
}