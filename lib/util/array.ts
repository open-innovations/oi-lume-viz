export function getUniqueItemsFromArray(list: unknown[]): unknown[] {
  return [...new Set(list)];
}