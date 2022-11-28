import { describe, it } from "std/testing/bdd.ts";
import { assertEquals, assertThrows } from "std/testing/asserts.ts";

import { splitStringToNumbers } from "./split-string-to-numbers.ts";

describe("splitStringToNumbers", () => {
  it("should convert a comma separated string into an array of numbers", () => {
    assertEquals(splitStringToNumbers("12,34,22"), [12, 34, 22]);
  });
  it("should handle whitespace in string", () => {
    assertEquals(splitStringToNumbers("12, 34,22 "), [12, 34, 22]);
  });
  it("should throw an error if fewer than three numbers passed", () => {
    assertThrows(() => splitStringToNumbers("12,34"), "Not enough bits");
  });
});
