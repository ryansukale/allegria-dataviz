import { select } from "d3-selection";
import setAttrs, { type AttributeMap } from "./logic/setAttrs";

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
  svg?: D3Selection["SVG"];
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

  renderCells({
    container,
    cellWidth,
    cellHeight,
    cellX,
    cellY,
  }: {
    container: D3Selection["G"];
    cellWidth: number;
    cellHeight: number;
    cellX: (d: DatumType, i: number) => number;
    cellY: (d: DatumType, i: number) => number;
  }) {
    const { cellSpacing } = this;

    const gridGroup = container.selectAll("rect").data(this.data);
    const gridGroupRects = gridGroup.join("rect");

    setAttrs(
      {
        ...this.getCellAttributes(),
        width: cellWidth - cellSpacing,
        height: cellHeight - cellSpacing,
        x: cellX,
        y: cellY,
      },
      gridGroupRects
    );

    return gridGroup;
  }

  renderGrid(svg: D3Selection["SVG"], width: number, height: number) {
    const { data, rows, direction } = this;
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

    const cellsGroup = svg.append("g");
    this.renderCells({
      container: cellsGroup,
      cellWidth,
      cellHeight,
      cellX,
      cellY,
    });

    return cellsGroup;
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
