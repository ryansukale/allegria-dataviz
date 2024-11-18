import { select, type Selection } from "d3-selection";
import { brushX, type D3BrushEvent } from "d3-brush";

type D3SvgSelection = Selection<SVGSVGElement, unknown, null, undefined>;
type D3GSelection = Selection<SVGGElement, unknown, null, undefined>;

type RangeBandArgs = {
  node: HTMLElement | string;
  svg?: D3SvgSelection;
  width: number;
  height: number;
};
export default class RangeBand {
  svg?: D3SvgSelection;
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

  initializeBrush(container: D3GSelection) {
    const brush = brushX()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on("brush end", this.onBrushed);

    container.call(brush);
  }

  onBrushed(e: D3BrushEvent<SVGGElement>) {
    const brushExtent = e.selection;
    console.log(brushExtent);
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

    this.initializeBrush(container);
  }
}
