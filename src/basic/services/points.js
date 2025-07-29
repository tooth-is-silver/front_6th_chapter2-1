import { PRODUCT_IDS } from "../constants/index.js";

// 포인트 계산
export function calculatePoints(
  totalAmount,
  cartItems,
  totalQuantity,
  isTuesday
) {
  const basePoints = Math.floor(totalAmount / 1000);
  let totalPoints = basePoints;
  const pointsDetail = [];

  if (basePoints > 0) {
    pointsDetail.push("기본: " + basePoints + "p");
  }

  // 화요일 2배 (기본 포인트를 2배로 대체)
  if (isTuesday && basePoints > 0) {
    totalPoints = basePoints * 2;
    pointsDetail.push("화요일 2배");
  }

  // 세트 보너스
  const hasKeyboard = cartItems.some(
    (item) => item.id === PRODUCT_IDS.KEYBOARD
  );
  const hasMouse = cartItems.some((item) => item.id === PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartItems.some(
    (item) => item.id === PRODUCT_IDS.MONITOR_ARM
  );

  // 세트 보너스 계산
  if (hasKeyboard && hasMouse) {
    totalPoints += 50;
    pointsDetail.push("키보드+마우스 세트 +50p");
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    totalPoints += 100;
    pointsDetail.push("풀세트 구매 +100p");
  }

  // 수량별 보너스 계산
  const quantityBonus = getQuantityBonus(totalQuantity);
  if (quantityBonus.points > 0) {
    totalPoints += quantityBonus.points;
    pointsDetail.push(quantityBonus.description);
  }

  return { points: totalPoints, details: pointsDetail };
}

// 수량별 보너스 계산 함수 (순수 함수로 분리)
function getQuantityBonus(totalQuantity) {
  if (totalQuantity >= 30) {
    return { points: 100, description: "대량구매(30개+) +100p" };
  } else if (totalQuantity >= 20) {
    return { points: 50, description: "대량구매(20개+) +50p" };
  } else if (totalQuantity >= 10) {
    return { points: 20, description: "대량구매(10개+) +20p" };
  }
  return { points: 0, description: "" };
}
