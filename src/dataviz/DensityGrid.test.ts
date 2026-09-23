import { describe, expect, it } from "vitest";
import DensityGrid from "./DensityGrid";

describe("DensityGrid", () => {
  it("renders cells and destroys its SVG", () => {
    const node = document.createElement("div");
    document.body.append(node);
    const grid = new DensityGrid({
      node,
      data: [1, 2, 3, 4],
      rows: 2,
      width: 200,
      height: 100,
    });

    grid.render();
    expect(node.querySelectorAll("rect")).toHaveLength(4);
    expect(node.querySelector("svg")).not.toBeNull();

    grid.destroy();
    expect(node.querySelector("svg")).toBeNull();
  });

  it("keeps each cell datum available to attribute accessors", () => {
    const node = document.createElement("div");
    document.body.append(node);
    const grid = new DensityGrid({
      node,
      data: ["a", "b"],
      rows: 1,
      width: 200,
      height: 100,
    });

    grid.render();
    const cells = node.querySelectorAll("rect");
    expect(cells[0]?.getAttribute("x")).toBe("0");
    expect(cells[1]?.getAttribute("x")).toBe("100");
  });

  it("applies attributes from each datum", () => {
    const node = document.createElement("div");
    document.body.append(node);
    const grid = new DensityGrid({
      node,
      data: ["low", "high"],
      rows: 1,
      width: 200,
      height: 100,
      getCellAttributes: (value) => ({
        fill: value === "high" ? "red" : "blue",
      }),
    });

    grid.render();
    expect(node.querySelectorAll("rect")[0]?.getAttribute("fill")).toBe("blue");
    expect(node.querySelectorAll("rect")[1]?.getAttribute("fill")).toBe("red");
  });
});
