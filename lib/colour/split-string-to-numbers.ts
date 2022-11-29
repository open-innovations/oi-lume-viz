export const splitStringToNumbers = (input: string) =>
  input.split(/,/).map((x) => parseInt(x));
