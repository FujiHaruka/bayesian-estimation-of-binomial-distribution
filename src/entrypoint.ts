import { Chart } from "https://esm.sh/chart.js@4.2.1/auto";
import { createBeta } from "./func.ts";

const beta = createBeta(2, 3);
const data = Array.from({ length: 100 }).map((_, i) => {
  const x = i / 100;
  return { x, y: beta(x) };
});

globalThis.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("chart");
  if (!canvas) {
    throw new Error("Canvas not found");
  }

  new Chart(
    canvas as HTMLCanvasElement,
    {
      type: "line",
      data: {
        labels: data.map((row) => row.x),
        datasets: [
          {
            label: "Beta(2, 3)",
            data: data.map((row) => row.y),
            pointRadius: 0,
            fill: true,
          },
        ],
      },
    },
  );
});
