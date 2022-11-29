import { describe, it } from "std/testing/bdd.ts";
import { assert, assertThrows } from "std/testing/asserts.ts";

import { validateNumberList } from "./parse-colour-string.ts";

// Weird that this doesn't exist, but there you go...
// TODO(@giles) Move this out to a test helper module
function assertNotThrows(
  functionUnderTest: () => unknown,
  message = "Threw an error",
) {
  try {
    return functionUnderTest();
  } catch {
    assert(false, message);
  }
}

describe("validateNumberList", () => {
  it("should not throw an error if provided with three numbers are below 255 (default)", () => {
    const functionToTest = () => validateNumberList([255, 100, 20]);
    assertNotThrows(functionToTest);
  });
  it("should throw an error if there are fewer than three numbers (default)", () => {
    // Need to wrap in a function to enable running when test executed rather than when defined
    const functionToTest = () => validateNumberList([255, 200]);
    assertThrows(functionToTest, TypeError, "Too few bits");
  });
  it("should throw an error if there are more than three numbers (default)", () => {
    // Need to wrap in a function to enable running when test executed rather than when defined
    const functionToTest = () => validateNumberList([255, 200, 20, 200]);
    assertThrows(functionToTest, TypeError, "Too many bits");
  });
  it("should allow a different number of numbers to be specified", () => {
    const functionToTest = () =>
      validateNumberList([255, 100], { expectedLength: 2 });
    assertNotThrows(functionToTest);
  });
  it("should allow a different number of numbers to be specified, and throw if there are too many", () => {
    const functionToTest = () =>
      validateNumberList([255, 100, 100], { expectedLength: 2 });
    assertThrows(functionToTest, TypeError, "Too many bits");
  });
  describe("range handling", () => {
    it("should throw an error if any of the three numbers are smaller than 0", () => {
      // Need to wrap in a function to enable running when test executed rather than when defined
      const functionToTest = () => validateNumberList([255, -10, 20]);
      assertThrows(functionToTest, RangeError, "Number too small");
    });
    it("should throw an error if any of the three numbers are greater than 255 (default)", () => {
      // Need to wrap in a function to enable running when test executed rather than when defined
      const functionToTest = () => validateNumberList([255, 256, 20]);
      assertThrows(functionToTest, RangeError, "Number too big");
    });
    it("should allow a different upper level to be provided", () => {
      const functionToTest = () =>
        validateNumberList([500, 200, 100], { maxValues: [500, 200, 100] });
      assertNotThrows(functionToTest);
    });
    it("should allow a different upper level to be provided, and throw if exceeded", () => {
      const functionToTest = () =>
        validateNumberList([500, 200, 120], { maxValues: [500, 200, 100] });
      assertThrows(functionToTest, RangeError, "Number too big");
    });
  });
});
