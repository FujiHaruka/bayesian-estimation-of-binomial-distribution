export class BinarySearch {
  private lowerY = 0;
  private upperY = 0;

  constructor(
    private readonly monotonicFunc: {
      type: "inc" | "dec";
      fn: (x: number) => number;
    },
    private readonly options = {
      precision: 0.0001,
    }
  ) {}

  search(target: number, lower: number, upper: number): number {
    const lowerY = this.monotonicFunc.fn(lower);
    const upperY = this.monotonicFunc.fn(upper);

    if (this.monotonicFunc.type === "inc") {
      if (lowerY >= upperY) {
        throw new Error(`Wrong monotonic func type: "inc"`);
      }
      if (target >= upperY) {
        throw new Error(`Invalid target`);
      }
    }
    if (this.monotonicFunc.type === "dec") {
      if (lowerY <= upperY) {
        throw new Error(`Wrong monotonic func type: "dec"`);
      }
      if (target >= lowerY) {
        throw new Error("Invalid target");
      }
    }
    this.lowerY = lowerY;
    this.upperY = upperY;

    return this.recursiveSearch(target, lower, upper);
  }

  private recursiveSearch(
    target: number,
    lower: number,
    upper: number
  ): number {
    const mid = (lower + upper) / 2;

    const midVal = this.monotonicFunc.fn(mid);
    if (Math.abs(target - midVal) < this.options.precision) {
      return mid;
    }

    // validations
    if (
      this.monotonicFunc.type === "inc" &&
      !(this.lowerY <= midVal && midVal <= this.upperY)
    ) {
      throw new Error("Invalid mid value");
    }
    if (
      this.monotonicFunc.type === "dec" &&
      !(this.lowerY >= midVal && midVal >= this.upperY)
    ) {
      throw new Error("Invalid mid value");
    }

    let nextLower = lower;
    let nextUpper = upper;
    switch (this.monotonicFunc.type) {
      case "inc": {
        if (midVal < target) {
          nextLower = mid;
        } else {
          nextUpper = mid;
        }
        break;
      }
      case "dec": {
        if (midVal > target) {
          nextLower = mid;
        } else {
          nextUpper = mid;
        }
        break;
      }
    }

    return this.recursiveSearch(target, nextLower, nextUpper);
  }
}
