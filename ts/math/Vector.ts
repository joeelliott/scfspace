export default class Vector {
  public static readonly ZERO: Vector = new Vector(0, 0);

  constructor(public readonly x: number, public readonly y: number) {}

  public static fromArray(array: Array<number>): Vector {
    if (array.length !== 2) throw new Error(`Expected an array of length 2, got ${array.length}`);
    return new Vector(array[0], array[1]);
  }

  public static fromPolar(radius: number, angle: number): Vector {
    return new Vector(radius * Math.cos(angle), radius * Math.sin(angle));
  }

  public magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  public add({ x, y }: Vector): Vector {
    return new Vector(this.x + x, this.y + y);
  }

  public subtract({ x, y }: Vector): Vector {
    return new Vector(this.x - x, this.y - y);
  }

  public scale(factor: number): Vector {
    return new Vector(this.x * factor, this.y * factor);
  }

  public rotate(angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  public resize(newMagnitude: number): Vector {
    const ratio = newMagnitude / this.magnitude();
    return this.scale(ratio);
  }

  public toArray(): Array<number> {
    return [this.x, this.y];
  }

  public toString(): string {
    return `[${this.x}, ${this.y}]`;
  }
}
