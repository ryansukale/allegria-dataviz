import { afterEach, describe, expect, it, vi } from "vitest";
import RangeBand, { type RangeBandArgs } from "./RangeBand";

function mouse(target: EventTarget, type: string, x: number, y: number) {
  const event = new MouseEvent(type, {
    bubbles: true, clientX: x, clientY: y, buttons: type === "mouseup" ? 0 : 1,
  });
  // jsdom rejects Vitest's Window proxy in the constructor; D3 needs the view.
  Object.defineProperty(event, "view", { value: window });
  target.dispatchEvent(event);
}

function setup(selectionMode?: RangeBandArgs["selectionMode"]) {
  const node = document.createElement("div");
  document.body.append(node);
  const onStart = vi.fn();
  const onBrush = vi.fn();
  const onEnd = vi.fn();
  const range = new RangeBand({ node, width: 240, height: 140, selectionMode, onStart, onBrush, onEnd });
  range.render();
  return { node, range, onStart, onBrush, onEnd };
}

function drag(target: EventTarget, from: [number, number], to: [number, number]) {
  mouse(target, "mousedown", ...from);
  mouse(window, "mousemove", ...to);
  mouse(window, "mouseup", ...to);
}

afterEach(() => document.body.replaceChildren());

describe("RangeBand", () => {
  it.each([undefined, "horizontal"] as const)("preserves horizontal behavior for mode %s", selectionMode => {
    const { node, range, onStart, onBrush, onEnd } = setup(selectionMode);
    const overlay = node.querySelector(".overlay")!;
    expect(overlay.getAttribute("width")).toBe("240");
    expect(overlay.getAttribute("height")).toBe("140");
    expect(node.querySelectorAll(".handle")).toHaveLength(2);
    drag(overlay, [20, 20], [60, 80]);
    expect(onStart).toHaveBeenCalled();
    expect(onBrush).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [20, 60] }), undefined);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [20, 60] }), undefined);
    expect(node.querySelector(".selection")?.getAttribute("height")).toBe("140");
    drag(node.querySelector(".selection")!, [40, 40], [60, 50]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [40, 80] }), undefined);
    drag(node.querySelector(".handle--e")!, [80, 50], [100, 60]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [40, 100] }), undefined);
    drag(overlay, [200, 120], [200, 120]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }), undefined);
    range.destroy();
    expect(node.querySelector("svg")).toBeNull();
  });

  it("reports rectangular pixels while dragging, moving, resizing, and clearing", () => {
    const { node, range, onBrush, onEnd } = setup("rectangular");
    const overlay = node.querySelector(".overlay")!;
    expect(node.querySelectorAll(".handle")).toHaveLength(8);
    drag(overlay, [20, 20], [60, 80]);
    expect(onBrush).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [[20, 20], [60, 80]] }), undefined);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [[20, 20], [60, 80]] }), undefined);
    drag(node.querySelector(".selection")!, [40, 40], [60, 50]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [[40, 30], [80, 90]] }), undefined);
    drag(node.querySelector(".handle--se")!, [80, 90], [120, 110]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [[40, 30], [120, 110]] }), undefined);
    drag(overlay, [200, 120], [200, 120]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }), undefined);
    range.destroy();
    expect(node.querySelector("svg")).toBeNull();
  });

  it("normalizes reverse drags, clamps to bounds, and clears zero-area rectangles", () => {
    const { node, range, onEnd } = setup("rectangular");
    const overlay = node.querySelector(".overlay")!;
    drag(overlay, [80, 90], [20, 30]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [[20, 30], [80, 90]] }), undefined);
    drag(overlay, [20, 20], [300, 200]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: [[20, 20], [240, 140]] }), undefined);
    drag(overlay, [20, 20], [60, 20]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }), undefined);
    drag(overlay, [20, 20], [20, 80]);
    expect(onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ selection: null }), undefined);
    range.destroy();
  });
});
