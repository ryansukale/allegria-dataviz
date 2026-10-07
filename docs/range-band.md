# RangeBand

`RangeBand` creates an SVG container with a D3 brush. `selectionMode` defaults to `"horizontal"`; choose `"rectangular"` to select freely in both dimensions.

```ts
import { RangeBand } from "@allegria/dataviz";

const range = new RangeBand({
  node: "#chart",
  width: 480,
  height: 48,
  onBrush: (event) => {
    console.log("selected pixels", event.selection);
  },
  onEnd: (event) => {
    console.log("selection ended", event.selection);
  },
});

range.render();
// range.destroy();
```

The optional `onStart`, `onBrush`, and `onEnd` callbacks receive the D3 brush event. The selection is expressed in the component's SVG coordinate system.

## Selection modes

| `selectionMode` | Selection coordinates | Behavior |
| --- | --- | --- |
| `"horizontal"` (default) | `[x0, x1]` | Select across the full SVG height. |
| `"rectangular"` | `[[x0, y0], [x1, y1]]` | Select a rectangle with independent horizontal and vertical bounds. |

Both modes report `null` when cleared and support moving and resizing the selection. Rectangular mode adds corner handles. The rectangle follows pointer coordinates without snapping; clicks and zero-area drags clear it.

```ts
const rectangle = new RangeBand({
  node: "#grid-overlay",
  width: 480,
  height: 140,
  selectionMode: "rectangular",
  onBrush: event => console.log("rectangle pixels", event.selection),
});
rectangle.render();
```

RangeBand works independently of DensityGrid and calendar data. Callers map the SVG pixel coordinates to their own data. The calendar example selects every grid slot overlapped by the rectangle (including cell spacing), excludes invisible padding, and keeps its highlighted cells, summary, and table consistent. Those dates may have gaps between week columns.
