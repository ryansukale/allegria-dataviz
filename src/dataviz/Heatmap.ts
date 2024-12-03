import { select, pointer } from "d3-selection";
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
  // TODO: Add callback to indicate current element is being hovered on

  // Optional
  cellSpacing?: number;
  direction?: "row" | "column";
  getCellAttributes?: () => AttributeMap;
};

const DEFAULT_CELL_SPACING = 2;

function enableTooltips<DatumType>(items, tooltip, getTipContent) {
  items
    .on("mouseover", function (event: PointerEvent, d: DatumType) {
      // console.log(event, d);
      const [x, y] = pointer(event);
      tooltip
        .style("opacity", 1)
        .html(() => getTipContent(d))
        .style("left", `${x - 25}px`)
        .style("top", `${y + 15}px`);
      // .style("left", event.pageX - 25 + "px")
      // .style("top", event.pageY - 75 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });
}

export default class Heatmap<DatumType> {
  private node: HTMLElement;
  private args: HeatmapArgs<DatumType>;
  private svg?: D3Selection["SVG"];
  private tooltip?: D3Selection["DIV"];

  constructor(args: HeatmapArgs<DatumType>) {
    this.node =
      typeof args.node === "string"
        ? (document.querySelector(args.node) as HTMLElement)
        : args.node;

    this.args = Object.freeze(args);
  }

  destroy() {
    [this.svg, this.tooltip].forEach((el) => el?.remove());
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
    const { cellSpacing, data, getCellAttributes, getValue } = this.args;

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

    this.tooltip = select("body")
      .append("div")
      .attr("class", "heatmap-tooltip")
      .style("position", "absolute")
      .style("opacity", 0);

    enableTooltips(gridGroupRects, this.tooltip, function (d: DatumType) {
      return "The exact value of<br>this cell is: " + getValue(d);
    });

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
