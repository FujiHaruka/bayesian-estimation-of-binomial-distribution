export function createBeta(a: number, b: number) {
  return function beta(x: number) {
    return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1);
  };
}
