import { type Selection, type BaseType } from "d3-selection";

export type AttributeMap = {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export default function setAttrs<
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  attributes: AttributeMap | undefined,
  selection: Selection<GElement, Datum, PElement, PDatum>
) {
  if (!attributes) return;
  Object.entries(attributes).forEach(([attribute, val]) => {
    selection.attr(attribute, val);
  });
}
