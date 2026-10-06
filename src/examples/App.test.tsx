import { StrictMode, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

let root: Root;
let host: HTMLDivElement;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  for (const dimension of ["width", "height"]) {
    Object.defineProperty(SVGSVGElement.prototype, dimension, {
      configurable: true,
      get() { return { baseVal: { value: Number(this.getAttribute(dimension)) } }; },
    });
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<StrictMode><App /></StrictMode>));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

function mouse(target: EventTarget, type: string, x: number, y = 10) {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, buttons: type === "mouseup" ? 0 : 1 });
  // Vitest's global Window proxy is rejected by jsdom's UIEvent constructor.
  // D3 needs this view to attach its drag listeners to the test window.
  Object.defineProperty(event, "view", { value: window });
  act(() => target.dispatchEvent(event));
}

function changeDate(index: number, value: string) {
  const input = host.querySelectorAll("input")[index];
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("interactive calendar examples", () => {
  it("renders exactly two grids and one band in StrictMode and cleans them up", () => {
    expect(host.querySelectorAll("svg")).toHaveLength(3);
    expect(host.querySelectorAll(".grid-stack > div:not(.range-overlay) rect[data-date]")).toHaveLength(730);
    act(() => root.render(<></>));
    expect(host.querySelectorAll("svg")).toHaveLength(0);
  });

  it("supports click and keyboard inspection in the first grid", () => {
    const cells = host.querySelectorAll(".grid-stack rect[role=button]");
    mouse(cells[0], "click", 5);
    expect(host.querySelector(".readout")!.textContent).toContain("Jan 1, 2026");
    act(() => cells[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    expect(host.querySelector(".readout")!.textContent).toContain("Jan 2, 2026");
  });

  it("updates the highlight and table during brushing, then clears the band", async () => {
    const overlay = host.querySelector(".range-overlay .overlay")!;
    mouse(overlay, "mousedown", 5);
    mouse(window, "mousemove", 41);
    expect(host.querySelector(".selection-summary")!.textContent).toContain("18 days selected");
    expect(host.querySelectorAll("tbody tr")).toHaveLength(18);
    expect(host.querySelector("tbody tr")!.textContent).toContain("Jan 1, 2026");
    const secondGrid = host.querySelectorAll(".grid-stack")[1];
    expect(secondGrid.querySelector('rect[data-date="2026-01-19"]')!.getAttribute("opacity")).toBe("0.2");
    mouse(window, "mouseup", 41);
    // D3 suppresses the click immediately following a completed drag.
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });
    const clear = host.querySelector(".selection-summary button")!;
    act(() => clear.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(host.querySelector(".selection-summary")!.textContent).toContain("No weeks selected");
    expect(host.querySelector(".range-overlay .selection")!.getAttribute("style")).toContain("display: none");
    expect(secondGrid.querySelector('rect[data-date="2026-01-19"]')!.getAttribute("opacity")).toBe("1");
    expect(host.querySelectorAll("svg")).toHaveLength(3);
  });

  it("retains valid charts on invalid input and resets selection when applying new dates", () => {
    const overlay = host.querySelector(".range-overlay .overlay")!;
    mouse(overlay, "mousedown", 1);
    mouse(window, "mousemove", 20);
    mouse(window, "mouseup", 20);
    changeDate(0, "2027-01-01");
    expect(host.querySelector("[role=alert]")!.textContent).toContain("End date");
    expect(host.querySelector(".primary-button")!.hasAttribute("disabled")).toBe(true);
    expect(host.querySelectorAll(".grid-stack rect[data-date]")).toHaveLength(730);
    changeDate(0, "2026-01-05");
    changeDate(1, "2026-01-05");
    act(() => host.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(host.querySelectorAll(".grid-stack rect[data-date]")).toHaveLength(2);
    expect(host.querySelector(".selection-summary")!.textContent).toContain("No weeks selected");
    expect(host.querySelectorAll("svg")).toHaveLength(3);
  });
});
