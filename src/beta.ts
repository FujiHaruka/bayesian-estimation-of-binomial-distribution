import jStat from "jstat";

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
): { x: number, y: number }[] {
  const [lower, upper] = betaPdfInv(0.3, alpha, beta)
  console.log(
    {
      lower,
      upper,
      cdf: jStat.beta.inv(upper, alpha, beta) - jStat.beta.inv(lower, alpha, beta),
      lowerY: lower && jStat.beta.pdf(lower, alpha, beta),
      upperY: upper && jStat.beta.pdf(upper, alpha, beta),
      // hdp: calcHPDHeight(alpha, beta),
    },
  )
  return Array.from({ length: DATA_SIZE }, (_, i) => {
    // calcCDFRangeFromHeight

    const height = (i / DATA_SIZE);

    let [lower, upper] = betaPdfInv(height, alpha, beta)
    if (Number.isNaN(lower)) {
      lower = 0
    }
    if (Number.isNaN(upper)) {
      upper = 1
    }
    const parcent = jStat.beta.inv(upper, alpha, beta) - jStat.beta.inv(lower, alpha, beta)
    console.log({ lower, upper, height, parcent })
    // console.log({ y, alpha, beta, lower, upper, range })

    return { x: height, y: jStat.beta.inv(upper, alpha, beta) };
  })
}

function calcHPDHeight(alpha: number, beta: number): number {
  if (alpha <= 1 && beta <= 1) {
    return -1
  }

  const calcCDFRangeFromHeight = (y: number) => {
    let [lower, upper] = betaPdfInv(y, alpha, beta)
    if (Number.isNaN(lower)) {
      lower = 0
    }
    if (Number.isNaN(upper)) {
      upper = 1
    }
    const range = jStat.beta.inv(upper, alpha, beta) - jStat.beta.inv(lower, alpha, beta)
    console.log({ y, alpha, beta, lower, upper, range })
    return range
  }
  return binarySearch(
    calcCDFRangeFromHeight,
    "dec",
    0.95,
    0,
    jStat.beta.mode(alpha, beta) - 0.01,
  )
}


/**
 * The inverse function of the PDF of the beta distribution.
 * It returns one or two x values that correspond to the given y value.
 */
function betaPdfInv(y: number, alpha: number, beta: number): [number, number] {
  const mode = jStat.beta.mode(alpha, beta)
  if (y === mode) {
    return [mode, mode]
  }

  if (mode === 0) {
    // only one value
    return [NaN, binarySearch((x) => jStat.beta.pdf(x, alpha, beta), "dec", y, 0, 1)]
  }
  if (mode === 1) {
    // only one value
    return [binarySearch((x) => jStat.beta.pdf(x, alpha, beta), "inc", y, 0, 1), NaN]
  }

  // two values
  return [binarySearch((x) => jStat.beta.pdf(x, alpha, beta), "inc", y, 0, mode), binarySearch((x) => jStat.beta.pdf(x, alpha, beta), "dec", y, mode, 1)]
}

function binarySearch(monotonicFunc: (x: number) => number, monotonic: "inc" | "dec", target: number, lowerBound: number, upperBound: number): number {
  const mid = (lowerBound + upperBound) / 2

  const midVal = monotonicFunc(mid)
  if (Math.abs(target - midVal) < 0.0001) {
    return mid
  }

  let nextLowerBound = lowerBound
  let nextUpperBound = upperBound
  switch (monotonic) {
    case "inc": {
      if (midVal < target) {
        nextLowerBound = mid
      } else {
        nextUpperBound = mid
      }
      break
    }
    case "dec": {
      if (midVal > target) {
        nextLowerBound = mid
      } else {
        nextUpperBound = mid
      }
      break
    }
  }

  return binarySearch(monotonicFunc, monotonic, target, nextLowerBound, nextUpperBound)
}
