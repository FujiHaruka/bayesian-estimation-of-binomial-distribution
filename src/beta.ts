import jStat from "jstat";

export function generateBetaDistributionData(
  alpha: number,
  beta: number
): { x: number; y: number }[] {
  const DATA_SIZE = 1000;
  const data = Array.from({ length: DATA_SIZE }).map((_, i) => {
    const x = i / DATA_SIZE;
    return { x, y: jStat.beta.pdf(x, alpha, beta) };
  });
  return data;
}
