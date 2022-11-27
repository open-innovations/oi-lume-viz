/**
 * Creates a filter to select every nth item in an array
 */
export const everyNth = (n: number) => (_: unknown, i: number) => i % n === 0;
