export function seq({
  start = 0,
  size,
  step = 1,
}: {
  start?: number;
  size: number;
  step?: number;
}): number[] {
  return Array.from({ length: size }, (_, i) => start + i * step);
}
