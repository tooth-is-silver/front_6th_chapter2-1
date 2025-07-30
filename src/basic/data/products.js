import { PRODUCT_IDS } from "../constants/index.js";

// 상품 데이터
export let productList = [
  {
    id: PRODUCT_IDS.KEYBOARD,
    name: "버그 없애는 키보드",
    value: 10000,
    originalValue: 10000,
    quantity: 50,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MOUSE,
    name: "생산성 폭발 마우스",
    value: 20000,
    originalValue: 20000,
    quantity: 30,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MONITOR_ARM,
    name: "거북목 탈출 모니터암",
    value: 30000,
    originalValue: 30000,
    quantity: 20,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.LAPTOP_POUCH,
    name: "에러 방지 노트북 파우치",
    value: 15000,
    originalValue: 15000,
    quantity: 0,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.SPEAKER,
    name: "코딩할 때 듣는 Lo-Fi 스피커",
    value: 25000,
    originalValue: 25000,
    quantity: 10,
    onSale: false,
    suggestSale: false,
  },
];

// 기본 접근 함수들
export function getProductById(id) {
  return productList.find(product => product.id === id);
}

export function updateProductStock(productId, stockQuantity) {
  const product = getProductById(productId);
  if (product) {
    product.quantity += stockQuantity;
  }
}

// 상품 목록에서 총 재고 계산
export function calculateTotalStock(products = productList) {
  return products.reduce((total, product) => total + product.quantity, 0);
}

// 상품 옵션 텍스트 생성
export function createProductOptionText(product) {
  let discountText = "";
  if (product.onSale) discountText += " ⚡SALE";
  if (product.suggestSale) discountText += " 💝추천";

  if (product.quantity === 0) {
    return {
      text: product.name + " - " + product.value + "원 (품절)" + discountText,
      disabled: true,
      className: "text-gray-400",
    };
  }

  if (product.onSale && product.suggestSale) {
    return {
      text:
        "⚡💝" +
        product.name +
        " - " +
        product.originalValue +
        "원 → " +
        product.value +
        "원 (25% SUPER SALE!)",
      disabled: false,
      className: "text-purple-600 font-bold",
    };
  } else if (product.onSale) {
    return {
      text:
        "⚡" +
        product.name +
        " - " +
        product.originalValue +
        "원 → " +
        product.value +
        "원 (20% SALE!)",
      disabled: false,
      className: "text-red-500 font-bold",
    };
  } else if (product.suggestSale) {
    return {
      text:
        "💝" +
        product.name +
        " - " +
        product.originalValue +
        "원 → " +
        product.value +
        "원 (5% 추천할인!)",
      disabled: false,
      className: "text-blue-500 font-bold",
    };
  } else {
    return {
      text: product.name + " - " + product.value + "원" + discountText,
      disabled: false,
      className: "",
    };
  }
}

// 재고 부족 상품 목록 생성
export function getLowStockItems(products = productList) {
  return products
    .filter((product) => product.quantity < 5 && product.quantity > 0)
    .map((product) => product.name);
}

// 재고 상태 메시지 생성
export function generateStockMessage(products = productList) {
  return products
    .filter((product) => product.quantity < 5)
    .map((product) => {
      if (product.quantity > 0) {
        return product.name + ": 재고 부족 (" + product.quantity + "개 남음)";
      } else {
        return product.name + ": 품절";
      }
    })
    .join("\n");
}