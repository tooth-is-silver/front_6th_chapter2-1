export function formatCurrency(amount) {
  return `₩${Math.round(amount).toLocaleString()}`;
}

export function formatPercentage(rate, decimalPlaces = 1) {
  return `${(rate * 100).toFixed(decimalPlaces)}%`;
}

export function parseInteger(value) {
  return parseInt(value) || 0;
}

export function extractNumber(text) {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

export function formatStockMessage(productName, quantity) {
  if (quantity === 0) {
    return `${productName}: 품절`;
  }
  return `${productName}: 재고 부족 (${quantity}개 남음)`;
}

export function formatItemCountMessage(count) {
  return `🛍️ ${count} items in cart`;
}

export function formatPointsMessage(points) {
  return `적립 포인트: ${points}p`;
}