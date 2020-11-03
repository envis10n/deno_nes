export enum AddressingMode {
  Immediate,
  ZeroPage,
  ZeroPage_X,
  ZeroPage_Y,
  Absolute,
  Absolute_X,
  Absolute_Y,
  Indirect_X,
  Indirect_Y,
  NoneAddressing,
}

export class OpCode {
  constructor(
    public code: number,
    public mnemonic: string,
    public len: number,
    public cycles: number,
    public mode: AddressingMode) { }
}

export const CPU_OPS_CODES: OpCode[] = [
  new OpCode(0x00, "BRK", 1, 7, AddressingMode.NoneAddressing),
  new OpCode(0xAA, "TAX", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0xE8, "INX", 1, 2, AddressingMode.NoneAddressing),
  
  new OpCode(0xA9, "LDA", 2, 2, AddressingMode.Immediate),
  new OpCode(0xA5, "LDA", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0xB5, "LDA", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0xAD, "LDA", 3, 4, AddressingMode.Absolute),
  new OpCode(0xBD, "LDA", 3, 4, AddressingMode.Absolute_X), // +1 for page cross
  new OpCode(0xB9, "LDA", 3, 4, AddressingMode.Absolute_Y), // +1 for page cross
  new OpCode(0xA1, "LDA", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0xB1, "LDA", 2, 5, AddressingMode.Indirect_Y), // +1 for page cross

  new OpCode(0x85, "STA", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x95, "STA", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0x8D, "STA", 3, 4, AddressingMode.Absolute),
  new OpCode(0x9D, "STA", 3, 5, AddressingMode.Absolute_X),
  new OpCode(0x99, "STA", 3, 5, AddressingMode.Absolute_Y),
  new OpCode(0x81, "STA", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0x91, "STA", 2, 6, AddressingMode.Indirect_Y),
];

export const OPCODES_MAP: Map<number, OpCode> = new Map();

for (const op of CPU_OPS_CODES) {
  OPCODES_MAP.set(op.code, op);
}