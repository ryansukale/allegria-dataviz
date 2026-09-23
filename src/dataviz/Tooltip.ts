import { pointer, select, type Selection } from "d3-selection";
import destroy from "./logic/destroy";

type Disposable = { remove(): unknown };

export default class Tooltip<DatumType = unknown> {
  mouseOffset = { x: 10, y: 10 };
  styleTag: Disposable | undefined;
  foreignObject: Disposable | undefined;
  tooltip: D3Selection["DIV"] | undefined;
  svg: D3Selection["SVG"];

  style = `
    .allegria-tooltip-container {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.7);
      border-style: solid;
      border-color: black;
      border-width: 1px;
      border-radius: 2px;
      font-size: 12px;
      padding: 8px;
      visibility: hidden;
    }`;

  constructor(
    nodes: Selection<SVGRectElement, DatumType, SVGGElement, unknown>,
    getMarkup: (datum: DatumType) => string | undefined,
  ) {
    const svgNode = nodes.node()?.closest("svg");
    if (!svgNode) throw new Error("Tooltip nodes must be inside an SVG element");

    this.svg = select(svgNode as SVGSVGElement);
    this.styleTag = this.svg.append("style").text(this.style);
    const foreignObject = this.svg
      .append("foreignObject")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("pointer-events", "none");
    this.foreignObject = foreignObject;
    this.tooltip = foreignObject
      .append("xhtml:div")
      .attr("class", "allegria-tooltip-container");

    nodes.on("mouseover", (event, datum) => {
      const markup = getMarkup(datum);
      if (markup) {
        const [x, y] = pointer(event);
        this.show(markup, x, y);
      }
    });

    nodes.on("mouseout", () => this.hide());
  }

  destroy() {
    destroy([this.styleTag, this.foreignObject]);
  }

  show(markup: string, x: number, y: number) {
    const { tooltip, svg, mouseOffset } = this;
    if (!tooltip || !svg) return;

    let posX = x + mouseOffset.x;
    let posY = y + mouseOffset.y;

    tooltip.html(markup);
    tooltip.style("visibility", "visible");

    const svgBox = svg.node()?.getBBox();
    const tooltipBox = tooltip.node()?.getBoundingClientRect();
    if (!svgBox || !tooltipBox) return;

    if (posX > svgBox.width - tooltipBox.width) {
      posX = x - tooltipBox.width - mouseOffset.x;
    }
    if (posY > svgBox.height - tooltipBox.height) {
      posY = y - tooltipBox.height - mouseOffset.y;
    }

    tooltip.style("transform", `translate(${posX}px,${posY}px)`);
  }

  hide() {
    this.tooltip?.style("visibility", "hidden");
  }
}
