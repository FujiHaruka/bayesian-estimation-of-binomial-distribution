import { Chart } from "chart.js/auto";
import jStat from "jstat";

const DATA_SIZE = 1000;

function generateData(alpha: number, beta: number): { x: number; y: number }[] {
  const data = Array.from({ length: DATA_SIZE }).map((_, i) => {
    const x = i / DATA_SIZE;
    return { x, y: jStat.beta.pdf(x, alpha, beta) };
  });
  return data;
}

console.log(jStat.beta.mode(120, 80));

window.addEventListener("DOMContentLoaded", () => {
  const [chartCanvas, runButton] = ["#chart", "#run-simulation"].map(
    (selector) => document.querySelector(selector)
  );

  if (!chartCanvas) {
    throw new Error("Expected elements not found");
  }

  let alpha = 2;
  let beta = 3;

  const data = generateData(alpha, beta);
  const chart = new Chart(chartCanvas as HTMLCanvasElement, {
    type: "line",
    data: {
      labels: data.map((row) => row.x),
      datasets: [
        {
          label: `Beta(${alpha}, ${beta})`,
          data: data.map((row) => row.y),
          pointRadius: 0,
          fill: true,
          cubicInterpolationMode: "monotone",
        },
      ],
    },
  });

  (runButton as HTMLButtonElement).addEventListener("click", () => {
    alpha += 1;
    beta += 1;

    chart.data.datasets[0].label = `Beta(${alpha}, ${beta})`;
    chart.data.datasets[0].data = generateData(alpha, beta).map(({ y }) => y);

    chart.update();
  });
});
