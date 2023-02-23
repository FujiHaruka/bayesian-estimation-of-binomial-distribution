import { Chart } from "chart.js/auto";
import { seq } from "./arrays";
import { generateBetaDistributionData } from "./beta";

export type BetaChart = {
  update: (params: { alpha: number; beta: number }) => void;
};

export function createBetaDistributionChart(
  canvas: HTMLCanvasElement,
  { alpha, beta }: { alpha: number; beta: number }
): BetaChart {
  const data = generateBetaDistributionData(alpha, beta);
  const rawChart = new Chart(canvas, {
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
    options: {
      scales: {
        x: {
          type: "linear",
          min: 0,
          max: 1,
          ticks: {
            stepSize: 0.05,
          },
        },
        y: {
          suggestedMin: 0,
          suggestedMax: 2,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Posterior distribution of the success probability",
        },
      },
    },
  });

  return {
    update({ alpha, beta }) {
      rawChart.data.datasets[0].label = `Beta(${alpha}, ${beta})`;
      rawChart.data.datasets[0].data = generateBetaDistributionData(
        alpha,
        beta
      ).map(({ y }) => y);

      rawChart.update();
    },
  };
}

export type TrialDotChart = {
  add(sample: "success" | "failure"): void;
};

export function createTrialDotChart(canvas: HTMLCanvasElement): TrialDotChart {
  const rawChart = new Chart(canvas, {
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
          borderWidth: 3,
        },
      },
      scales: {
        x: {
          suggestedMin: -2,
          suggestedMax: 12,
          display: false,
        },
        y: {
          suggestedMin: -2,
          suggestedMax: 8,
          display: false,
          reverse: true,
        },
      },
      animation: false,
      plugins: {
        title: {
          display: true,
          text: "Individual trial results",
        },
        tooltip: {
          enabled: false,
        },
      },
    },
  });

  let trials = 0;

  return {
    add(sample) {
      const indexToUpdate = sample === "success" ? 0 : 1;
      rawChart.data.datasets[indexToUpdate].data.push({
        x: trials % 10,
        y: Math.floor(trials / 10),
      });
      trials += 1;
      rawChart.update();
    },
  };
}

export type TrialCumulativeSumChart = {
  add(params: { successes: number; failures: number }): void;
};

export function createTrialCumulativeSumChart(
  canvas: HTMLCanvasElement,
  {
    suggestedMin,
    suggestedMax,
  }: {
    suggestedMin: number;
    suggestedMax: number;
  }
): TrialCumulativeSumChart {
  const rawChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: seq({ start: 1, size: suggestedMax }),
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
      elements: {
        point: {
          radius: 0,
        },
        line: {
          fill: true,
          stepped: "after",
        },
      },
      scales: {
        y: {
          suggestedMax,
          suggestedMin,
        },
      },
      animation: false,
      plugins: {
        title: {
          display: true,
          text: "Cumulative sum of trial results",
        },
      },
    },
  });

  return {
    add({ successes, failures }) {
      rawChart.data.datasets[0].data.push(successes);
      rawChart.data.datasets[1].data.push(-1 * failures);
      rawChart.update();
    },
  };
}
