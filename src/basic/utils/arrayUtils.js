export function findItemById(items, id) {
  return items.find(item => item.id === id);
}

export function findItemByPredicate(items, predicate) {
  return items.find(predicate);
}

export function filterItems(items, predicate) {
  return items.filter(predicate);
}

export function mapItems(items, mapper) {
  return items.map(mapper);
}

export function reduceItems(items, reducer, initialValue) {
  return items.reduce(reducer, initialValue);
}

export function getRandomItem(items) {
  if (items.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

export function sumBy(items, property) {
  return items.reduce((sum, item) => sum + (item[property] || 0), 0);
}

export function groupBy(items, keyGetter) {
  return items.reduce((groups, item) => {
    const key = keyGetter(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}