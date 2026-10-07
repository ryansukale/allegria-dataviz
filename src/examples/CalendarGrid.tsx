import { useEffect, useRef } from "react";
import DensityGrid from "../dataviz/DensityGrid";
import RangeBand from "../dataviz/RangeBand";
import { type CalendarCell, type GridSelection, CELL_SIZE, GRID_HEIGHT, cellColor, formatDate, monthLabels, cellsFromPixels, isCellSelected } from "./calendar";

type GridProps = {
  cells: CalendarCell[];
  onClick?: (cell: CalendarCell) => void;
  selection?: GridSelection;
  children?: React.ReactNode;
};

export function CalendarGrid({ cells, onClick, selection = null, children }: GridProps) {
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
      const selected = !selection || isCellSelected(index, selection);
      rect.setAttribute("opacity", cells[index].date ? selected ? "1" : "0.2" : "0");
    });
  }, [cells, selection, onClick]);

  return <div className="chart-scroll overflow-x-auto pb-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" tabIndex={0} aria-label="Calendar heatmap, scroll horizontally if needed">
    <div style={{ width: Math.max(width + 44, 110) }}>
      <div className="relative ml-11 h-7 text-[11px] text-slate-500" style={{ width }} aria-hidden="true">
        {monthLabels(cells).map((label, index) => <span className="absolute top-0" key={index} style={{ left: label.column * CELL_SIZE }}>{label.text}</span>)}
      </div>
      <div className="flex">
        <div className="flex w-11 shrink-0 flex-col text-[10px] text-slate-500" aria-hidden="true">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span className="flex h-5 items-center" key={day}>{day}</span>)}</div>
        <div className="grid-stack relative shrink-0" style={{ width, height: GRID_HEIGHT }}>
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

export function CalendarBand({ weekCount, onSelection }: { weekCount: number; onSelection: (selection: GridSelection) => void }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const band = new RangeBand({
      node: host.current, width: weekCount * CELL_SIZE, height: GRID_HEIGHT,
      selectionMode: "rectangular",
      onBrush: event => onSelection(cellsFromPixels(event.selection, weekCount)),
      onEnd: event => onSelection(cellsFromPixels(event.selection, weekCount)),
    });
    band.render();
    return () => band.destroy();
  }, [weekCount, onSelection]);
  return <div className="range-overlay absolute inset-0" ref={host} />;
}

export function Legend() {
  return <div className="mb-5 mt-3 flex flex-wrap items-center gap-1 text-[10px] text-slate-500 sm:ml-11"><span>Less activity</span>{[0, 1, 6, 11, 16].map(value => <span key={value} className="h-[13px] w-[13px] rounded-[3px]" style={{ background: cellColor(value) }} title={value === 0 ? "0 activities" : `${value}–${value + 4} activities`} />)}<span>More activity</span><span className="mt-1.5 basis-full sm:ml-auto sm:mt-0 sm:basis-auto">0–20 per day · generated demo data</span></div>;
}
