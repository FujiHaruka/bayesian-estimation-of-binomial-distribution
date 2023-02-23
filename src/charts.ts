import { Chart } from "chart.js/auto";
import { seq } from "./arrays";
import { generateBetaDistributionData, generateHPD } from "./beta";

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
          // https://github.com/chartjs/Chart.js/blob/6cc429ddde4808d8fcea7f8fe99693f7994d8a59/src/plugins/plugin.colors.ts#L19
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
        // {
        //   label: "95% HPD",
        //   data: [],
        //   pointRadius: 0,
        //   borderColor: "rgb(150, 150, 150)",
        // }
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

      // rawChart.data.datasets[1].data = generateHPD(alpha, beta).map(({y}) => y)

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
          text: "Trial results",
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
  updateAxises(params: { max: number }): void;
};

export function createTrialCumulativeSumChart(
  canvas: HTMLCanvasElement,
  {
    max,
  }: {
    max: number;
  }
): TrialCumulativeSumChart {
  const rawChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: seq({ start: 0, size: max }),
      datasets: [
        {
          label: "Success",
          data: [0] as number[],
        },
        {
          label: "Failure",
          data: [0] as number[],
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
          stepped: true,
        },
      },
      scales: {
        y: {
          suggestedMax: max,
          suggestedMin: -1 * max,
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
    updateAxises({ max }) {
      rawChart.data.labels = seq({ start: 0, size: max });
      rawChart.options.scales!.y!.min = -1 * max;
      rawChart.options.scales!.y!.max = max;
      rawChart.update();
    },
  };
}
