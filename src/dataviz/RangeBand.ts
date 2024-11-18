import { select } from "d3-selection";
import { type D3BrushEvent } from "d3-brush";
import createBrush from "./logic/createBrush";

type RangeBandArgs = {
  node: HTMLElement | string;
  svg?: D3Selection["SVG"];
  width: number;
  height: number;
};
export default class RangeBand {
  svg?: D3Selection["SVG"];
  node: HTMLElement;
  width: RangeBandArgs["width"];
  height: RangeBandArgs["height"];

  constructor({ node, width, height }: RangeBandArgs) {
    this.node =
      typeof node === "string"
        ? (document.querySelector(node) as HTMLElement)
        : node;
    this.width = width;
    this.height = height;
  }

  destroy() {
    this.svg?.remove();
  }

  onBrushed = (e: D3BrushEvent<unknown>) => {
    const brushExtent = e.selection;
    console.log(brushExtent);
  };

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
      onBrush: this.onBrushed,
    });
  }
}
