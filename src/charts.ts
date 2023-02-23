import { Chart } from "chart.js/auto";
import { seq } from "./arrays";
import { generateBetaDistributionData } from "./beta";

export function createBetaDistributionChart(
  canvas: HTMLCanvasElement,
  { alpha, beta }: { alpha: number; beta: number }
) {
  const data = generateBetaDistributionData(alpha, beta);
  return new Chart(canvas, {
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
    },
  });
}

export function createTrialDotChart(canvas: HTMLCanvasElement) {
  return new Chart(canvas, {
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
    },
  });
}

export function createTrialCumulativeSumChart(
  canvas: HTMLCanvasElement,
  {
    suggestedMin,
    suggestedMax,
  }: {
    suggestedMin: number;
    suggestedMax: number;
  }
) {
  return new Chart(canvas, {
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
    },
  });
}
