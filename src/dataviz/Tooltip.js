/**
 * Inspired by https://observablehq.com/@siliconjazz/basic-svg-tooltip
 */
import destroy from "./logic/destroy";
import getClosest from "./logic/getClosest";
import { select, pointer } from "d3-selection";

const getClosestSVG = getClosest("svg");

export default class Tooltip {
  mouseOffset = { x: 10, y: 10 };
  styleTag = null;
  foreignObject = null;
  tooltip = null;
  svg = null;

  style = `
    .svg-tooltip {
      background-color: rgba(255, 255, 255, 0.7);
      position: absolute;
      transform: translate(178px, 410.19px);
      border-style: solid;
      border-color: black;
      border-width: 1px;
      border-radius: 2px;
      font-family: sans-serif;
      font-size: 12px;
      padding: 8px;
      visibility: hidden;
      max-width: 150px;
  }`;

  constructor(nodes, getMarkup) {
    this.svg = getClosestSVG(nodes);
    this.styleTag = this.svg.append("style").text(this.style);
    this.foreignObject = this.svg
      .append("foreignObject")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("pointer-events", "none");
    this.tooltip = this.foreignObject
      .append("xhtml:div")
      .attr("class", "svg-tooltip");

    nodes.on("mouseover", (event, d) => {
      const [x, y] = pointer(event);
      const markup = getMarkup(d);
      this.show(markup, x, y);
    });

    nodes.on("mouseout", () => {
      this.hide();
    });
  }

  destroy() {
    destroy([this.styleTag, this.foreignObject]);
  }

  show(markup, x, y) {
    const { tooltip, svg, mouseOffset } = this;

    let posX = x + mouseOffset.x;
    let posY = y + mouseOffset.y;

    tooltip.html(markup);
    tooltip.style("visibility", "visible");

    const svgBox = svg.node().getBBox();
    const tooltipBox = tooltip.node().getBoundingClientRect();

    if (posX > svgBox.width - tooltipBox.width) {
      posX = x - tooltipBox.width - mouseOffset.x;
    }
    if (posY > svgBox.height - tooltipBox.height) {
      posY = y - tooltipBox.height - mouseOffset.y;
    }

    tooltip.style("transform", `translate(${posX}px,${posY}px)`);
  }

  hide() {
    this.tooltip.style("visibility", "hidden");
  }
}
