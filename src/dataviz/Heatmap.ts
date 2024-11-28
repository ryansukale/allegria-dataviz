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
  onClickCell: (e: PointerEvent, d: DatumType) => void;

  // Optional
  cellSpacing?: number;
  direction?: "row" | "column";
  getCellAttributes?: () => AttributeMap;
};

const DEFAULT_CELL_SPACING = 2;

export default class Heatmap<DatumType> {
  private node: HTMLElement;
  private args: HeatmapArgs<DatumType>;
  private svg?: D3Selection["SVG"];

  constructor(args: HeatmapArgs<DatumType>) {
    this.node =
      typeof args.node === "string"
        ? (document.querySelector(args.node) as HTMLElement)
        : args.node;

    this.args = Object.freeze(args);
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
    const { cellSpacing, data, getCellAttributes } = this.args;

    const gridGroup = container.selectAll("rect").data(data);
    const gridGroupRects = gridGroup.join("rect");

    setAttrs(
      {
        ...getCellAttributes?.(),
        width: cellWidth - (cellSpacing ?? DEFAULT_CELL_SPACING),
        height: cellHeight - (cellSpacing ?? DEFAULT_CELL_SPACING),
        x: cellX,
        y: cellY,
      },
      gridGroupRects
    );

    return gridGroup;
  }

  renderGrid(svg: D3Selection["SVG"], width: number, height: number) {
    const { data, rows, direction, onClickCell } = this.args;
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

    if (onClickCell) {
      cellsGroup.on("click", (event: PointerEvent) => {
        // @ts-expect-error Selecting an existing node
        onClickCell(event, select(event.target).datum());
      });
    }

    return cellsGroup;
  }

  render() {
    const { width, height } = this.args;

    this.svg = select(this.node)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height);

    this.renderGrid(this.svg, width, height);
  }
}
