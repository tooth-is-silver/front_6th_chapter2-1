import { useCartContext } from "../context/CartContext.js";
import { createCartItemElement } from "../components/CartItemTemplate.js";

export function setupAddToCartHandler(
  addBtn,
  sel,
  cartDisp,
  prodList,
  handleCalculateCartStuffWrapper
) {
  const context = useCartContext();
  addBtn.addEventListener("click", function () {
    const selectedItemId = sel.value;
    const hasItem = prodList.some((product) => product.id === selectedItemId);
    if (!selectedItemId || !hasItem) {
      return;
    }

    // Context에 마지막 선택 상품 업데이트 (리액트에서는 setState로 처리 예정)
    context.setLastSelected(selectedItemId);

    const itemToAdd = prodList.find((product) => product.id === selectedItemId);
    
    // 재고 검사
    if (!itemToAdd || itemToAdd.q <= 0) {
      return;
    }
    
    const existingCartItem = document.getElementById(itemToAdd.id);
    if (existingCartItem) {
        const qtyElement = existingCartItem.querySelector(".quantity-number");
        const currentQty = parseInt(qtyElement.textContent);
        const newQty = currentQty + 1;
        if (newQty <= itemToAdd.q + currentQty) {
          qtyElement.textContent = newQty;
          itemToAdd.q--;
        } else {
          alert("재고가 부족합니다.");
        }
      } else {
        // 새로운 컴포넌트 기반 아이템 생성 (리액트 마이그레이션 대비)
        const newItem = createCartItemElement(itemToAdd, 1);
        cartDisp.appendChild(newItem);
        itemToAdd.q--;
    }
    
    handleCalculateCartStuffWrapper();
    return selectedItemId;
  });
}

export function setupCartItemHandler(
  cartDisp,
  prodList,
  handleCalculateCartStuffWrapper,
  onUpdateSelectOptions
) {
  cartDisp.addEventListener("click", function (event) {
    const target = event.target;
    const isQuantityChange = target.classList.contains("quantity-change");
    const isRemoveItem = target.classList.contains("remove-item");
    
    // 관련 없는 클릭은 무시
    if (!isQuantityChange && !isRemoveItem) {
      return;
    }
    const productId = target.dataset.productId;
    const cartItemElement = document.getElementById(productId);
    const product = prodList.find((prod) => prod.id === productId);
    
    // DOM 요소 및 수량 정보 추출
    const qtyElement = cartItemElement.querySelector(".quantity-number");
    const currentQty = parseInt(qtyElement.textContent);
    
    if (isQuantityChange) {
      const quantityChange = parseInt(target.dataset.change);
      const newQty = currentQty + quantityChange;
      
      if (newQty > 0 && newQty <= product.q + currentQty) {
        qtyElement.textContent = newQty;
        product.q -= quantityChange;
      } else if (newQty <= 0) {
        product.q += currentQty;
        cartItemElement.remove();
      } else {
        alert("재고가 부족합니다.");
      }
    } else if (isRemoveItem) {
      product.q += currentQty;
      cartItemElement.remove();
    }
    
    handleCalculateCartStuffWrapper();
    onUpdateSelectOptions();
  });
}
