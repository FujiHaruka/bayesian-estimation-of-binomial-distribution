import { generateBetaDistributionData } from "./beta";
import {
  createBetaDistributionChart,
  createTrialCumulativeSumChart,
  createTrialDotChart,
} from "./charts";
import { setIntervalUntilN } from "./setIntervalUntilN";

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

  const betaChart = createBetaDistributionChart(
    betaChartCanvas as HTMLCanvasElement,
    { alpha, beta },
  );

  const trialDotChart = createTrialDotChart(
    trialDotChartCanvas as HTMLCanvasElement,
  );

  const trialBarChart = createTrialCumulativeSumChart(
    trialBarChartCanvas as HTMLCanvasElement,
    { suggestedMin: -1 * TRIALS, suggestedMax: TRIALS },
  );

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
        break;
      }
      case "failure": {
        failures += 1;
        beta += 1;
        break;
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
          x: (trials - 1) % 10,
          y: Math.floor((trials - 1) / 10),
        });
        break;
      }
      case "failure": {
        trialDotChart.data.datasets[1].data.push({
          x: (trials - 1) % 10,
          y: Math.floor((trials - 1) / 10),
        });
        break;
      }
    }
    trialDotChart.update();
  });

  setIntervalUntilN(
    () => {
      (runButton as HTMLButtonElement).click();
    },
    1000,
    TRIALS,
  );
});
