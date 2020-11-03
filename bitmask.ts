type Filter<T, Cond, U extends keyof T = keyof T> = {
  [K in U]: T[K] extends Cond ? K : never;
}[U];

type EKey<T> = Filter<T, boolean> & string;

export class BitMask<T> {
  public fields: {[K in EKey<T>]?: boolean};
  constructor(fields: {[K in EKey<T>]?: boolean}) {
    this.fields = fields;
  }
  public set<K extends EKey<T>>(field: K): number {
    this.fields[field] = true;
    return this.valueOf();
  }
  public unset<K extends EKey<T>>(field: K): number {
    this.fields[field] = false;
    return this.valueOf();
  }
  public toggle<K extends EKey<T>>(field: K): number {
    this.fields[field] = !this.fields[field];
    return this.valueOf();
  }
  public valueOf<K extends EKey<T>>(): number {
    let v = 0;
    Object.keys(this.fields).forEach((k, i) => {
      if (this.fields[k as K]) v |= 1 << i
    });
    return v;
  }
}