# DensityGrid

`DensityGrid` renders a flat array of values into an SVG grid. It accepts either an `HTMLElement` or a CSS selector as its mount node.

```ts
import { DensityGrid } from "@allegria/dataviz";

const chart = new DensityGrid({
  node: document.querySelector("#chart")!,
  data: [{ value: 0.2 }, { value: 0.8 }],
  rows: 1,
  width: 320,
  height: 80,
  getCellAttributes: (datum) => ({
    fill: datum.value > 0.5 ? "tomato" : "steelblue",
  }),
  onClickCell: (_event, datum) => console.log(datum),
  getCellTooltip: (datum) => `<strong>${datum.value}</strong>`,
});

chart.render();
// chart.destroy();
```

Required options are `node`, `data`, `rows`, `width`, and `height`. `direction` defaults to `"row"`; set it to `"column"` to fill cells down each column first. `cellSpacing` controls the gap between cells.

`getCellAttributes` returns SVG attributes for every cell. `onClickCell` receives the pointer event and datum. `getCellTooltip` returns HTML markup; return an empty string to suppress a tooltip for a datum.
