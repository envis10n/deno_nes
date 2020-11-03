import { OPCODES_MAP, AddressingMode } from "./opcodes.ts";

export function byteAdd(a: number, b: number): number {
  let v = a + b;
  return v > 255 ? v - 256 : v;
}

export function byteSub(a: number, b: number): number {
  let v = a - b;
  return v < 0 ? v + 256 : v;
}

export class CPU {
  public register_a: number = 0;
  public register_x: number = 0;
  public register_y: number = 0;
  public status: number = 0;
  public program_counter: number = 0;
  readonly memory: Uint8Array = new Uint8Array(0xFFFF);
  mem_read(addr: number): number {
    return this.memory[addr];
  }
  mem_read_u16(pos: number): number {
    let lo = this.mem_read(pos);
    let hi = this.mem_read(pos + 1);
    return (hi << 8) | lo;
  }
  mem_write_u16(pos: number, data: number) {
    let hi = (data >> 8);
    let lo = (data & 0xff);
    this.mem_write(pos, lo);
    this.mem_write(pos + 1, hi);
  }
  public reset() {
    this.register_a = 0;
    this.register_x = 0;
    this.register_y = 0;
    this.status = 0;
    this.program_counter = this.mem_read_u16(0xFFFC);
  }
  mem_write(addr: number, data: number) {
    this.memory[addr] = data;
  }
  public load(program: Uint8Array) {
    program.forEach((b, i) => {
      this.memory[i + 0x8000] = b;
    });
    this.mem_write_u16(0x0FFFC, 0x8000);
  }
  public load_and_run(program: Uint8Array) {
    this.load(program);
    this.reset();
    this.run();
  }
  public sta(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    this.mem_write(addr, this.register_a);
  }
  public inx() {
    this.register_x = byteAdd(this.register_x, 1);
    this.update_zero_and_negative_flags(this.register_x);
  }
  public lda(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const value = this.mem_read(addr);
    this.register_a = value;
    this.update_zero_and_negative_flags(this.register_a);
  }
  public tax() {
    this.register_x = this.register_a;
    this.update_zero_and_negative_flags(this.register_x);
  }
  public update_zero_and_negative_flags(result: number) {
    if (result == 0) {
      this.status |= 0b0000_0010;
    } else {
      this.status &= 0b1111_1101;
    }

    if ((result & 0b1000_0000) != 0) {
      this.status |= 0b1000_0000;
    } else {
      this.status &= 0b0111_1111;
    }
  }
  public get_operand_address(mode: AddressingMode): number {
    switch (mode) {
      case AddressingMode.Immediate:
        return this.program_counter;
      case AddressingMode.ZeroPage:
        return this.mem_read(this.program_counter);
      case AddressingMode.Absolute:
        return this.mem_read_u16(this.program_counter);
      case AddressingMode.ZeroPage_X: {
        const pos = this.mem_read(this.program_counter);
        return byteAdd(pos, this.register_x);
      }
      case AddressingMode.ZeroPage_Y: {
        const pos = this.mem_read(this.program_counter);
        return byteAdd(pos, this.register_y);
      }
      case AddressingMode.Absolute_X: {
        const base = this.mem_read_u16(this.program_counter);
        return byteAdd(base, this.register_x);
      }
      case AddressingMode.Absolute_Y: {
        const base = this.mem_read_u16(this.program_counter);
        return byteAdd(base, this.register_y);
      }
      case AddressingMode.Indirect_X: {
        const base = this.mem_read(this.program_counter);
        const ptr = byteAdd(base, this.register_x);
        const lo = this.mem_read(ptr);
        const hi = this.mem_read(byteAdd(ptr, 1));
        return (hi << 8) | lo;
      }
      case AddressingMode.Indirect_Y: {
        const base = this.mem_read(this.program_counter);

        const lo = this.mem_read(base);
        const hi = this.mem_read(byteAdd(base, 1));
        const deref_base = (hi << 8) | lo;
        return byteAdd(deref_base, this.register_y);
      }
      case AddressingMode.NoneAddressing:
        throw new Error("Unsupported addressing mode.");
    }
  }
  public run() {
    while (true) {
      const code = this.mem_read(this.program_counter);
      this.program_counter += 1;

      const program_counter_state = this.program_counter;

      const opcode = OPCODES_MAP.get(code);

      if (opcode == undefined) throw new Error(`Unrecognized OpCode! 0x${code.toString(16)}`);

      switch (opcode.mnemonic) {
        case "LDA":
          this.lda(opcode.mode);
          break;
        case "STA":
          this.sta(opcode.mode);
        case "INX":
          this.inx();
          break;
        case "TAX":
          this.tax();
          break;
        case "BRK":
          return;
      }

      if (program_counter_state == this.program_counter) {
        this.program_counter += opcode.len - 1;
      }
    }
  }
}

