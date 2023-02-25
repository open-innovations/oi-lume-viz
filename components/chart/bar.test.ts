import { beforeEach, describe, it } from "std/testing/bdd.ts";
import { assertThrows } from "std/testing/asserts.ts";
import { parse as yamlParse } from "std/encoding/yaml.ts";
import bar, { BarChartOptions } from "./bar.ts";

const testData = yamlParse(
  await Deno.readTextFile("./test/data/bar-chart.yml"),
) as {
  config: BarChartOptions;
}[];

describe("barChart", () => {
  let context: Record<string, unknown>;
  beforeEach(() => {
    context = {
      test: {
        data: {
          bar: [
            {
              category: "First catergory",
              value: 10,
            },
            {
              category: "Second category",
              value: 33,
            },
            {
              category: "Third category",
              value: 25,
            },
          ],
        },
      },
    };
  });
  testData.forEach((testCase, i) => {
    it(`should load with test data derived from YFF (config ${i + 1})`, () => {
      bar({
        ...context,
        config: testCase.config,
      });
    });
  });
  describe("error checking", () => {
    it("should raise an error if data not provided", () => {
      assertThrows(() => bar({ config: {} }), TypeError);
      assertThrows(() => bar({ config: { data: [] } }), TypeError);
    });
  });
});
