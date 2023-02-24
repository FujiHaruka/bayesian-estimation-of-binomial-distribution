const GOLDEN_RATIO = (3 - Math.sqrt(5)) / 2;

export class GoldenSectionSearch {
  private middle1: number;
  private middle2: number;

  private readonly cache = new Map<number, number>();

  constructor(
    private readonly func: (x: number) => number,
    private lower: number,
    private upper: number,
    private readonly options = {
      maxAttempts: 100,
      precision: 0.001,
    }
  ) {
    if (upper - lower <= 0) {
      throw new Error("Upper must be larger than lower");
    }

    const [middle1, middle2] = this.calcMiddlePoints(lower, upper);
    this.middle1 = middle1;
    this.middle2 = middle2;
  }

  searchLocalMinimum(): { x: number; y: number } {
    let { upper, middle1, middle2, lower } = this;
    let count = 0;
    while (upper - lower > 0.0001) {
      const points = this.calcNextFourPoints(lower, middle1, middle2, upper);
      lower = points[0];
      middle1 = points[1];
      middle2 = points[2];
      upper = points[3];

      count++;
      if (count > this.options.maxAttempts) {
        console.error({ upper: this.upper, lower: this.lower, count });
        throw new Error("Max attempts exeeded");
      }
    }

    // Is the average appropreate?
    const x = (upper + lower) / 2;
    const y = this.calcFuncValue(x);
    return {
      x,
      y,
    };
  }

  private calcNextFourPoints(
    lower: number,
    middle1: number,
    middle2: number,
    upper: number
  ) {
    const [lowerVal, m1Val, m2Val, upperVal] = [
      lower,
      middle1,
      middle2,
      upper,
    ].map((x) => this.calcFuncValue(x));

    if ([m1Val, m2Val].every((val) => lowerVal < val)) {
      throw new Error(
        "Lower value must not be smaller than both of middle values"
      );
    }
    if ([m1Val, m2Val].every((val) => upperVal < val)) {
      throw new Error(
        "Upper value must not be smaller than both of middle values"
      );
    }

    if (m1Val < m2Val) {
      // Local minimum is between lower and middle2
      return [lower, ...this.calcMiddlePoints(lower, middle2), middle2];
    } else if (m1Val > m2Val) {
      // Local minumum is between middle1 and upper
      return [middle1, ...this.calcMiddlePoints(middle1, upper), upper];
    } else {
      // Local minumum is between middle1 and middle2
      return [middle1, ...this.calcMiddlePoints(middle1, upper), middle2];
    }
  }

  private calcFuncValue(x: number): number {
    if (this.cache.has(x)) {
      return this.cache.get(x)!;
    }

    const value = this.func(x);
    this.cache.set(x, value);
    return value;
  }

  private calcMiddlePoints(lower: number, upper: number): [number, number] {
    const width = upper - lower;
    const middle1 = lower + width * GOLDEN_RATIO;
    const middle2 = upper - width * GOLDEN_RATIO;
    return [middle1, middle2];
  }
}
