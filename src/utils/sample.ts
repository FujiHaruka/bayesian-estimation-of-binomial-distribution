export type SampleResult = "success" | "failure";

export function generateSample(probability: number): SampleResult {
  return Math.random() < probability ? "success" : "failure";
}
