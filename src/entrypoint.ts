import type { Chart } from "chart.js/auto";
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
  ].map((selector) => document.querySelector(selector)) as [
    HTMLCanvasElement,
    HTMLCanvasElement,
    HTMLCanvasElement,
    HTMLButtonElement,
    HTMLInputElement,
    HTMLInputElement
  ];

  if (
    !trialDotChartCanvas ||
    !trialBarChartCanvas ||
    !betaChartCanvas ||
    !runButton ||
    !trueProbabilityInput ||
    !trialsInput
  ) {
    throw new Error("Expected elements not found");
  }

  const TRIALS = 30;

  const betaChart = createBetaDistributionChart(betaChartCanvas, {
    alpha: 1,
    beta: 1,
  });

  const trialDotChart = createTrialDotChart(trialDotChartCanvas);

  const trialBarChart = createTrialCumulativeSumChart(trialBarChartCanvas, {
    suggestedMin: -1 * TRIALS,
    suggestedMax: TRIALS,
  });

  runButton.addEventListener("click", (ev) => {
    ev.preventDefault();

    const probability = trueProbabilityInput.valueAsNumber;
    const totalTrials = trialsInput.valueAsNumber;
    const trial = new Trial({
      probability,
      betaChart,
      trialDotChart,
      trialBarChart,
    });

    setIntervalUntilN(
      () => {
        trial.doOneTrial();
      },
      1000,
      totalTrials
    );

    runButton.disabled = true;
    trueProbabilityInput.disabled = true;
    trialsInput.disabled = true;
  });
});

class Trial {
  public readonly probability: number;

  public trials = 0;
  public successes = 0;
  public failures = 0;
  public alpha = 1;
  public beta = 1;

  private betaChart: Chart;
  private trialDotChart: Chart;
  private trialBarChart: Chart;

  constructor({
    probability,
    betaChart,
    trialDotChart,
    trialBarChart,
  }: {
    probability: number;
    betaChart: Chart;
    trialDotChart: Chart;
    trialBarChart: Chart;
  }) {
    this.probability = probability;
    this.betaChart = betaChart;
    this.trialDotChart = trialDotChart;
    this.trialBarChart = trialBarChart;
  }

  doOneTrial() {
    const { probability, betaChart, trialDotChart, trialBarChart } = this;

    const sample = generateSample(probability);

    this.trials += 1;
    switch (sample) {
      case "success": {
        this.successes += 1;
        this.alpha += 1;
        break;
      }
      case "failure": {
        this.failures += 1;
        this.beta += 1;
        break;
      }
    }

    // Update beta chart
    betaChart.data.datasets[0].label = `Beta(${this.alpha}, ${this.beta})`;
    betaChart.data.datasets[0].data = generateBetaDistributionData(
      this.alpha,
      this.beta
    ).map(({ y }) => y);

    betaChart.update();

    // Update trial bar chart
    trialBarChart.data.datasets[0].data.push(this.successes);
    trialBarChart.data.datasets[1].data.push(-1 * this.failures);
    trialBarChart.update();

    // Update trial dot chart
    const indexToUpdate = sample === "success" ? 0 : 1;
    trialDotChart.data.datasets[indexToUpdate].data.push({
      x: (this.trials - 1) % 10,
      y: Math.floor((this.trials - 1) / 10),
    });
    trialDotChart.update();
  }
}
