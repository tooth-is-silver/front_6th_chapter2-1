import { PRODUCT_IDS } from "../constants/index.js";

// 포인트 계산
export function calculatePoints(
  totalAmount,
  cartItems,
  totalQuantity,
  isTuesday
) {
  let basePoints = Math.floor(totalAmount / 1000);
  let finalPoints = basePoints;
  let pointsDetail = [];

  if (basePoints > 0) {
    pointsDetail.push("기본: " + basePoints + "p");
  }

  // 화요일 2배
  if (isTuesday && basePoints > 0) {
    finalPoints = basePoints * 2;
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

  if (hasKeyboard && hasMouse) {
    finalPoints += 50;
    pointsDetail.push("키보드+마우스 세트 +50p");
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints += 100;
    pointsDetail.push("풀세트 구매 +100p");
  }

  // 수량별 보너스
  if (totalQuantity >= 30) {
    finalPoints += 100;
    pointsDetail.push("대량구매(30개+) +100p");
  } else if (totalQuantity >= 20) {
    finalPoints += 50;
    pointsDetail.push("대량구매(20개+) +50p");
  } else if (totalQuantity >= 10) {
    finalPoints += 20;
    pointsDetail.push("대량구매(10개+) +20p");
  }

  return { points: finalPoints, details: pointsDetail };
}
