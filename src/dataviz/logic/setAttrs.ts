import { type Selection } from "d3-selection";

export type AttributeMap = {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default function setAttrs<T>(
  attributes: AttributeMap | undefined,
  selection: Selection<SVGRectElement, T, SVGGElement, unknown>
) {
  if (!attributes) return;
  Object.entries(attributes).forEach(([attribute, val]) => {
    selection.attr(attribute, val);
  });
}
