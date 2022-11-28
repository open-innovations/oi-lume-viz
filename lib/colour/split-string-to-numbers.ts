export const splitStringToNumbers = (input: string) => {
  const bits = input.split(/,/).map((x) => parseInt(x)).slice(0, 3);
  if (bits.length < 3) {
    throw "Not enough bits";
  }
  return bits as [number, number, number];
};
