import { Chart } from "chart.js/auto";
import jStat from "jstat";
import { seq } from "./arrays";
import { setIntervalUntilN } from "./setIntervalUntilN";

const DATA_SIZE = 1000;

function generateBetaDistributionData(
  alpha: number,
  beta: number,
): { x: number; y: number }[] {
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
  const [
    trialDotChartCanvas,
    trialBarChartCanvas,
    betaChartCanvas,
    runButton,
    trueProbabilityInput,
    trialsInput,
  ] = [
    "#trial-dot-chart",
    "#traial-bar-chart",
    "#beta-chart",
    "#run-simulation",
    "#true-probability",
    "#trials",
  ].map((selector) => document.querySelector(selector));

  if (
    !trialDotChartCanvas || !trialBarChartCanvas || !betaChartCanvas ||
    !runButton || !trueProbabilityInput || !trialsInput
  ) {
    throw new Error("Expected elements not found");
  }

  const TRIALS = 30;

  let trials = 0;
  let successes = 0;
  let failures = 0;
  let alpha = 1;
  let beta = 1;

  const data = generateBetaDistributionData(alpha, beta);
  const betaChart = new Chart(betaChartCanvas as HTMLCanvasElement, {
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

  const trialDotChart = new Chart(trialDotChartCanvas as HTMLCanvasElement, {
    type: "scatter",
    data: {
      labels: [],
      datasets: [
        {
          label: "Success",
          data: [] as { x: number; y: number }[],
        },
        {
          label: "Failure",
          data: [] as { x: number; y: number }[],
        },
      ],
    },
    options: {
      elements: {
        point: {
          radius: 5,
        },
      },
      scales: {
        x: {
          suggestedMax: TRIALS,
          suggestedMin: 0,
        },
      },
      animation: false,
    },
  });

  const trialBarChart = new Chart(trialBarChartCanvas as HTMLCanvasElement, {
    type: "bar",
    data: {
      labels: seq({ start: 1, size: TRIALS }),
      datasets: [
        {
          label: "Success",
          data: [] as number[],
        },
        {
          label: "Failure",
          data: [] as number[],
        },
      ],
    },
    options: {
      scales: {
        x: {
          stacked: true,
        },
        y: {
          suggestedMax: TRIALS,
          suggestedMin: -1 * TRIALS,
          stacked: true,
        },
      },
    },
  });

  (runButton as HTMLButtonElement).addEventListener("click", (ev) => {
    ev.preventDefault();

    const probability = (trueProbabilityInput as HTMLInputElement)
      .valueAsNumber;
    // const TRIALS = (trialsInput as HTMLInputElement).valueAsNumber

    const sample = generateSample(probability);

    trials += 1;
    switch (sample) {
      case "success": {
        successes += 1;
        alpha += 1;
      }
      case "failure": {
        failures += 1;
        beta += 1;
      }
    }

    console.log({ trials, probability, sample, successes, failures });

    // Update beta chart
    betaChart.data.datasets[0].label = `Beta(${alpha}, ${beta})`;
    betaChart.data.datasets[0].data = generateBetaDistributionData(alpha, beta)
      .map(({ y }) => y);

    betaChart.update();

    // Update trial bar chart
    // success
    trialBarChart.data.datasets[0].data.push(successes);
    // failure
    trialBarChart.data.datasets[1].data.push(-1 * failures);
    trialBarChart.update();

    // Update trial dot chart
    switch (sample) {
      case "success": {
        trialDotChart.data.datasets[0].data.push({
          x: trials,
          y: 0,
        });
      }
      case "failure": {
        trialDotChart.data.datasets[1].data.push({
          x: trials,
          y: 0,
        });
      }
    }
    trialDotChart.update();
  });

  setIntervalUntilN(
    () => {
      (runButton as HTMLButtonElement).click();
    },
    2000,
    TRIALS,
  );
});
