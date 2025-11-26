import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/asserts";
import { Colour } from "./colour.ts";

describe('colour contrasts', () => {
  const colours = {
    "#000000": 'white',
    "#FFFFFF": 'black',
    "#0DBC37": 'black',
  };

  Object.entries(colours).forEach(([colour, contrast]) => {
    it(`should return ${contrast} contrast text for colour ${colour}`, () => {
      const c = Colour(colour);
      assertEquals(c.contrast, contrast);
    })  
  })
})
