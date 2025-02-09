import { select } from "d3-selection";
import setAttrs, { type AttributeMap } from "./logic/setAttrs";
import Tooltip from "./Tooltip";
import destroy from "./logic/destroy";

type DensityGridArgs<DatumType> = {
  // Required args
  node: HTMLElement | string;
  data: DatumType[];
  rows: number;
  width: number;
  height: number;
  getValue?: (d: DatumType) => number;

  // Optional args
  cellSpacing?: number;
  direction?: "row" | "column";
  onClickCell?: (e: PointerEvent, d: DatumType) => void;
  getCellTooltip?: (d: DatumType) => string;
  getCellAttributes?: () => AttributeMap;
};

const DEFAULT_CELL_SPACING = 2;

export default class DensityGrid<DatumType> {
  private node: HTMLElement;
  private args: DensityGridArgs<DatumType>;
  private svg?: D3Selection["SVG"];
  private tooltip?: D3Selection["DIV"];

  constructor(args: DensityGridArgs<DatumType>) {
    this.node =
      typeof args.node === "string"
        ? (document.querySelector(args.node) as HTMLElement)
        : args.node;

    this.args = Object.freeze(args);
  }

  destroy() {
    destroy([this.svg, this.tooltip]);
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

    const cells = container.selectAll("rect").data(data).join("rect");

    setAttrs(
      {
        ...getCellAttributes?.(),
        width: cellWidth - (cellSpacing ?? DEFAULT_CELL_SPACING),
        height: cellHeight - (cellSpacing ?? DEFAULT_CELL_SPACING),
        x: cellX,
        y: cellY,
      },
      cells
    );

    return cells;
  }

  renderGrid(svg: D3Selection["SVG"], width: number, height: number) {
    const { data, rows, direction } = this.args;
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

    this.setupCellClick(cellsGroup);
    this.setupCellTooltip(cellsGroup);

    return cellsGroup;
  }

  setupCellTooltip(cellsGroup: D3Selection["G"]) {
    const { getCellTooltip } = this.args;
    if (getCellTooltip) {
      const cells = cellsGroup.selectAll("rect");
      this.tooltip = new Tooltip(cells, getCellTooltip);
    }
  }

  setupCellClick(cellsGroup: D3Selection["G"]) {
    const { onClickCell } = this.args;
    if (onClickCell) {
      cellsGroup.on("click", (event: PointerEvent) =>
        // @ts-expect-error Selecting an existing node
        onClickCell(event, select(event.target).datum())
      );
    }
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
