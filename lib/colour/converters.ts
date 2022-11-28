export function d2h(d: number) {
  return ((d < 16) ? "0" : "") + d.toString(16);
}
export function h2d(h: string) {
  return parseInt(h, 16);
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
export function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
}
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + d2h(r) + d2h(g) + d2h(b);
}
export function hexToRGB(hex: string): [number, number, number] {
  return [
    h2d(hex.substring(1, 3)),
    h2d(hex.substring(3, 5)),
    h2d(hex.substring(5, 7)),
  ];
}
