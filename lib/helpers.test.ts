import { beforeEach, describe, it } from "std/testing/bdd.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { resolveData } from "./helpers.ts";

describe("resolveData", () => {
  let context: Record<string, unknown>;

  beforeEach(() => {
    context = {
      "simple": "RESULT",
      "nested": {
        "reference": {
          "path": "RESULT",
        },
      },
    };
  });

  it("should return a namespace path from the context", () => {
    assertEquals(resolveData("simple", context), "RESULT");
  });

  it("should return a nested namespace path from the context", () => {
    assertEquals(resolveData("nested.reference.path", context), "RESULT");
  });
});
