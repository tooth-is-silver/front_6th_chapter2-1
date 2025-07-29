export function setupAddToCartHandler(
  addBtn,
  sel,
  cartDisp,
  prodList,
  handleCalculateCartStuffWrapper
) {
  addBtn.addEventListener("click", function () {
    let selItem = sel.value;
    const hasItem = prodList.some(product => product.id === selItem);
    if (!selItem || !hasItem) {
      return;
    }
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
        let newItem = document.createElement("div");
        newItem.id = itemToAdd.id;
        newItem.className =
          "grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0";
        newItem.innerHTML = `
          <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
            <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
          </div>
          <div>
            <h3 class="text-base font-normal mb-1 tracking-tight">${
              itemToAdd.onSale && itemToAdd.suggestSale
                ? "⚡💝"
                : itemToAdd.onSale
                ? "⚡"
                : itemToAdd.suggestSale
                ? "💝"
                : ""
            }${itemToAdd.name}</h3>
            <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
            <p class="text-xs text-black mb-3">${
              itemToAdd.onSale || itemToAdd.suggestSale
                ? '<span class="line-through text-gray-400">₩' +
                  itemToAdd.originalVal.toLocaleString() +
                  '</span> <span class="' +
                  (itemToAdd.onSale && itemToAdd.suggestSale
                    ? "text-purple-600"
                    : itemToAdd.onSale
                    ? "text-red-500"
                    : "text-blue-500") +
                  '">₩' +
                  itemToAdd.val.toLocaleString() +
                  "</span>"
                : "₩" + itemToAdd.val.toLocaleString()
            }</p>
            <div class="flex items-center gap-4">
              <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${
                itemToAdd.id
              }" data-change="-1">−</button>
              <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
              <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${
                itemToAdd.id
              }" data-change="1">+</button>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg mb-2 tracking-tight tabular-nums">${
              itemToAdd.onSale || itemToAdd.suggestSale
                ? '<span class="line-through text-gray-400">₩' +
                  itemToAdd.originalVal.toLocaleString() +
                  '</span> <span class="' +
                  (itemToAdd.onSale && itemToAdd.suggestSale
                    ? "text-purple-600"
                    : itemToAdd.onSale
                    ? "text-red-500"
                    : "text-blue-500") +
                  '">₩' +
                  itemToAdd.val.toLocaleString() +
                  "</span>"
                : "₩" + itemToAdd.val.toLocaleString()
            }</div>
            <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${
              itemToAdd.id
            }">Remove</a>
          </div>
        `;
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
