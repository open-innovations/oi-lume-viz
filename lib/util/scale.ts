export default (
  n: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => ((n - inMin) * (outMax - outMin) / (inMax - inMin)) + outMin;
