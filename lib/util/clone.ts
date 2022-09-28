/**
 * Clone an object using the stringify/parse method
 * 
 * @param theObject
 * @returns 
 */
export function clone<T>(theObject: T): T {
  return JSON.parse(JSON.stringify(theObject));
}