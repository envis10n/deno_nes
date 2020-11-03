import { BitMask } from "../bitmask.ts";
import * as asserts from "https://deno.land/std@0.76.0/testing/asserts.ts";

Deno.test("bitmask test", () => {
  interface IBitTest {
    Hello: boolean;
    World: boolean;
    Another: boolean;
  }
  const b = new BitMask<IBitTest>({ Hello: true, World: true, Another: true });
  b.unset("Hello");
  asserts.assertEquals(b.valueOf(), 0b010 | 0b100);
});