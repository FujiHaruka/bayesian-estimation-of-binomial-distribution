import {
  BetaChart,
  createBetaDistributionChart,
  createTrialCumulativeSumChart,
  createTrialDotChart,
  TrialCumulativeSumChart,
  TrialDotChart,
} from "./charts";
import { generateSample } from "./sample";
import { setIntervalUntilN } from "./setIntervalUntilN";

const Defaults = {
  PRIOR_ALPHA: 1,
  PRIOR_BETA: 1,
};

window.addEventListener("DOMContentLoaded", () => {
  const [
    trialDotChartCanvas,
    trialBarChartCanvas,
    betaChartCanvas,
    runButton,
    trueProbabilityInput,
    trialsInput,
    priorAlphaInput,
    priorBetaInput,
  ] = [
    "#trial-dot-chart",
    "#traial-bar-chart",
    "#beta-chart",
    "#run-simulation",
    "#true-probability",
    "#trials",
    "#prior-alpha",
    "#prior-beta",
  ].map((selector) => document.querySelector(selector)) as [
    HTMLCanvasElement,
    HTMLCanvasElement,
    HTMLCanvasElement,
    HTMLButtonElement,
    HTMLInputElement,
    HTMLInputElement,
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
    alpha: Defaults.PRIOR_ALPHA,
    beta: Defaults.PRIOR_BETA,
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
    const priorAlpha = priorAlphaInput.valueAsNumber;
    const priorBeta = priorBetaInput.valueAsNumber;
    const trial = new Trial({
      probability,
      priorAlpha,
      priorBeta,
      betaChart,
      trialDotChart,
      trialBarChart,
    });

    setIntervalUntilN(
      () => {
        trial.doSingleTrial();
      },
      1000,
      totalTrials
    );

    runButton.disabled = true;
    trueProbabilityInput.disabled = true;
    trialsInput.disabled = true;
    priorAlphaInput.disabled = true;
    priorBetaInput.disabled = true;
  });

  priorAlphaInput.addEventListener("change", () => {
    const priorAlpha = priorAlphaInput.valueAsNumber;
    const priorBeta = priorBetaInput.valueAsNumber;
    betaChart.update({ alpha: priorAlpha, beta: priorBeta });
  });

  priorBetaInput.addEventListener("change", () => {
    const priorAlpha = priorAlphaInput.valueAsNumber;
    const priorBeta = priorBetaInput.valueAsNumber;
    betaChart.update({ alpha: priorAlpha, beta: priorBeta });
  });
});

class Trial {
  public readonly probability: number;

  public trials = 0;
  public successes = 0;
  public failures = 0;

  public alpha: number;
  public beta: number;

  private betaChart: BetaChart;
  private trialDotChart: TrialDotChart;
  private trialBarChart: TrialCumulativeSumChart;

  constructor({
    probability,
    priorAlpha,
    priorBeta,
    betaChart,
    trialDotChart,
    trialBarChart,
  }: {
    probability: number;
    priorAlpha: number;
    priorBeta: number;
    betaChart: BetaChart;
    trialDotChart: TrialDotChart;
    trialBarChart: TrialCumulativeSumChart;
  }) {
    this.probability = probability;
    this.alpha = priorAlpha;
    this.beta = priorBeta;
    this.betaChart = betaChart;
    this.trialDotChart = trialDotChart;
    this.trialBarChart = trialBarChart;
  }

  doSingleTrial() {
    const sample = generateSample(this.probability);

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

    this.betaChart.update({ alpha: this.alpha, beta: this.beta });
    this.trialBarChart.add({
      successes: this.successes,
      failures: this.failures,
    });
    this.trialDotChart.add(sample);
  }
}
