import {
  BetaChart,
  createBetaDistributionChart,
  createTrialCumulativeSumChart,
  createTrialDotChart,
  TrialCumulativeSumChart,
  TrialDotChart,
} from "./charts";
import { setSmartInterval } from "./interval";
import { generateSample } from "./sample";

window.addEventListener("DOMContentLoaded", () => {
  const [
    trialDotChartCanvas,
    cumulativeSumChartCanvas,
    betaChartCanvas,
    runButton,
    trueProbabilityInput,
    trialsInput,
    priorAlphaInput,
    priorBetaInput,
  ] = [
    "#trial-dot-chart",
    "#traial-cumulative-sum-chart",
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
    !cumulativeSumChartCanvas ||
    !betaChartCanvas ||
    !runButton ||
    !trueProbabilityInput ||
    !trialsInput
  ) {
    throw new Error("Expected elements not found");
  }

  const defaults = {
    priorAlpha: priorAlphaInput.valueAsNumber,
    priorBeta: priorBetaInput.valueAsNumber,
    trials: trialsInput.valueAsNumber,
  };

  const betaChart = createBetaDistributionChart(betaChartCanvas, {
    alpha: defaults.priorAlpha,
    beta: defaults.priorBeta,
  });
  const trialDotChart = createTrialDotChart(trialDotChartCanvas);
  const cumulativeSumChart = createTrialCumulativeSumChart(
    cumulativeSumChartCanvas,
    {
      max: defaults.trials,
    }
  );

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
      cumulativeSumChart,
    });

    setSmartInterval(
      (count) => {
        trial.doSingleTrial();
      },
      {
        nTimes: totalTrials,
      }
    );

    runButton.disabled = true;
    trueProbabilityInput.disabled = true;
    trialsInput.disabled = true;
    priorAlphaInput.disabled = true;
    priorBetaInput.disabled = true;
  });

  trialsInput.addEventListener("input", () => {
    const totalTrials = trialsInput.valueAsNumber;
    cumulativeSumChart.updateAxises({ max: totalTrials });
  });

  priorAlphaInput.addEventListener("input", () => {
    const priorAlpha = priorAlphaInput.valueAsNumber;
    const priorBeta = priorBetaInput.valueAsNumber;
    betaChart.update({ alpha: priorAlpha, beta: priorBeta });
  });

  priorBetaInput.addEventListener("input", () => {
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
  private cumulativeSumChart: TrialCumulativeSumChart;

  constructor({
    probability,
    priorAlpha,
    priorBeta,
    betaChart,
    trialDotChart,
    cumulativeSumChart,
  }: {
    probability: number;
    priorAlpha: number;
    priorBeta: number;
    betaChart: BetaChart;
    trialDotChart: TrialDotChart;
    cumulativeSumChart: TrialCumulativeSumChart;
  }) {
    this.probability = probability;
    this.alpha = priorAlpha;
    this.beta = priorBeta;
    this.betaChart = betaChart;
    this.trialDotChart = trialDotChart;
    this.cumulativeSumChart = cumulativeSumChart;
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
    this.cumulativeSumChart.add({
      successes: this.successes,
      failures: this.failures,
    });
    this.trialDotChart.add(sample);
  }
}
