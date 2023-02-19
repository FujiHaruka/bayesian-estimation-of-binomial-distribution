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

type SampleResult = "success" | "failure";

function generateSample(probability: number): SampleResult {
  return Math.random() < probability ? "success" : "failure";
}

window.addEventListener("DOMContentLoaded", () => {
  const [chartCanvas, runButton, trueProbabilityInput, trialsInput] = [
    "#chart",
    "#run-simulation",
    "#true-probability",
    "#trials",
  ].map((selector) => document.querySelector(selector));

  if (!chartCanvas || !runButton || !trueProbabilityInput || !trialsInput) {
    throw new Error("Expected elements not found");
  }

  let trials = 0;
  let alpha = 1;
  let beta = 1;

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
    const probability = (trueProbabilityInput as HTMLInputElement)
      .valueAsNumber;
    // const TRIALS = (trialsInput as HTMLInputElement).valueAsNumber

    const sample = generateSample(probability);

    // trials += 1
    console.log({ trials, probability, sample });

    alpha = sample === "success" ? alpha + 1 : alpha;
    beta = sample === "failure" ? beta + 1 : beta;

    chart.data.datasets[0].label = `Beta(${alpha}, ${beta})`;
    chart.data.datasets[0].data = generateData(alpha, beta).map(({ y }) => y);

    chart.update();
  });
});
