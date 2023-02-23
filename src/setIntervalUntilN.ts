export function setIntervalUntilN(
  callback: () => void,
  interval: number,
  n: number,
): void {
  let count = 0;
  const intervalId = setInterval(() => {
    callback();
    count++;
    if (count >= n) {
      clearInterval(intervalId);
    }
  }, interval);
}
