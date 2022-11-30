// deno-lint-ignore-file no-explicit-any
/**
 * This is not a pure function
 * 
 * @param obj1 
 * @param obj2 
 * @returns 
 */
export function mergeDeep(
  obj1: any,
  obj2: any,
) {
  for (const p in obj2) {
    try {
      if (obj2[p].constructor == Object) obj1[p] = mergeDeep(obj1[p], obj2[p]);
      else obj1[p] = obj2[p];
    } catch (e) {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}
