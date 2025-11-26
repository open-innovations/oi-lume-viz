import { describe, it } from '@std/testing/bdd';
import { assertEquals } from '@std/asserts';
import { getColourPercent } from "./get-colour-percent.ts";

describe('getColourPercent', () => {
  it('should generate a colour between the two provided given a percentage', () => {
    const result = getColourPercent(50, { rgb: [100, 0, 0] }, { rgb: [0, 100, 0]})
    assertEquals(result.r, 50);
    assertEquals(result.g, 50);
    assertEquals(result.b, 0);
    assertEquals(result.alpha, 1);
  });
  it('should be possible to render a string of the result', () => {
    const result = getColourPercent(50, { rgb: [100, 0, 0] }, { rgb: [0, 100, 0]})
    assertEquals(result.toString(), 'rgb(50,50,0)');
  });
});
