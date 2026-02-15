export class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state += 0x6D2B79F5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pickWeighted<T>(items: T[], weight: (item: T) => number): T {
    const total = items.reduce((sum, i) => sum + weight(i), 0);
    const roll = this.next() * total;
    let acc = 0;
    for (const item of items) {
      acc += weight(item);
      if (roll <= acc) return item;
    }
    return items[items.length - 1];
  }
}
