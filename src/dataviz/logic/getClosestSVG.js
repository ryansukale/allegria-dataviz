import { select } from "d3-selection";

export default function getClosestSVG(container) {
  return select(container.node().closest("svg"));
}
