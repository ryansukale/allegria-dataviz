import { describe, expect, it } from "vitest";
import { createCalendar, monthLabels, selectedCells, validateRange, weeksFromPixels } from "./calendar";

describe("calendar dates", () => {
  it("aligns Monday-first weeks and hides padding outside the requested range", () => {
    const cells = createCalendar("2026-01-01", "2026-01-11");
    expect(cells).toHaveLength(14);
    expect(cells.slice(0, 3).every(cell => cell.date === null)).toBe(true);
    expect(cells[3].date).toBe("2026-01-01");
    expect(cells[7].date).toBe("2026-01-05");
    expect(cells[13].date).toBe("2026-01-11");
  });

  it("supports a single date and pads the rest of its week", () => {
    const cells = createCalendar("2026-01-04", "2026-01-04");
    expect(cells).toHaveLength(7);
    expect(cells[6].date).toBe("2026-01-04");
    expect(cells.filter(cell => cell.date)).toHaveLength(1);
  });

  it("combines month labels when a short range crosses months within one week", () => {
    expect(monthLabels(createCalendar("2024-02-28", "2024-03-01"))).toEqual([{ text: "Feb / Mar", column: 0 }]);
  });

  it.each([
    ["2024-02-28", "2024-03-01", ["2024-02-28", "2024-02-29", "2024-03-01"]],
    ["2025-12-31", "2026-01-02", ["2025-12-31", "2026-01-01", "2026-01-02"]],
    ["2026-03-07", "2026-03-09", ["2026-03-07", "2026-03-08", "2026-03-09"]],
    ["2026-10-31", "2026-11-02", ["2026-10-31", "2026-11-01", "2026-11-02"]],
  ])("keeps consecutive calendar dates across boundaries: %s", (start, end, dates) => {
    expect(createCalendar(start, end).filter(cell => cell.date).map(cell => cell.date)).toEqual(dates);
  });

  it("uses repeatable activity values independent of the requested range", () => {
    const year = createCalendar("2026-01-01", "2026-12-31");
    const day = createCalendar("2026-02-03", "2026-02-03").find(cell => cell.date);
    expect(year.find(cell => cell.date === "2026-02-03")).toEqual(day);
    expect(year.filter(cell => cell.date)).toHaveLength(365);
    expect(year.every(cell => cell.value >= 0 && cell.value <= 20)).toBe(true);
  });

  it("rejects missing, impossible, and reversed dates", () => {
    expect(validateRange("", "2026-01-01")).toBeTruthy();
    expect(validateRange("2026-02-29", "2026-03-01")).toBeTruthy();
    expect(validateRange("2026-04-01", "2026-03-01")).toBeTruthy();
    expect(() => createCalendar("bad", "2026-01-01")).toThrow();
    expect(validateRange("2024-02-29", "2024-02-29")).toBeNull();
  });
});

describe("week selection", () => {
  it("includes touched columns but excludes adjacent columns at exact boundaries", () => {
    expect(weeksFromPixels([0, 20], 3)).toEqual([0, 0]);
    expect(weeksFromPixels([20, 40], 3)).toEqual([1, 1]);
    expect(weeksFromPixels([19, 41], 3)).toEqual([0, 2]);
    expect(weeksFromPixels([-10, 100], 3)).toEqual([0, 2]);
  });

  it("clears empty selections and rejects ranges outside the grid", () => {
    expect(weeksFromPixels(null, 3)).toBeNull();
    expect(weeksFromPixels([20, 20], 3)).toBeNull();
    expect(weeksFromPixels([60, 80], 3)).toBeNull();
    expect(weeksFromPixels([0, 20], 0)).toBeNull();
  });

  it("excludes padding while preserving zero-activity days and chronological order", () => {
    const cells = createCalendar("2026-01-01", "2026-01-08");
    cells[3].value = 0;
    const selection = selectedCells(cells, [0, 1]);
    expect(selection).toHaveLength(8);
    expect(selection[0]).toEqual({ date: "2026-01-01", value: 0 });
    expect(selection[7].date).toBe("2026-01-08");
    expect(selectedCells(cells, null)).toEqual([]);
  });
});
