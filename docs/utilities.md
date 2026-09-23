# Utilities

## `createBrush`

`createBrush` applies a horizontal D3 brush to an existing SVG group. It accepts optional `size`, `onStart`, `onBrush`, and `onEnd` options and returns the configured brush instance.

## Scale helpers

`getLinearScale(values, range)` creates a linear scale whose domain is the minimum and maximum input value. `getOrdinalScale(values, range)` creates an ordinal scale from the provided domain and range.

```ts
import { getLinearScale, getOrdinalScale } from "@allegria/dataviz";

const color = getLinearScale([0, 10], ["white", "black"]);
const category = getOrdinalScale(["a", "b"], ["red", "blue"]);
```
