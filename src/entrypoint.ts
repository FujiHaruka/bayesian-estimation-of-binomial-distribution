import { Chart } from "chart.js/auto";
import jStat from "jstat";

const data = Array.from({ length: 1000 }).map((_, i) => {
  const x = i / 1000;
  return { x, y: jStat.beta.pdf(x, 120, 80) };
});

console.log(jStat.beta.mode(120, 80));

globalThis.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("chart");
  if (!canvas) {
    throw new Error("Canvas not found");
  }

  new Chart(canvas as HTMLCanvasElement, {
    type: "line",
    data: {
      labels: data.map((row) => row.x),
      datasets: [
        {
          label: "Beta(2, 3)",
          data: data.map((row) => row.y),
          pointRadius: 0,
          fill: true,
          cubicInterpolationMode: "monotone",
        },
      ],
    },
  });
});
