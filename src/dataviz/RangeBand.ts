import { select } from "d3-selection";
import { type D3BrushEvent } from "d3-brush";
import createBrush, { type BrushSelectionMode } from "./logic/createBrush";

export type RangeBandArgs = {
  node: HTMLElement | string;
  svg?: D3Selection["SVG"];
  width: number;
  height: number;
  selectionMode?: BrushSelectionMode;
  onStart?: (event: D3BrushEvent<unknown>) => void;
  onBrush?: (event: D3BrushEvent<unknown>) => void;
  onEnd?: (event: D3BrushEvent<unknown>) => void;
};
export default class RangeBand {
  svg?: D3Selection["SVG"];
  node: HTMLElement;
  width: RangeBandArgs["width"];
  height: RangeBandArgs["height"];
  selectionMode: BrushSelectionMode;

  onStart?: RangeBandArgs["onStart"];
  onBrush?: RangeBandArgs["onBrush"];
  onEnd?: RangeBandArgs["onEnd"];

  constructor({ node, width, height, selectionMode = "horizontal", onStart, onBrush, onEnd }: RangeBandArgs) {
    this.node =
      typeof node === "string"
        ? (document.querySelector(node) as HTMLElement)
        : node;
    this.width = width;
    this.height = height;
    this.selectionMode = selectionMode;
    this.onStart = onStart;
    this.onBrush = onBrush;
    this.onEnd = onEnd;
  }

  destroy() {
    this.svg?.remove();
  }

  renderContainer() {
    this.svg = select(this.node)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    return this.svg.append("g");
  }

  render() {
    const container = this.renderContainer();

    createBrush({
      container,
      selectionMode: this.selectionMode,
      size: { startX: 0, startY: 0, width: this.width, height: this.height },
      onStart: this.onStart,
      onBrush: this.onBrush,
      onEnd: this.onEnd,
    });
  }
}
