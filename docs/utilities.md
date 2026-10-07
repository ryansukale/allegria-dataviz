# Utilities

## `createBrush`

`createBrush` applies a D3 brush to an existing SVG group. It accepts optional `size`, `selectionMode`, `onStart`, `onBrush`, and `onEnd` options and returns the configured brush instance.

`selectionMode` defaults to `"horizontal"`, reporting `[x0, x1]`. Set it to `"rectangular"` to report `[[x0, y0], [x1, y1]]`. Both modes report `null` when cleared. `size` sets the pixel extent using `{ startX, startY, width, height }`; otherwise D3 derives the extent from the SVG. The `BrushSelectionMode` type is available from the package root.

## Scale helpers

`getLinearScale(values, range)` creates a linear scale whose domain is the minimum and maximum input value. `getOrdinalScale(values, range)` creates an ordinal scale from the provided domain and range.

```ts
import { getLinearScale, getOrdinalScale } from "@allegria/dataviz";

const color = getLinearScale([0, 10], ["white", "black"]);
const category = getOrdinalScale(["a", "b"], ["red", "blue"]);
```
