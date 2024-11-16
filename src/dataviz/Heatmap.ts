import { select, type Selection } from "d3-selection";
import setAttrs, { type AttributeMap } from "./logic/setAttrs";

type D3SvgSelection = Selection<SVGSVGElement, unknown, null, undefined>;

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
  direction?: "row" | "column";
  getCellAttributes?: () => AttributeMap;
};

type IsDefined<T> = Exclude<T, undefined>;

export default class Heatmap<DatumType> {
  node: HTMLElement;
  data: HeatmapArgs<DatumType>["data"];
  rows: HeatmapArgs<DatumType>["rows"];
  width: HeatmapArgs<DatumType>["width"];
  height: HeatmapArgs<DatumType>["height"];
  cellSpacing: IsDefined<HeatmapArgs<DatumType>["cellSpacing"]>;
  direction: IsDefined<HeatmapArgs<DatumType>["direction"]>;
  getValue: HeatmapArgs<DatumType>["getValue"];
  svg?: D3SvgSelection;
  getCellAttributes: () => AttributeMap;

  constructor({
    node,
    data,
    rows,
    width,
    height,
    cellSpacing = 2,
    direction = "row",
    getValue,
    getCellAttributes = () => ({}),
  }: HeatmapArgs<DatumType>) {
    this.node =
      typeof node === "string"
        ? (document.querySelector(node) as HTMLElement)
        : node;
    this.data = data;
    this.rows = rows;
    this.width = width;
    this.height = height;
    this.cellSpacing = cellSpacing;
    this.direction = direction;
    this.getValue = getValue;
    this.getCellAttributes = getCellAttributes;
  }

  destroy() {
    this.svg?.remove();
  }

  renderGrid(svg: D3SvgSelection, width: number, height: number) {
    const { data, rows, direction, cellSpacing } = this;
    const cols = data.length / rows;
    const cellHeight = height / rows;
    const cellWidth = width / cols;

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

    const gridGroupEnterSelection = gridGroup.enter().append("rect");

    setAttrs(
      {
        ...this.getCellAttributes(),
        width: cellWidth - cellSpacing,
        height: cellHeight - cellSpacing,
        x: cellX,
        y: cellY,
      },
      gridGroupEnterSelection
    );

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
