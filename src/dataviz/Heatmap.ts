import { select, type Selection } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { min, max } from "d3-array";

type D3SvgSelection = Selection<SVGSVGElement, unknown, null, undefined>;

const defaultColors = {
  start: "#cacaca",
  end: "blue",
};

interface Datum {
  value: number;
}

type HeatmapArgs = {
  node: HTMLElement | string;
  data: Datum[];
  rows: number;
  width: number;
  height: number;
  cellSpacing?: number;
  colors?: { start: string; end: string };
  direction?: "row" | "column";
};

type IsDefined<T> = Exclude<T, undefined>;

export default class Heatmap {
  node: HTMLElement;
  data: HeatmapArgs["data"];
  rows: HeatmapArgs["rows"];
  width: HeatmapArgs["width"];
  height: HeatmapArgs["height"];
  cellSpacing: IsDefined<HeatmapArgs["cellSpacing"]>;
  colors: IsDefined<HeatmapArgs["colors"]>;
  direction: IsDefined<HeatmapArgs["direction"]>;
  svg?: D3SvgSelection;

  constructor({
    node,
    data,
    rows,
    width,
    height,
    colors = defaultColors,
    cellSpacing = 2,
    direction = "row",
  }: HeatmapArgs) {
    this.node =
      typeof node === "string"
        ? (document.querySelector(node) as HTMLElement)
        : node;
    this.data = data;
    this.colors = colors;
    this.rows = rows;
    this.width = width;
    this.height = height;
    this.cellSpacing = cellSpacing;
    this.direction = direction;
  }

  destroy() {
    this.svg?.remove();
  }

  renderGrid(svg: D3SvgSelection, width: number, height: number) {
    const { data, rows, colors, direction, cellSpacing } = this;
    const cols = data.length / rows;
    const cellHeight = height / rows;
    const cellWidth = width / cols;

    const values = data.map((d) => d.value);

    const colorScale = scaleLinear<string>()
      .domain([min(values) as number, max(values) as number])
      .range([colors.start, colors.end]);

    let cellX, cellY;
    switch (direction) {
      case "column":
        cellX = (_: Datum, index: number) =>
          cellWidth * Math.floor(index / rows);
        cellY = (_: Datum, index: number) =>
          cellHeight * Math.floor(index % rows);
        break;
      default:
        cellX = (_: Datum, index: number) =>
          cellWidth * Math.floor(index % cols);
        cellY = (_: Datum, index: number) =>
          cellHeight * Math.floor(index / cols);
    }

    const gridG = svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("width", cellWidth - cellSpacing)
      .attr("height", cellHeight - cellSpacing)
      .attr("fill", (d) => colorScale(d.value))
      .attr("x", cellX)
      .attr("y", cellY);

    return gridG;
  }

  render() {
    const { node, width, height } = this;

    this.svg = select(node)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height);

    this.renderGrid(this.svg, width, height);
  }
}
