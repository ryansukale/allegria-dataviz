import { select } from "d3-selection";
import { curry } from "ramda";

const getClosest = curry((nodeName, selection) => {
  return select(selection.node().closest(nodeName));
});

export default getClosest;
