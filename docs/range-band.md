# RangeBand

`RangeBand` creates an SVG container with a horizontal D3 brush.

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
