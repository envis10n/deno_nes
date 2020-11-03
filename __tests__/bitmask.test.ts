import { BitMask } from "../bitmask.ts";
import { CpuFlags } from "../cpu.ts";
import * as asserts from "https://deno.land/std@0.76.0/testing/asserts.ts";

Deno.test("bitmask test", () => {
  const b: BitMask<CpuFlags> = new BitMask();
  b.set(CpuFlags.ZERO);
  console.log((b.value & 0b0000_0010).toString(2));
});