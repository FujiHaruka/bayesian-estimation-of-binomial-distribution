const initialInterval = 1000;

export function setSmartInterval(
  callback: (count: number) => void,
  { nTimes }: { nTimes: number }
) {
  let prevTimestamp = 0;
  let count = 0;

  function step(timestamp: number) {
    if (prevTimestamp === 0) {
      prevTimestamp = timestamp;
    }

    if (count >= nTimes) {
      return;
    }

    const elapsed = timestamp - prevTimestamp;
    const interval = Math.max(initialInterval - count * 50, 50);

    if (elapsed >= interval) {
      prevTimestamp = timestamp;
      count++;
      callback(count);
      setTimeout(() => {
        window.requestAnimationFrame(step);
      }, interval);
    } else {
      setTimeout(() => {
        window.requestAnimationFrame(step);
      }, interval - elapsed);
    }
  }

  window.requestAnimationFrame(step);
}
