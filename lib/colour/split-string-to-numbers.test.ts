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
  // it("should throw an error if fewer than three numbers passed", () => {
  //   assertThrows(() => splitStringToNumbers("12,34"), "Not enough bits");
  // });
  // it("should throw an error if more than three numbers are passed", () => {
  //   assertThrows(() => splitStringToNumbers("12,34,22, 72,21"), "Too many bits");
  // });
  // it("should throw an error if numbers bigger than out of default max are passed", () => {
  //   assertThrows(() => splitStringToNumbers("300,0,0"), "Number too big");
  // });
  // it("should throw an error if numbers below zero are", () => {
  //   assertThrows(() => splitStringToNumbers("100,-10,0"), "Number too small");
  // });
  // it('it should be able to handle a different required number count', () => {});
});
