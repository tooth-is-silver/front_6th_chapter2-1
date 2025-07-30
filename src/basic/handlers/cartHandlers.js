import { useCartContext } from "../context/CartContext.js";
import { createCartItemElement } from "../components/CartItemTemplate.js";

export function setupAddToCartHandler(
  addToCartButton,
  productSelector,
  cartDisplayContainer,
  productList,
  calculateCartTotalsCallback
) {
  const context = useCartContext();
  addToCartButton.addEventListener("click", function () {
    const selectedProductId = productSelector.value;
    const isValidProduct = productList.some((product) => product.id === selectedProductId);
    if (!selectedProductId || !isValidProduct) {
      return;
    }

    // Context에 마지막 선택 상품 업데이트 (리액트에서는 setState로 처리 예정)
    context.setLastSelected(selectedProductId);

    const selectedProduct = productList.find((product) => product.id === selectedProductId);
    
    // 재고 검사
    if (!selectedProduct || selectedProduct.quantity <= 0) {
      return;
    }
    
    const existingCartItemElement = document.getElementById(selectedProduct.id);
    if (existingCartItemElement) {
        const quantityElement = existingCartItemElement.querySelector(".quantity-number");
        const currentQuantity = parseInt(quantityElement.textContent);
        const newQuantity = currentQuantity + 1;
        if (newQuantity <= selectedProduct.quantity + currentQuantity) {
          quantityElement.textContent = newQuantity;
          selectedProduct.quantity--;
        } else {
          alert("재고가 부족합니다.");
        }
      } else {
        // 새로운 컴포넌트 기반 아이템 생성 (리액트 마이그레이션 대비)
        const newCartItemElement = createCartItemElement(selectedProduct, 1);
        cartDisplayContainer.appendChild(newCartItemElement);
        selectedProduct.quantity--;
    }
    
    calculateCartTotalsCallback();
    return selectedProductId;
  });
}

export function setupCartItemHandler(
  cartDisplayContainer,
  productList,
  calculateCartTotalsCallback,
  updateSelectOptionsCallback
) {
  cartDisplayContainer.addEventListener("click", function (event) {
    const clickedElement = event.target;
    const isQuantityChangeButton = clickedElement.classList.contains("quantity-change");
    const isRemoveItemButton = clickedElement.classList.contains("remove-item");
    
    // 관련 없는 클릭은 무시
    if (!isQuantityChangeButton && !isRemoveItemButton) {
      return;
    }
    const targetProductId = clickedElement.dataset.productId;
    const cartItemElement = document.getElementById(targetProductId);
    const targetProduct = productList.find((product) => product.id === targetProductId);
    
    // DOM 요소 및 수량 정보 추출
    const quantityElement = cartItemElement.querySelector(".quantity-number");
    const currentQuantity = parseInt(quantityElement.textContent);
    
    if (isQuantityChangeButton) {
      const quantityChangeAmount = parseInt(clickedElement.dataset.change);
      const newQuantity = currentQuantity + quantityChangeAmount;
      
      if (newQuantity > 0 && newQuantity <= targetProduct.quantity + currentQuantity) {
        quantityElement.textContent = newQuantity;
        targetProduct.quantity -= quantityChangeAmount;
      } else if (newQuantity <= 0) {
        targetProduct.quantity += currentQuantity;
        cartItemElement.remove();
      } else {
        alert("재고가 부족합니다.");
      }
    } else if (isRemoveItemButton) {
      targetProduct.quantity += currentQuantity;
      cartItemElement.remove();
    }
    
    calculateCartTotalsCallback();
    updateSelectOptionsCallback();
  });
}
