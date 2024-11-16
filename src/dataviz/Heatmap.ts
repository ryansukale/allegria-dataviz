import { select, type Selection } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { min, max } from "d3-array";

type D3SvgSelection = Selection<SVGSVGElement, unknown, null, undefined>;

const defaultColors = {
  start: "#cacaca",
  end: "blue",
};

type HeatmapArgs<DatumType> = {
  // Required
  node: HTMLElement | string;
  data: DatumType[];
  rows: number;
  width: number;
  height: number;
  getValue: (d: DatumType) => number;

  // Optional
  cellSpacing?: number;
  colors?: { start: string; end: string };
  direction?: "row" | "column";
};

type IsDefined<T> = Exclude<T, undefined>;

export default class Heatmap<DatumType> {
  node: HTMLElement;
  data: HeatmapArgs<DatumType>["data"];
  rows: HeatmapArgs<DatumType>["rows"];
  width: HeatmapArgs<DatumType>["width"];
  height: HeatmapArgs<DatumType>["height"];
  cellSpacing: IsDefined<HeatmapArgs<DatumType>["cellSpacing"]>;
  colors: IsDefined<HeatmapArgs<DatumType>["colors"]>;
  direction: IsDefined<HeatmapArgs<DatumType>["direction"]>;
  getValue: HeatmapArgs<DatumType>["getValue"];
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
    getValue,
  }: HeatmapArgs<DatumType>) {
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
    this.getValue = getValue;
  }

  destroy() {
    this.svg?.remove();
  }

  renderGrid(svg: D3SvgSelection, width: number, height: number) {
    const { data, rows, colors, direction, cellSpacing, getValue } = this;
    const cols = data.length / rows;
    const cellHeight = height / rows;
    const cellWidth = width / cols;

    const values = data.map((d) => getValue(d));

    const colorScale = scaleLinear<string>()
      .domain([min(values) as number, max(values) as number])
      .range([colors.start, colors.end]);

    let cellX, cellY;
    switch (direction) {
      case "column":
        cellX = (_: DatumType, index: number) =>
          cellWidth * Math.floor(index / rows);
        cellY = (_: DatumType, index: number) =>
          cellHeight * Math.floor(index % rows);
        break;
      default:
        cellX = (_: DatumType, index: number) =>
          cellWidth * Math.floor(index % cols);
        cellY = (_: DatumType, index: number) =>
          cellHeight * Math.floor(index / cols);
    }

    const gridGroup = svg.append("g").selectAll("rect").data(data);

    const gridGroupEnterSelection = gridGroup
      .enter()
      .append("rect")
      .attr("width", cellWidth - cellSpacing)
      .attr("height", cellHeight - cellSpacing)
      .attr("x", cellX)
      .attr("y", cellY);

    gridGroupEnterSelection.attr("fill", (d) => colorScale(getValue(d)));

    return gridGroup;
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
