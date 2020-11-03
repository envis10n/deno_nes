import { OPCODES_MAP, AddressingMode } from "./opcodes.ts";
import { BitMask } from "./bitmask.ts";

export function byteAdd(a: number, b: number): number {
  let v = a + b;
  return v > 255 ? v - 256 : v;
}

export function byteNeg(a: number): number {
  return byteAdd(-a, 1);
}

export function byteSub(a: number, b: number): number {
  let v = a - b;
  return v < 0 ? v + 256 : v;
}

export enum CpuFlags {
  CARRY,
  ZERO,
  INTERRUPT_DISABLE,
  DECIMAL_MODE,
  BREAK,
  BREAK2,
  OVERFLOW,
  NEGATIV
}

export const STACK: number = 0x0100;
export const STACK_RESET: number = 0xFD;

export class CPU {
  public register_a: number = 0;
  public register_x: number = 0;
  public register_y: number = 0;
  public status: BitMask<CpuFlags> = new BitMask(0b100100);
  public program_counter: number = 0;
  public stack_pointer: number = STACK_RESET;
  memory: Uint8Array = new Uint8Array(0xFFFF);
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
    this.stack_pointer = STACK_RESET;
    this.status = new BitMask(0b100100);
    this.program_counter = this.mem_read_u16(0xFFFC);
  }
  ldy(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const data = this.mem_read(addr);
    this.register_y = data;
    this.update_zero_and_negative_flags(this.register_y);
  }
  ldx(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const data = this.mem_read(addr);
    this.register_x = data;
    this.update_zero_and_negative_flags(this.register_x); 
  }
  set_carry_flag() {
    this.status.set(CpuFlags.CARRY);
  }
  clear_carry_flag() {
    this.status.unset(CpuFlags.CARRY);
  }
  set_register_a(data: number) {
    this.register_a = data;
    this.update_zero_and_negative_flags(this.register_a);
  }
  add_to_register_a(data: number) {
    const sum = this.register_a
      + data
      + (this.status.get(CpuFlags.CARRY) ? 1 : 0);
    const carry = sum > 0xFF;
    if (carry) this.set_carry_flag();
    else this.clear_carry_flag();
    const result = sum;
    if (((data ^ result) & (result ^ this.register_a) & 0x80) != 0) this.status.set(CpuFlags.OVERFLOW);
    else this.status.unset(CpuFlags.OVERFLOW);
    this.set_register_a(result);
  }
  mem_write(addr: number, data: number) {
    this.memory[addr] = data;
  }
  public load(program: Uint8Array) {
    program.forEach((b, i) => {
      this.memory[0x8000 + i] = b;
    });
    this.mem_write_u16(0xFFFC, 0x8000);
  }
  public load_and_run(program: Uint8Array) {
    this.load(program);
    this.reset();
    this.run();
  }
  sta(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    this.mem_write(addr, this.register_a);
  }
  inx() {
    this.register_x = byteAdd(this.register_x, 1);
    this.update_zero_and_negative_flags(this.register_x);
  }
  iny() {
    this.register_y = byteAdd(this.register_y, 1);
    this.update_zero_and_negative_flags(this.register_y);
  }
  lda(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const value = this.mem_read(addr);
    this.register_a = value;
  }
  and(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const data = this.mem_read(addr);
    this.set_register_a(data & this.register_a);
  }
  eor(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const data = this.mem_read(addr);
    this.set_register_a(data ^ this.register_a);
  }
  ora(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const data = this.mem_read(addr);
    this.set_register_a(data | this.register_a);
  }
  tax() {
    this.register_x = this.register_a;
    this.update_zero_and_negative_flags(this.register_x);
  }
  update_zero_and_negative_flags(result: number) {
    if (result == 0) {
      this.status.set(CpuFlags.ZERO);
    } else {
      this.status.unset(CpuFlags.ZERO);
    }

    if ((result & 0b1000_0000) != 0) {
      this.status.set(CpuFlags.NEGATIV);
    } else {
      this.status.unset(CpuFlags.NEGATIV);
    }
  }
  sbc(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    let data = this.mem_read(addr);
    data = byteNeg(data);
    this.add_to_register_a(byteSub(data, 1));
  }
  adc(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const value = this.mem_read(addr);
    this.add_to_register_a(value);
  }
  stack_pop(): number {
    this.stack_pointer = byteAdd(this.stack_pointer, 1);
    return this.mem_read(STACK + this.stack_pointer);
  }
  stack_push(data: number) {
    this.mem_write(STACK + this.stack_pointer, data);
    this.stack_pointer = byteSub(this.stack_pointer, 1);
  }
  stack_push_u16(data: number) {
    const hi = data >> 8;
    const lo = data & 0xFF;
    this.stack_push(hi);
    this.stack_push(lo);
  }
  stack_pop_u16(): number {
    const lo = this.stack_pop();
    const hi = this.stack_pop();
    return hi << 8 | lo;
  }
  asl_accumulator() {
    let data = this.register_a;
    if ((data >> 7) == 1) this.set_carry_flag();
    else this.clear_carry_flag();
    data = data << 1;
    this.set_register_a(data);
  }
  asl(mode: AddressingMode): number {
    const addr = this.get_operand_address(mode);
    let data = this.mem_read(addr);
    if ((data >> 7 == 1)) this.set_carry_flag();
    else this.clear_carry_flag();
    data = data << 1;
    this.mem_write(addr, data);
    this.update_zero_and_negative_flags(data);
    return data;
  }
  lsr_accumulator() {
    let data = this.register_a;
    if ((data & 1) == 1) this.set_carry_flag();
    else this.clear_carry_flag();
    data = data >> 1;
    this.set_register_a(data);
  }
  lsr(mode: AddressingMode): number {
    const addr = this.get_operand_address(mode);
    let data = this.mem_read(addr);
    if ((data & 1) == 1) this.set_carry_flag();
    else this.clear_carry_flag();
    data = data >> 1;
    this.mem_write(addr, data);
    this.update_zero_and_negative_flags(data);
    return data;
  }
  rol(mode: AddressingMode): number {
    const addr = this.get_operand_address(mode);
    let data = this.mem_read(addr);
    let old_carry = this.status.get(CpuFlags.CARRY);
    if ((data >> 7) == 1) this.set_carry_flag();
    else this.clear_carry_flag();
    data = data << 1;
    if (old_carry) data = data | 1;
    this.mem_write(addr, data);
    this.update_zero_and_negative_flags(data);
    return data;
  }
  rol_accumulator() {
    let data = this.register_a;
    const old_carry = this.status.get(CpuFlags.CARRY);

    if ((data >> 7) == 1) this.set_carry_flag();
    else this.clear_carry_flag();

    data = data << 1;
    if (old_carry) data = data | 1;
    this.set_register_a(data);
  }
  ror(mode: AddressingMode): number {
    const addr = this.get_operand_address(mode);
    let data = this.mem_read(addr);
    const old_carry = this.status.get(CpuFlags.CARRY);
    if ((data & 1) == 1) this.set_carry_flag();
    else this.clear_carry_flag();

    data = data >> 1;
    if (old_carry) data = data | 0b10000000;
    this.mem_write(addr, data);
    this.update_zero_and_negative_flags(data);
    return data;
  }
  ror_accumulator() {
    let data = this.register_a;
    const old_carry = this.status.get(CpuFlags.CARRY);

    if ((data & 1) == 1) this.set_carry_flag();
    else this.clear_carry_flag();

    data = data >> 1;
    if (old_carry) data = data | 0b10000000;
    this.set_register_a(data);
  }
  inc(mode: AddressingMode): number {
    const addr = this.get_operand_address(mode);
    let data = this.mem_read(addr);
    data = byteAdd(data, 1);
    this.mem_write(addr, data);
    this.update_zero_and_negative_flags(data);
    return data;
  }
  dey() {
    this.register_y = byteSub(this.register_y, 1);
    this.update_zero_and_negative_flags(this.register_y);
  }
  dex() {
    this.register_x = byteSub(this.register_x, 1);
    this.update_zero_and_negative_flags(this.register_x);
  }
  dec(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    let data = this.mem_read(addr);
    data = byteSub(data, 1);
    this.mem_write(addr, data);
    this.update_zero_and_negative_flags(data);
    return data;
  }
  pla() {
    const data = this.stack_pop();
    this.set_register_a(data);
  }
  plp() {
    this.status = new BitMask(this.stack_pop());
    this.status.unset(CpuFlags.BREAK);
    this.status.set(CpuFlags.BREAK2);
  }
  php() {
    let flags: BitMask<CpuFlags> = new BitMask(this.status.value);
    flags.set(CpuFlags.BREAK);
    flags.set(CpuFlags.BREAK2);
    this.stack_push(flags.value);
  }
  bit(mode: AddressingMode) {
    const addr = this.get_operand_address(mode);
    const data = this.mem_read(addr);
    const and = this.register_a & data;
    if (and == 0) this.status.set(CpuFlags.ZERO);
    else this.status.unset(CpuFlags.ZERO);
    this.status.set(CpuFlags.NEGATIV, (data & 0b10000000) > 0);
    this.status.set(CpuFlags.OVERFLOW, (data & 0b01000000) > 0);
  }
  compare(mode: AddressingMode, compare_with: number) {
    const addr = this.get_operand_address(mode);
    const data = this.mem_read(addr);
    if (data <= compare_with) this.status.set(CpuFlags.CARRY);
    else this.status.unset(CpuFlags.CARRY);
    this.update_zero_and_negative_flags(byteAdd(compare_with, data));
  }
  branch(condition: boolean) {
    if (condition) {
      const jump = this.mem_read(this.program_counter);
      const jump_addr = byteAdd(byteAdd(this.program_counter, 1), jump);
      this.program_counter = jump_addr;
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

      if (opcode == undefined) throw new Error(`Unrecognized OpCode! 0x${code?.toString(16)}`);

      switch (opcode.code) {
        case 0x00:
          return;
        case 0xa9:
        case 0xa5:
        case 0xb5:
        case 0xad:
        case 0xbd:
        case 0xb9:
        case 0xa1:
        case 0xb1: {
          this.lda(opcode.mode);
          break;
        }
        case 0xaa:
          this.tax();
          break;
        case 0xe8:
          this.inx();
          break;
        case 0xd8:
          this.status.unset(CpuFlags.DECIMAL_MODE);
          break;
        case 0x58:
          this.status.unset(CpuFlags.INTERRUPT_DISABLE);
          break;
        case 0xb8:
          this.status.unset(CpuFlags.OVERFLOW);
          break;
        case 0x18:
          this.clear_carry_flag();
          break;
        case 0x38:
          this.set_carry_flag();
          break;
        case 0x78:
          this.status.set(CpuFlags.INTERRUPT_DISABLE);
          break;
        case 0xf8:
          this.status.set(CpuFlags.DECIMAL_MODE);
          break;
        case 0x48:
          this.stack_push(this.register_a);
          break;
        case 0x68:
          this.pla();
          break;
        case 0x08:
          this.php();
          break;
        case 0x28:
          this.plp();
          break;
        case 0x69:
        case 0x65:
        case 0x75:
        case 0x6d:
        case 0x7d:
        case 0x79:
        case 0x61:
        case 0x71:
          this.adc(opcode.mode);
          break;
        case 0xe9:
        case 0xe5:
        case 0xf5:
        case 0xed:
        case 0xfd:
        case 0xf9:
        case 0xe1:
        case 0xf1:
          this.sbc(opcode.mode);
          break;
        case 0x29:
        case 0x25:
        case 0x35:
        case 0x2d:
        case 0x3d:
        case 0x39:
        case 0x21:
        case 0x31:
          this.and(opcode.mode);
          break;
        case 0x49:
        case 0x45:
        case 0x55:
        case 0x4d:
        case 0x5d:
        case 0x59:
        case 0x41:
        case 0x51:
          this.eor(opcode.mode);
          break;
        case 0x09:
        case 0x05:
        case 0x15:
        case 0x0d:
        case 0x1d:
        case 0x19:
        case 0x01:
        case 0x11:
          this.ora(opcode.mode);
          break;
        case 0x4a:
          this.lsr_accumulator();
          break;
        case 0x46:
        case 0x56:
        case 0x4e:
        case 0x5e:
          this.lsr(opcode.mode);
          break;
        case 0x0a:
          this.asl_accumulator();
          break;
        case 0x06:
        case 0x16:
        case 0x0e:
        case 0x1e:
          this.asl(opcode.mode);
          break;
        case 0x2a:
          this.rol_accumulator();
          break;
        case 0x26:
        case 0x36:
        case 0x2e:
        case 0x3e:
          this.rol(opcode.mode);
          break;
        case 0x6a:
          this.ror_accumulator();
          break;
        case 0x66:
        case 0x76:
        case 0x6e:
        case 0x7e:
          this.ror(opcode.mode);
          break;
        case 0xe6:
        case 0xf6:
        case 0xee:
        case 0xfe:
          this.inc(opcode.mode);
          break;
        case 0xc8:
          this.iny();
          break;
        case 0xc6:
        case 0xd6:
        case 0xce:
        case 0xde:
          this.dec(opcode.mode);
          break;
        case 0xca:
          this.dex();
          break;
        case 0x88:
          this.dey();
          break;
        case 0xc9:
        case 0xc5:
        case 0xd5:
        case 0xcd:
        case 0xdd:
        case 0xd9:
        case 0xc1:
        case 0xd1:
          this.compare(opcode.mode, this.register_a);
          break;
        case 0xc0:
        case 0xc4:
        case 0xcc:
          this.compare(opcode.mode, this.register_y);
          break;
        case 0xe0:
        case 0xe4:
        case 0xec:
          this.compare(opcode.mode, this.register_x);
          break;
        case 0x4c: {
          const addr = this.mem_read_u16(this.program_counter);
          this.program_counter = addr;
          break;
        }
        case 0x6c: {
          const addr = this.mem_read_u16(this.program_counter);
          let indirect_ref: number;
          if ((addr & 0x00FF) == 0x00FF) {
            const lo = this.mem_read(addr);
            const hi = this.mem_read(addr & 0xFF00);
            indirect_ref = hi << 8 | lo;
          } else indirect_ref = this.mem_read_u16(addr);
          this.program_counter = indirect_ref;
          break;
        }
        case 0x20: {
          this.stack_push_u16(this.program_counter + 2 - 1);
          const target_address = this.mem_read_u16(this.program_counter);
          this.program_counter = target_address;
          break;
        }
        case 0x60:
          this.program_counter = this.stack_pop_u16() + 1;
          break;
        case 0x40:
          this.status = new BitMask(this.stack_pop());
          this.status.unset(CpuFlags.BREAK);
          this.status.set(CpuFlags.BREAK2);
          this.program_counter = this.stack_pop_u16();
          break;
        case 0xd0:
          this.branch(this.status.get(CpuFlags.ZERO));
          break;
        case 0x70:
          this.branch(this.status.get(CpuFlags.OVERFLOW));
          break;
        case 0x50:
          this.branch(!this.status.get(CpuFlags.OVERFLOW));
          break;
        case 0x10:
          this.branch(!this.status.get(CpuFlags.NEGATIV));
          break;
        case 0x30:
          this.branch(this.status.get(CpuFlags.NEGATIV));
          break;
        case 0xf0:
          this.branch(this.status.get(CpuFlags.ZERO));
          break;
        case 0xb0:
          this.branch(this.status.get(CpuFlags.CARRY));
          break;
        case 0x90:
          this.branch(!this.status.get(CpuFlags.CARRY));
          break;
        case 0x24:
        case 0x2c:
          this.bit(opcode.mode);
          break;
        case 0x85:
        case 0x95:
        case 0x8d:
        case 0x9d:
        case 0x99:
        case 0x81:
        case 0x91:
          this.sta(opcode.mode);
          break;
        case 0x86:
        case 0x96:
        case 0x8e: {
          const addr = this.get_operand_address(opcode.mode);
          this.mem_write(addr, this.register_x);
          break;
        }
        case 0x84:
        case 0x94:
        case 0x8c: {
          const addr = this.get_operand_address(opcode.mode);
          this.mem_write(addr, this.register_y);
          break;
        }
        case 0xa2:
        case 0xa6:
        case 0xb6:
        case 0xae:
        case 0xbe:
          this.ldx(opcode.mode);
          break;
        case 0xa0:
        case 0xa4:
        case 0xb4:
        case 0xac:
        case 0xbc:
          this.ldy(opcode.mode);
          break;
        case 0xea:
          break;
        case 0xa8:
          this.register_y = this.register_a;
          this.update_zero_and_negative_flags(this.register_y);
          break;
        case 0xba:
          this.register_x = this.stack_pointer;
          this.update_zero_and_negative_flags(this.register_x);
          break;
        case 0x8a:
          this.register_a = this.register_x;
          this.update_zero_and_negative_flags(this.register_a);
          break;
        case 0x9a:
          this.stack_pointer = this.register_x;
          break;
        case 0x98:
          this.register_a = this.register_y;
          this.update_zero_and_negative_flags(this.register_a);
      }

      if (program_counter_state == this.program_counter) {
        this.program_counter += opcode.len - 1;
      }
    }
  }
}

