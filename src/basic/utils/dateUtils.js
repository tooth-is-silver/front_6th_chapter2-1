export function getCurrentDay() {
  return new Date().getDay();
}

export function isTuesday() {
  return getCurrentDay() === 2;
}

export function isWeekday(day) {
  return day >= 1 && day <= 5;
}

export function isWeekend(day) {
  return day === 0 || day === 6;
}

export function getCurrentDate() {
  return new Date();
}

export function formatDate(date, format = 'YYYY-MM-DD') {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

export function getDayName(dayIndex) {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[dayIndex] || '알 수 없음';
}