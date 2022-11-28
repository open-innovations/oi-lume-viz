/**
 * Generator function to return a counter function which can be used to create incrementing numbers
 * on each call.
 * 
 * @returns A function which returns the next number each time it's called.
 */
 export const counter = () => {
  let i = 0;
  function* sequentialNumberGenerator() {
    while (true) yield i++;
  }
  const sequentialNumber = sequentialNumberGenerator();
  return () => sequentialNumber.next().value;
}