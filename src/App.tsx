import { useMemo, useState, type ReactNode } from "react";
import { CalendarBand, CalendarGrid, Legend } from "./examples/CalendarGrid";
import {
  type CalendarCell,
  type GridSelection,
  createCalendar,
  formatDate,
  selectedCells,
  validateRange,
} from "./examples/calendar";

const focusClasses = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
const controlClasses = `min-h-[42px] rounded-lg border px-3.5 py-2.5 text-sm ${focusClasses}`;
const inputClasses = `${controlClasses} border-slate-300 bg-white`;
const buttonClasses = `${inputClasses} font-semibold enabled:hover:border-blue-700 enabled:hover:bg-blue-50 disabled:cursor-default disabled:opacity-50`;

function Example({ number, title, description, children, id }: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-5 sm:p-7" aria-labelledby={id}>
      <div className="mb-6 flex gap-2.5 sm:gap-4">
        <span className="grid h-[34px] shrink-0 basis-[34px] place-items-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">{number}</span>
        <div>
          <h2 id={id} className="mb-2 text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">{title}</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function BasicExample({ cells }: { cells: CalendarCell[] }) {
  const [clicked, setClicked] = useState<CalendarCell | null>(null);
  return (
    <Example number="01" id="basic-title" title="Explore daily activity"
      description="Hover over a day for details. Click a cell, or focus it and press Enter, to inspect it.">
      <CalendarGrid cells={cells} onClick={setClicked} />
      <Legend />
      <div className="readout flex min-h-[38px] gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500" aria-live="polite">
        {clicked?.date ? (
          <><strong className="font-semibold text-slate-700">{formatDate(clicked.date)}</strong><span>{clicked.value} activities</span></>
        ) : "Select a day to see its activity here."}
      </div>
    </Example>
  );
}

function SelectionExample({ cells }: { cells: CalendarCell[] }) {
  const [selection, setSelection] = useState<GridSelection>(null);
  const [reset, setReset] = useState(0);
  const selected = useMemo(() => selectedCells(cells, selection), [cells, selection]);
  const total = selected.reduce((sum, cell) => sum + cell.value, 0);
  return (
    <Example number="02" id="selection-title" title="Select a range with RangeBand"
      description="Drag a rectangle across the grid to select days. Move the rectangle or drag its edges and corners to adjust it. Every cell touched is included.">
      <CalendarGrid cells={cells} selection={selection}>
        <CalendarBand key={reset} weekCount={cells.length / 7} onSelection={setSelection} />
      </CalendarGrid>
      <Legend />
      <div className="selection-summary flex flex-col items-start justify-between gap-5 border-t border-slate-100 py-4 text-sm sm:flex-row sm:items-center">
        <div aria-live="polite">
          <strong className="font-semibold">
            {selected.length
              ? `${selected.length} ${selected.length === 1 ? "day" : "days"} selected`
              : "No days selected"}
          </strong>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {selected.length ? `${total} activities` : "Drag over the calendar to inspect selected days."}
          </p>
        </div>
        <button className={buttonClasses} type="button" disabled={!selection}
          onClick={() => { setSelection(null); setReset(value => value + 1); }}>
          Clear selection
        </button>
      </div>
      <div className="max-h-[300px] overflow-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="px-4 py-3 text-left font-semibold">Selected daily activity</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky top-0 border-t border-slate-100 bg-slate-50 px-4 py-2.5 font-medium text-slate-500">Date</th>
              <th scope="col" className="sticky top-0 border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-right font-medium text-slate-500">Activity</th>
            </tr>
          </thead>
          <tbody>
            {selected.length ? selected.map(cell => (
              <tr key={cell.date}>
                <td className="border-t border-slate-100 px-4 py-2.5">{formatDate(cell.date!)}</td>
                <td className="border-t border-slate-100 px-4 py-2.5 text-right">{cell.value}</td>
              </tr>
            )) : (
              <tr><td colSpan={2} className="border-t border-slate-100 px-4 py-7 text-center text-slate-500">Selected dates will appear here.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Example>
  );
}

export default function App() {
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-12-31");
  const [range, setRange] = useState({ start, end });
  const cells = useMemo(() => createCalendar(range.start, range.end), [range]);
  const error = validateRange(start, end);
  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-4 pt-8 sm:px-8 sm:pb-8 sm:pt-16">
      <header>
        <p className="text-xs font-bold tracking-widest text-slate-500">ALLEGRIA / DATAVIZ EXAMPLES</p>
        <h1 className="my-4 text-[clamp(30px,5vw,46px)] font-bold leading-tight tracking-tight text-slate-900">A year, one day at a time.</h1>
        <p className="mb-7 max-w-2xl leading-relaxed text-slate-500">Explore a density grid and try selecting its data with RangeBand. Choose a date range to update both examples.</p>
      </header>
      <form className="mb-8 flex flex-wrap items-end gap-4" noValidate
        onSubmit={event => { event.preventDefault(); if (!error) setRange({ start, end }); }}>
        <label className="flex flex-col gap-2 text-xs font-semibold">
          Start date
          <input className={inputClasses} type="date" value={start} onChange={event => setStart(event.target.value)} aria-describedby={error ? "date-error" : undefined} />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold">
          End date
          <input className={inputClasses} type="date" value={end} onChange={event => setEnd(event.target.value)} aria-describedby={error ? "date-error" : undefined} />
        </label>
        <button className={`primary-button ${controlClasses} border-blue-700 bg-blue-700 font-semibold text-white enabled:hover:bg-blue-800 disabled:cursor-default disabled:opacity-50`} type="submit" disabled={!!error}>
          Apply date range
        </button>
        {error && <p className="basis-full text-sm text-red-700" id="date-error" role="alert">{error}</p>}
      </form>
      <div key={`${range.start}/${range.end}`}><BasicExample cells={cells} /><SelectionExample cells={cells} /></div>
      <footer className="py-3 text-center text-xs leading-relaxed text-slate-500">Built with DensityGrid and RangeBand · Each cell represents one day, with weeks starting on Monday.</footer>
    </main>
  );
}
