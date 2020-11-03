import { CPU, CpuFlags } from "../cpu.ts";
import * as asserts from "https://deno.land/std@0.76.0/testing/asserts.ts";

Deno.test("0xa9_lda_immediate_load_data", () => {
  let cpu = new CPU();
  cpu.load_and_run(new Uint8Array([0xa9, 0x05, 0x00]));
  asserts.assertEquals(cpu.register_a, 5);
  asserts.assert((cpu.status.value & 0b0000_0010) == 0b00);
  asserts.assert((cpu.status.value & 0b10000_0000) == 0);
});

Deno.test("0xaa_tax_move_a_to_x", () => {
  const cpu = new CPU();
  cpu.load_and_run(new Uint8Array([0xa9, 0x0a, 0xaa, 0x00]));
  asserts.assertEquals(cpu.register_x, 10);
});

Deno.test("5_ops_working_together", () => {
  let cpu = new CPU();
  cpu.load_and_run(new Uint8Array([0xa9, 0xc0, 0xaa, 0xe8, 0x00]));
  asserts.assertEquals(cpu.register_x, 0xc1);
});

Deno.test("inx_overflow", () => {
  let cpu = new CPU();
  cpu.register_x = 0xff;
  cpu.load_and_run(new Uint8Array([0xa9, 0xff, 0xaa, 0xe8, 0xe8, 0x00]));
  asserts.assertEquals(cpu.register_x, 1);
});

Deno.test("lda_from_memory", () => {
  let cpu = new CPU();
  cpu.mem_write(0x10, 0x55);
  cpu.load_and_run(new Uint8Array([0xa5, 0x10, 0x00]));
  asserts.assertEquals(cpu.register_a, 0x55);
});