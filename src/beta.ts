import jStat from "jstat";
import { BinarySearch } from "./BinarySearch";
import { GoldenSectionSearch } from "./GoldenSectionSearch";

const DATA_SIZE = 1000;

export function generateBetaDistributionData(
  alpha: number,
  beta: number
): { x: number; y: number }[] {
  return Array.from({ length: DATA_SIZE }, (_, i) => {
    const x = i / DATA_SIZE;
    return { x, y: jStat.beta.pdf(x, alpha, beta) };
  });
}

export function generateHPD(
  alpha: number,
  beta: number
): { x: number; y: number }[] {
  if (alpha <= 1 || beta <= 1) {
    return [];
  }

  try {
    const result = new BetaDistribution(alpha, beta).searchHPD(0.9);
    // console.log(result)
    const { y } = result;

    return Array.from({ length: DATA_SIZE }, (_, i) => {
      const x = i / DATA_SIZE;
      return { x, y };
    });
  } catch (err) {
    return [];
  }
}

// TODO: I want to write unit tests
// TODO: this has the low precision

export class BetaDistribution {
  constructor(readonly alpha: number, readonly beta: number) {}

  pdf(x: number): number {
    return jStat.beta.pdf(x, this.alpha, this.beta);
  }

  cdf(x: number): number {
    return jStat.beta.cdf(x, this.alpha, this.beta);
  }

  private _mode: number | null = null;

  mode(): number {
    if (this._mode !== null) {
      return this._mode;
    }
    const mode = jStat.beta.mode(this.alpha, this.beta);
    this._mode = mode;
    return mode;
  }

  searchHPD(confidence: number): { lowerX: number; upperX: number; y: number } {
    const mode = this.mode();
    const minWidthSearcher = new GoldenSectionSearch(
      (lower) => {
        const upper = this.searchUpper({
          lower,
          probability: confidence,
        });
        if (upper === null) {
          return 10;
        }

        const width = upper - lower;
        return width;
      },
      0 + 0.001,
      mode - 0.001
    );
    const { x: lowerX } = minWidthSearcher.searchLocalMinimum();
    const upperX = this.searchUpper({
      lower: lowerX,
      probability: confidence,
    })!;

    return {
      lowerX,
      upperX,
      y: this.pdf(lowerX),
    };
  }

  /**
   * Find the upper x which satisfies the condition:
   * the CDF value between the lower and the upper equals to the given probability.
   */
  private searchUpper({
    lower,
    probability,
  }: {
    lower: number;
    probability: number;
  }): number | null {
    try {
      const lowerProbability = this.cdf(lower);
      return new BinarySearch({
        type: "inc",
        fn: (x) => this.cdf(x) - lowerProbability,
      }).search(probability, this.mode(), 1);
    } catch (err) {
      // cannot find
      return null;
    }
  }
}
