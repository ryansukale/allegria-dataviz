# Allegria Dataviz

Small, composable data-visualization building blocks for browser applications. The package currently provides SVG density grids, interactive range bands, tooltips, brushes, and D3 scale helpers.

## Install

```sh
pnpm add @allegria/dataviz d3-selection d3-scale d3-array d3-brush
```

The library requires a browser DOM and works with TypeScript or JavaScript projects.

## Quick start

```ts
import { DensityGrid } from "@allegria/dataviz";

const grid = new DensityGrid({
  node: "#chart",
  data: [1, 2, 3, 4],
  rows: 2,
  width: 240,
  height: 120,
  getCellAttributes: (value) => ({ fill: value > 2 ? "steelblue" : "lightgray" }),
});

grid.render();
```

For individual modules, use subpath imports such as `@allegria/dataviz/DensityGrid` or `@allegria/dataviz/RangeBand`.

## Components

- [`DensityGrid`](docs/density-grid.md) renders a rectangular data grid as SVG cells.
- [`RangeBand`](docs/range-band.md) adds an interactive horizontal brush to an SVG container.
- [`Tooltip`](docs/tooltip.md) provides the tooltip behavior used by `DensityGrid`.
- [`Utilities`](docs/utilities.md) covers brushes and scale helpers.

## Development

```sh
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm test
```

## Releases

Release preparation and branch expectations are documented in [`docs/releases.md`](docs/releases.md). Alpha releases come from `develop`; stable releases come from `main` and publish to the npm `latest` dist-tag.

## License

MIT
