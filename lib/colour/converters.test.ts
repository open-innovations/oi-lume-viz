import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/asserts
import {
  d2h,
  h2d,
  hexToRGB,
  hslToHex,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
} from "./converters.ts";

describe("d2h", () => {
  it("should convert a number to hex", () => {
    const result = d2h(23);
    assertEquals(result, "17");
  });
  it("should zero pad numbers below 16", () => {
    const result = d2h(12);
    assertEquals(result, "0c");
  });
});

describe("h2d", () => {
  it("should convert hex to decimal", () => {
    assertEquals(h2d("0a"), 10);
  });
});

describe("rgbToHsl", () => {
  it("should convert a red to hsl representation", () => {
    assertEquals(rgbToHsl(255, 0, 0), [0, 100, 50]);
  });
  it("should convert a green to hsl representation", () => {
    assertEquals(rgbToHsl(0, 255, 0), [120, 100, 50]);
  });
  it("should convert a blue to hsl representation", () => {
    assertEquals(rgbToHsl(0, 0, 255), [240, 100, 50]);
  });
  it("should handle greyscale / achromatic colours", () => {
    assertEquals(rgbToHsl(128, 128, 128), [0, 0, 50]);
  });
});

describe("hslToHex", () => {
  it("should convert hsl red values to a hex string", () => {
    assertEquals(hslToHex(0, 100, 50), "#ff0000");
  });
  it("should convert hsl green values to a hex string", () => {
    assertEquals(hslToHex(120, 100, 50), "#00ff00");
  });
  it("should convert hsl blue values to a hex string", () => {
    assertEquals(hslToHex(240, 100, 50), "#0000ff");
  });
});

describe("hslToHex", () => {
  it("should convert hsl red values to a hex string", () => {
    assertEquals(hslToRgb(0, 100, 50), [255, 0, 0]);
  });
  it("should convert hsl green values to an rgb array", () => {
    assertEquals(hslToRgb(120, 100, 50), [0, 255, 0]);
  });
  it("should convert hsl blue values to a hex string", () => {
    assertEquals(hslToRgb(240, 100, 50), [0, 0, 255]);
  });
});

describe("rgbToHex", () => {
  it("should convert an RGB array to a hex string", () => {
    assertEquals(rgbToHex(255, 10, 128), "#ff0a80");
  });
});

describe("hexToRGB", () => {
  it("should convert a hex string to an RGB array", () => {
    assertEquals(hexToRGB("#ff0a80"), [255, 10, 128]);
  });
});
