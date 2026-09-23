# Tooltip

`Tooltip` is available as a public class for advanced integrations, and is also configured through `DensityGrid` with `getCellTooltip`.

The tooltip callback returns HTML markup. Because the markup is inserted into the DOM, applications should escape or otherwise trust any user-controlled values before returning them.

Most consumers should prefer the `DensityGrid` option:

```ts
const chart = new DensityGrid({
  node: "#chart",
  data,
  rows: 4,
  width: 400,
  height: 200,
  getCellTooltip: (datum) => `<span>${String(datum)}</span>`,
});
```
