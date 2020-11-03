export class BitMask<T extends number> {
  constructor(public value: number = 0) { }
  public get(field: T): boolean {
    return (this.value & (1 << field)) != 0;
  }
  public set(field: T): number;
  public set(field: T, value: boolean): number;
  public set(field: T, value: boolean = true): number {
    if (value) {
      this.value |= 1 << field;
      return this.value;
    } else {
      this.value &= ~(1 << field);
      return this.value;
    }
  }
  public unset(field: T): number {
    this.value &= ~(1 << field);
    return this.value;
  }
  public toggle(field: T): number {
    this.value ^= 1 << field;
    return this.value;
  }
  public valueOf(): number {
    return this.value;
  }
}