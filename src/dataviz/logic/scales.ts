import { scaleLinear, scaleOrdinal } from "d3-scale";
import { min, max } from "d3-array";

export function getLinearScale(values: number[], range: string[]) {
  return scaleLinear<string>()
    .domain([min(values) as number, max(values) as number])
    .range(range);
}

export function getOrdinalScale(values: string[], range: string[]) {
  return scaleOrdinal().domain(values).range(range);
}
