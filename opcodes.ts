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
  new OpCode(0xea, "NOP", 1, 2, AddressingMode.NoneAddressing),

  /* Arithmetic */
  new OpCode(0x69, "ADC", 2, 2, AddressingMode.Immediate),
  new OpCode(0x65, "ADC", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x75, "ADC", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0x6d, "ADC", 3, 4, AddressingMode.Absolute),
  new OpCode(0x7d, "ADC", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_X),
  new OpCode(0x79, "ADC", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_Y),
  new OpCode(0x61, "ADC", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0x71, "ADC", 2, 5/*+1 if page crossed*/, AddressingMode.Indirect_Y),

  new OpCode(0xe9, "SBC", 2, 2, AddressingMode.Immediate),
  new OpCode(0xe5, "SBC", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0xf5, "SBC", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0xed, "SBC", 3, 4, AddressingMode.Absolute),
  new OpCode(0xfd, "SBC", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_X),
  new OpCode(0xf9, "SBC", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_Y),
  new OpCode(0xe1, "SBC", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0xf1, "SBC", 2, 5/*+1 if page crossed*/, AddressingMode.Indirect_Y),

  new OpCode(0x29, "AND", 2, 2, AddressingMode.Immediate),
  new OpCode(0x25, "AND", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x35, "AND", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0x2d, "AND", 3, 4, AddressingMode.Absolute),
  new OpCode(0x3d, "AND", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_X),
  new OpCode(0x39, "AND", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_Y),
  new OpCode(0x21, "AND", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0x31, "AND", 2, 5/*+1 if page crossed*/, AddressingMode.Indirect_Y),

  new OpCode(0x49, "EOR", 2, 2, AddressingMode.Immediate),
  new OpCode(0x45, "EOR", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x55, "EOR", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0x4d, "EOR", 3, 4, AddressingMode.Absolute),
  new OpCode(0x5d, "EOR", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_X),
  new OpCode(0x59, "EOR", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_Y),
  new OpCode(0x41, "EOR", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0x51, "EOR", 2, 5/*+1 if page crossed*/, AddressingMode.Indirect_Y),

  new OpCode(0x09, "ORA", 2, 2, AddressingMode.Immediate),
  new OpCode(0x05, "ORA", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x15, "ORA", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0x0d, "ORA", 3, 4, AddressingMode.Absolute),
  new OpCode(0x1d, "ORA", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_X),
  new OpCode(0x19, "ORA", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_Y),
  new OpCode(0x01, "ORA", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0x11, "ORA", 2, 5/*+1 if page crossed*/, AddressingMode.Indirect_Y),

  /* Shifts */
  new OpCode(0x0a, "ASL", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x06, "ASL", 2, 5, AddressingMode.ZeroPage),
  new OpCode(0x16, "ASL", 2, 6, AddressingMode.ZeroPage_X),
  new OpCode(0x0e, "ASL", 3, 6, AddressingMode.Absolute),
  new OpCode(0x1e, "ASL", 3, 7, AddressingMode.Absolute_X),

  new OpCode(0x4a, "LSR", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x46, "LSR", 2, 5, AddressingMode.ZeroPage),
  new OpCode(0x56, "LSR", 2, 6, AddressingMode.ZeroPage_X),
  new OpCode(0x4e, "LSR", 3, 6, AddressingMode.Absolute),
  new OpCode(0x5e, "LSR", 3, 7, AddressingMode.Absolute_X),

  new OpCode(0x2a, "ROL", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x26, "ROL", 2, 5, AddressingMode.ZeroPage),
  new OpCode(0x36, "ROL", 2, 6, AddressingMode.ZeroPage_X),
  new OpCode(0x2e, "ROL", 3, 6, AddressingMode.Absolute),
  new OpCode(0x3e, "ROL", 3, 7, AddressingMode.Absolute_X),

  new OpCode(0x6a, "ROR", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x66, "ROR", 2, 5, AddressingMode.ZeroPage),
  new OpCode(0x76, "ROR", 2, 6, AddressingMode.ZeroPage_X),
  new OpCode(0x6e, "ROR", 3, 6, AddressingMode.Absolute),
  new OpCode(0x7e, "ROR", 3, 7, AddressingMode.Absolute_X),

  new OpCode(0xe6, "INC", 2, 5, AddressingMode.ZeroPage),
  new OpCode(0xf6, "INC", 2, 6, AddressingMode.ZeroPage_X),
  new OpCode(0xee, "INC", 3, 6, AddressingMode.Absolute),
  new OpCode(0xfe, "INC", 3, 7, AddressingMode.Absolute_X),

  new OpCode(0xe8, "INX", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0xc8, "INY", 1, 2, AddressingMode.NoneAddressing),

  new OpCode(0xc6, "DEC", 2, 5, AddressingMode.ZeroPage),
  new OpCode(0xd6, "DEC", 2, 6, AddressingMode.ZeroPage_X),
  new OpCode(0xce, "DEC", 3, 6, AddressingMode.Absolute),
  new OpCode(0xde, "DEC", 3, 7, AddressingMode.Absolute_X),

  new OpCode(0xca, "DEX", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x88, "DEY", 1, 2, AddressingMode.NoneAddressing),

  new OpCode(0xc9, "CMP", 2, 2, AddressingMode.Immediate),
  new OpCode(0xc5, "CMP", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0xd5, "CMP", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0xcd, "CMP", 3, 4, AddressingMode.Absolute),
  new OpCode(0xdd, "CMP", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_X),
  new OpCode(0xd9, "CMP", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_Y),
  new OpCode(0xc1, "CMP", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0xd1, "CMP", 2, 5/*+1 if page crossed*/, AddressingMode.Indirect_Y),

  new OpCode(0xc0, "CPY", 2, 2, AddressingMode.Immediate),
  new OpCode(0xc4, "CPY", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0xcc, "CPY", 3, 4, AddressingMode.Absolute),

  new OpCode(0xe0, "CPX", 2, 2, AddressingMode.Immediate),
  new OpCode(0xe4, "CPX", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0xec, "CPX", 3, 4, AddressingMode.Absolute),


  /* Branching */

  new OpCode(0x4c, "JMP", 3, 3, AddressingMode.NoneAddressing), //AddressingMode that acts as Immidiate
  new OpCode(0x6c, "JMP", 3, 5, AddressingMode.NoneAddressing), //AddressingMode:Indirect with 6502 bug

  new OpCode(0x20, "JSR", 3, 6, AddressingMode.NoneAddressing),
  new OpCode(0x60, "RTS", 1, 6, AddressingMode.NoneAddressing),

  new OpCode(0x40, "RTI", 1, 6, AddressingMode.NoneAddressing),

  new OpCode(0xd0, "BNE", 2, 2 /*(+1 if branch succeeds +2 if to a new page)*/, AddressingMode.NoneAddressing),
  new OpCode(0x70, "BVS", 2, 2 /*(+1 if branch succeeds +2 if to a new page)*/, AddressingMode.NoneAddressing),
  new OpCode(0x50, "BVC", 2, 2 /*(+1 if branch succeeds +2 if to a new page)*/, AddressingMode.NoneAddressing),
  new OpCode(0x30, "BMI", 2, 2 /*(+1 if branch succeeds +2 if to a new page)*/, AddressingMode.NoneAddressing),
  new OpCode(0xf0, "BEQ", 2, 2 /*(+1 if branch succeeds +2 if to a new page)*/, AddressingMode.NoneAddressing),
  new OpCode(0xb0, "BCS", 2, 2 /*(+1 if branch succeeds +2 if to a new page)*/, AddressingMode.NoneAddressing),
  new OpCode(0x90, "BCC", 2, 2 /*(+1 if branch succeeds +2 if to a new page)*/, AddressingMode.NoneAddressing),
  new OpCode(0x10, "BPL", 2, 2 /*(+1 if branch succeeds +2 if to a new page)*/, AddressingMode.NoneAddressing),

  new OpCode(0x24, "BIT", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x2c, "BIT", 3, 4, AddressingMode.Absolute),


  /* Stores, Loads */
  new OpCode(0xa9, "LDA", 2, 2, AddressingMode.Immediate),
  new OpCode(0xa5, "LDA", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0xb5, "LDA", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0xad, "LDA", 3, 4, AddressingMode.Absolute),
  new OpCode(0xbd, "LDA", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_X),
  new OpCode(0xb9, "LDA", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_Y),
  new OpCode(0xa1, "LDA", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0xb1, "LDA", 2, 5/*+1 if page crossed*/, AddressingMode.Indirect_Y),

  new OpCode(0xa2, "LDX", 2, 2, AddressingMode.Immediate),
  new OpCode(0xa6, "LDX", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0xb6, "LDX", 2, 4, AddressingMode.ZeroPage_Y),
  new OpCode(0xae, "LDX", 3, 4, AddressingMode.Absolute),
  new OpCode(0xbe, "LDX", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_Y),

  new OpCode(0xa0, "LDY", 2, 2, AddressingMode.Immediate),
  new OpCode(0xa4, "LDY", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0xb4, "LDY", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0xac, "LDY", 3, 4, AddressingMode.Absolute),
  new OpCode(0xbc, "LDY", 3, 4/*+1 if page crossed*/, AddressingMode.Absolute_X),


  new OpCode(0x85, "STA", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x95, "STA", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0x8d, "STA", 3, 4, AddressingMode.Absolute),
  new OpCode(0x9d, "STA", 3, 5, AddressingMode.Absolute_X),
  new OpCode(0x99, "STA", 3, 5, AddressingMode.Absolute_Y),
  new OpCode(0x81, "STA", 2, 6, AddressingMode.Indirect_X),
  new OpCode(0x91, "STA", 2, 6, AddressingMode.Indirect_Y),

  new OpCode(0x86, "STX", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x96, "STX", 2, 4, AddressingMode.ZeroPage_Y),
  new OpCode(0x8e, "STX", 3, 4, AddressingMode.Absolute),

  new OpCode(0x84, "STY", 2, 3, AddressingMode.ZeroPage),
  new OpCode(0x94, "STY", 2, 4, AddressingMode.ZeroPage_X),
  new OpCode(0x8c, "STY", 3, 4, AddressingMode.Absolute),


  /* Flags clear */

  new OpCode(0xD8, "CLD", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x58, "CLI", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0xb8, "CLV", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x18, "CLC", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x38, "SEC", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x78, "SEI", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0xf8, "SED", 1, 2, AddressingMode.NoneAddressing),

  new OpCode(0xaa, "TAX", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0xa8, "TAY", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0xba, "TSX", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x8a, "TXA", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x9a, "TXS", 1, 2, AddressingMode.NoneAddressing),
  new OpCode(0x98, "TYA", 1, 2, AddressingMode.NoneAddressing),

  /* Stack */
  new OpCode(0x48, "PHA", 1, 3, AddressingMode.NoneAddressing),
  new OpCode(0x68, "PLA", 1, 4, AddressingMode.NoneAddressing),
  new OpCode(0x08, "PHP", 1, 3, AddressingMode.NoneAddressing),
  new OpCode(0x28, "PLP", 1, 4, AddressingMode.NoneAddressing),
];

export const OPCODES_MAP: Map<number, OpCode> = new Map();

for (const op of CPU_OPS_CODES) {
  OPCODES_MAP.set(op.code, op);
}