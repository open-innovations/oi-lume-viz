import { beforeEach, describe, it } from "std/testing/bdd.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { calculateRange } from "./helpers.ts";

describe("calculateRange", () => {
  // deno-lint-ignore no-explicit-any
  let options: any;

  beforeEach(() => {
    options = {
      data: [
        { category: "A", value: 1 },
        { category: "B", value: 2 },
        { category: "C", value: 3 },
      ],
      category: "category",
      series: [
        { value: "value" },
      ],
    };
  });
  it("should return min = 0 if no value in range < 0", () => {
    const result = calculateRange(options);
    assertEquals(result.min, 0);
  });
  it("should return the smallest number if value in range < 0", () => {
    options.data[0].value = -1;
    const result = calculateRange(options);
    assertEquals(result.min, -1);
  });
});
