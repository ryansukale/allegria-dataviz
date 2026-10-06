import { useEffect, useRef } from "react";
import DensityGrid from "../dataviz/DensityGrid";
import RangeBand from "../dataviz/RangeBand";
import { type CalendarCell, type WeekSelection, CELL_SIZE, GRID_HEIGHT, cellColor, formatDate, monthLabels, weeksFromPixels } from "./calendar";

type GridProps = {
  cells: CalendarCell[];
  onClick?: (cell: CalendarCell) => void;
  weeks?: WeekSelection;
  children?: React.ReactNode;
};

export function CalendarGrid({ cells, onClick, weeks = null, children }: GridProps) {
  const host = useRef<HTMLDivElement>(null);
  const width = cells.length / 7 * CELL_SIZE;

  useEffect(() => {
    if (!host.current) return;
    const grid = new DensityGrid({
      node: host.current, data: cells, rows: 7, direction: "column", width, height: GRID_HEIGHT,
      cellSpacing: 3,
      getCellAttributes: (cell) => ({
        fill: cellColor(cell.value), rx: 3, opacity: cell.date ? 1 : 0,
        "pointer-events": cell.date ? "auto" : "none",
        "data-date": cell.date,
        tabindex: cell.date && onClick ? 0 : null,
        role: cell.date && onClick ? "button" : null,
        "aria-label": cell.date ? `${formatDate(cell.date)}: ${cell.value} activities` : null,
      }),
      getCellTooltip: onClick ? cell => cell.date ? `<strong>${formatDate(cell.date)}</strong><br>${cell.value} activities` : "" : undefined,
      onClickCell: onClick ? (_event, cell) => { if (cell?.date) onClick(cell); } : undefined,
    });
    grid.render();
    return () => grid.destroy();
  }, [cells, width, onClick]);

  useEffect(() => {
    host.current?.querySelectorAll("rect").forEach((rect, index) => {
      const column = Math.floor(index / 7);
      const selected = !weeks || (column >= weeks[0] && column <= weeks[1]);
      rect.setAttribute("opacity", cells[index].date ? selected ? "1" : "0.2" : "0");
    });
  }, [cells, weeks, onClick]);

  return <div className="chart-scroll" tabIndex={0} aria-label="Calendar heatmap, scroll horizontally if needed">
    <div className="calendar" style={{ width: Math.max(width + 44, 110) }}>
      <div className="month-labels" style={{ width }} aria-hidden="true">
        {monthLabels(cells).map((label, index) => <span key={index} style={{ left: label.column * CELL_SIZE }}>{label.text}</span>)}
      </div>
      <div className="calendar-body">
        <div className="weekday-labels" aria-hidden="true">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day}>{day}</span>)}</div>
        <div className="grid-stack" style={{ width, height: GRID_HEIGHT }}>
          <div ref={host} onKeyDown={event => {
            if (!onClick || !["Enter", " "].includes(event.key)) return;
            const date = (event.target as Element).getAttribute("data-date");
            const cell = cells.find(item => item.date === date && date !== null);
            if (cell) { event.preventDefault(); onClick(cell); }
          }} />
          {children}
        </div>
      </div>
    </div>
  </div>;
}

export function CalendarBand({ weekCount, onSelection }: { weekCount: number; onSelection: (weeks: WeekSelection) => void }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const band = new RangeBand({
      node: host.current, width: weekCount * CELL_SIZE, height: GRID_HEIGHT,
      onBrush: event => onSelection(weeksFromPixels(event.selection as [number, number] | null, weekCount)),
      onEnd: event => onSelection(weeksFromPixels(event.selection as [number, number] | null, weekCount)),
    });
    band.render();
    return () => band.destroy();
  }, [weekCount, onSelection]);
  return <div className="range-overlay" ref={host} />;
}

export function Legend() {
  return <div className="legend"><span>Less activity</span>{[0, 1, 6, 11, 16].map(value => <span key={value} className="legend-cell" style={{ background: cellColor(value) }} title={value === 0 ? "0 activities" : `${value}–${value + 4} activities`} />)}<span>More activity</span><span className="legend-note">0–20 per day · generated demo data</span></div>;
}
