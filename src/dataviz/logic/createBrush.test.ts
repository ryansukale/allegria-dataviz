import { brushSelection } from "d3-brush";
import { select } from "d3-selection";
import { describe, expect, it, vi } from "vitest";
import createBrush from "./createBrush";

describe("createBrush", () => {
  it.each([undefined, "horizontal", "rectangular"] as const)("supports mode %s with an explicit extent", selectionMode => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const container = select(svg).append("g");
    const onBrush = vi.fn();
    const brush = createBrush({
      container, selectionMode, size: { startX: 10, startY: 20, width: 240, height: 140 }, onBrush,
    });
    const selection = selectionMode === "rectangular" ? [[20, 30], [60, 80]] as [[number, number], [number, number]] : [20, 60] as [number, number];
    container.call(brush.move, selection);
    expect(brushSelection(container.node()!)).toEqual(selection);
    expect(onBrush).toHaveBeenLastCalledWith(expect.objectContaining({ selection }), undefined);
    expect(container.select(".overlay").attr("x")).toBe("10");
    expect(container.select(".overlay").attr("y")).toBe("20");
    container.call(brush.move, null);
    expect(onBrush).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }), undefined);
  });
});
