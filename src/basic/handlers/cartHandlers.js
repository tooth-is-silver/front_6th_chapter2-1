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
    let selItem = sel.value;
    const hasItem = prodList.some(product => product.id === selItem);
    if (!selItem || !hasItem) {
      return;
    }
    
    // Context에 마지막 선택 상품 업데이트 (리액트에서는 setState로 처리 예정)
    context.setLastSelected(selItem);
    
    const itemToAdd = prodList.find(product => product.id === selItem);
    if (itemToAdd && itemToAdd.q > 0) {
      let item = document.getElementById(itemToAdd["id"]);
      if (item) {
        let qtyElem = item.querySelector(".quantity-number");
        let newQty = parseInt(qtyElem["textContent"]) + 1;
        if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent)) {
          qtyElem.textContent = newQty;
          itemToAdd["q"]--;
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
      return selItem;
    }
  });
}

export function setupCartItemHandler(
  cartDisp,
  prodList,
  handleCalculateCartStuffWrapper,
  onUpdateSelectOptions
) {
  cartDisp.addEventListener("click", function (event) {
    let tgt = event.target;
    if (
      tgt.classList.contains("quantity-change") ||
      tgt.classList.contains("remove-item")
    ) {
      let prodId = tgt.dataset.productId;
      let itemElem = document.getElementById(prodId);
      const prod = prodList.find(product => product.id === prodId);
      if (tgt.classList.contains("quantity-change")) {
        let qtyChange = parseInt(tgt.dataset.change);
        let qtyElem = itemElem.querySelector(".quantity-number");
        let currentQty = parseInt(qtyElem.textContent);
        let newQty = currentQty + qtyChange;
        if (newQty > 0 && newQty <= prod.q + currentQty) {
          qtyElem.textContent = newQty;
          prod.q -= qtyChange;
        } else if (newQty <= 0) {
          prod.q += currentQty;
          itemElem.remove();
        } else {
          alert("재고가 부족합니다.");
        }
      } else if (tgt.classList.contains("remove-item")) {
        let qtyElem = itemElem.querySelector(".quantity-number");
        let remQty = parseInt(qtyElem.textContent);
        prod.q += remQty;
        itemElem.remove();
      }
      handleCalculateCartStuffWrapper();
      onUpdateSelectOptions();
    }
  });
}
