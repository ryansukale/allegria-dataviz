import { describe, expect, it } from "vitest";
import { createCalendar, monthLabels, selectedCells, validateRange, cellsFromPixels, isCellSelected } from "./calendar";

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

describe("rectangular cell selection", () => {
  it("includes partial slots and excludes adjacent cells at exact boundaries", () => {
    expect(cellsFromPixels([[20, 20], [40, 80]], 3)).toEqual({ columns: [1, 1], rows: [1, 3] });
    expect(cellsFromPixels([[19, 19], [41, 81]], 3)).toEqual({ columns: [0, 2], rows: [0, 4] });
    expect(cellsFromPixels([[18, 18], [19, 19]], 3)).toEqual({ columns: [0, 0], rows: [0, 0] });
  });

  it("normalizes reverse drags and clamps both dimensions to the grid", () => {
    expect(cellsFromPixels([[60, 80], [0, 20]], 3)).toEqual({ columns: [0, 2], rows: [1, 3] });
    expect(cellsFromPixels([[-10, -10], [100, 200]], 3)).toEqual({ columns: [0, 2], rows: [0, 6] });
  });

  it("rejects empty, horizontal, nonfinite, and wholly outside selections", () => {
    expect(cellsFromPixels(null, 3)).toBeNull();
    expect(cellsFromPixels([0, 20], 3)).toBeNull();
    expect(cellsFromPixels([[20, 20], [20, 80]], 3)).toBeNull();
    expect(cellsFromPixels([[20, 20], [60, 20]], 3)).toBeNull();
    expect(cellsFromPixels([[NaN, 0], [20, 20]], 3)).toBeNull();
    expect(cellsFromPixels([[0, 0], [Infinity, 20]], 3)).toBeNull();
    expect(cellsFromPixels([[60, 20], [80, 80]], 3)).toBeNull();
    expect(cellsFromPixels([[0, 140], [20, 160]], 3)).toBeNull();
    expect(cellsFromPixels([[-20, 0], [0, 20]], 3)).toBeNull();
    expect(cellsFromPixels([[0, -20], [20, 0]], 3)).toBeNull();
    expect(cellsFromPixels([[0, 0], [20, 20]], 0)).toBeNull();
  });

  it("selects Tuesday through Thursday across three weeks as nine days", () => {
    const cells = createCalendar("2026-01-05", "2026-01-25");
    const bounds = cellsFromPixels([[0, 20], [60, 80]], 3);
    const selected = selectedCells(cells, bounds);
    expect(selected.map(cell => cell.date)).toEqual([
      "2026-01-06", "2026-01-07", "2026-01-08",
      "2026-01-13", "2026-01-14", "2026-01-15",
      "2026-01-20", "2026-01-21", "2026-01-22",
    ]);
    expect(cells.filter((_cell, index) => isCellSelected(index, bounds))).toEqual(selected);
  });

  it("excludes padding while preserving zero-activity days and chronological order", () => {
    const cells = createCalendar("2026-01-01", "2026-01-08");
    cells[3].value = 0;
    const selected = selectedCells(cells, cellsFromPixels([[0, 0], [40, 140]], 2));
    expect(selected).toHaveLength(8);
    expect(selected[0]).toEqual({ date: "2026-01-01", value: 0 });
    expect(selected[7].date).toBe("2026-01-08");
    expect(selectedCells(cells, cellsFromPixels([[0, 0], [20, 60]], 2))).toEqual([]);
    expect(selectedCells(cells, null)).toEqual([]);
  });

  it("selects a single real day without including padding", () => {
    const cells = createCalendar("2026-01-04", "2026-01-04");
    expect(selectedCells(cells, cellsFromPixels([[2, 122], [18, 138]], 1)))
      .toEqual([{ date: "2026-01-04", value: cells[6].value }]);
  });
});
