import { describe, expect, it, vi } from "vitest";
import RangeBand from "./RangeBand";

describe("RangeBand", () => {
  it("renders and destroys its brush container", () => {
    Object.defineProperty(SVGSVGElement.prototype, "width", {
      configurable: true,
      value: { baseVal: { value: 240 } },
    });
    Object.defineProperty(SVGSVGElement.prototype, "height", {
      configurable: true,
      value: { baseVal: { value: 40 } },
    });
    const node = document.createElement("div");
    document.body.append(node);
    const onBrush = vi.fn();
    const range = new RangeBand({
      node,
      width: 240,
      height: 40,
      onBrush,
    });

    range.render();
    expect(node.querySelector("svg")).not.toBeNull();
    expect(range.onBrush).toBe(onBrush);

    range.destroy();
    expect(node.querySelector("svg")).toBeNull();
  });
});
