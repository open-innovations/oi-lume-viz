function brightnessIndex(rgb) {
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
}
export function brightnessDiff(a, b) {
  return Math.abs(brightnessIndex(a) - brightnessIndex(b));
}
export function hueDiff(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}
