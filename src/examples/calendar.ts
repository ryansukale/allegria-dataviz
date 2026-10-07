import { type BrushSelection } from "d3-brush";

export const CELL_SIZE = 20;
export const GRID_HEIGHT = CELL_SIZE * 7;
const DAY = 86_400_000;

export type CalendarCell = { date: string | null; value: number };
export type GridSelection = { columns: [number, number]; rows: [number, number] } | null;

export function parseDate(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
    ? timestamp : null;
}

export function validateRange(start: string, end: string): string | null {
  const first = parseDate(start);
  const last = parseDate(end);
  if (first === null || last === null) return "Choose a valid start and end date.";
  if (last < first) return "End date must be on or after start date.";
  return null;
}

export function createCalendar(start: string, end: string): CalendarCell[] {
  const error = validateRange(start, end);
  if (error) throw new Error(error);
  const first = parseDate(start)!;
  const last = parseDate(end)!;
  const mondayOffset = (new Date(first).getUTCDay() + 6) % 7;
  const count = Math.ceil(((last - first) / DAY + 1 + mondayOffset) / 7) * 7;
  return Array.from({ length: count }, (_, index) => {
    const timestamp = first + (index - mondayOffset) * DAY;
    if (timestamp < first || timestamp > last) return { date: null, value: 0 };
    const date = new Date(timestamp).toISOString().slice(0, 10);
    const hash = [...date].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
    return { date, value: hash % 21 };
  });
}

export function cellsFromPixels(selection: BrushSelection | null, weekCount: number): GridSelection {
  if (!selection || weekCount <= 0 || !Array.isArray(selection[0]) || !Array.isArray(selection[1])) return null;
  const [[x0, y0], [x1, y1]] = selection;
  if (![x0, y0, x1, y1].every(Number.isFinite)) return null;
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);
  if (right <= left || bottom <= top) return null;
  const columns: [number, number] = [Math.max(0, Math.floor(left / CELL_SIZE)), Math.min(weekCount - 1, Math.ceil(right / CELL_SIZE) - 1)];
  const rows: [number, number] = [Math.max(0, Math.floor(top / CELL_SIZE)), Math.min(6, Math.ceil(bottom / CELL_SIZE) - 1)];
  return columns[0] <= columns[1] && rows[0] <= rows[1] ? { columns, rows } : null;
}

export function isCellSelected(index: number, selection: GridSelection): boolean {
  if (!selection) return false;
  const column = Math.floor(index / 7);
  const row = index % 7;
  return column >= selection.columns[0] && column <= selection.columns[1]
    && row >= selection.rows[0] && row <= selection.rows[1];
}

export function selectedCells(cells: CalendarCell[], selection: GridSelection): CalendarCell[] {
  return cells.filter((cell, index) => cell.date !== null && isCellSelected(index, selection));
}

export const COLORS = ["#e5e9ef", "#c5dbfd", "#87b4f5", "#4e88df", "#2359aa"];
export function cellColor(value: number): string {
  return COLORS[value === 0 ? 0 : Math.min(4, Math.ceil(value / 5))];
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

export function monthLabels(cells: CalendarCell[]) {
  const labels: { text: string; column: number }[] = [];
  let previous = "";
  cells.forEach((cell, index) => {
    if (!cell.date || cell.date.slice(0, 7) === previous) return;
    previous = cell.date.slice(0, 7);
    const text = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${cell.date}T00:00:00Z`));
    const column = Math.floor(index / 7);
    const previousLabel = labels[labels.length - 1];
    if (previousLabel?.column === column) previousLabel.text += ` / ${text}`;
    else labels.push({ text, column });
  });
  return labels;
}
