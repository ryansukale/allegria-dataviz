import { useMemo, useState } from "react";
import { CalendarBand, CalendarGrid, Legend } from "./examples/CalendarGrid";
import { type CalendarCell, type WeekSelection, createCalendar, formatDate, selectedCells, validateRange } from "./examples/calendar";

function BasicExample({ cells }: { cells: CalendarCell[] }) {
  const [clicked, setClicked] = useState<CalendarCell | null>(null);
  return <section className="example" aria-labelledby="basic-title">
    <div className="example-heading"><span className="example-number">01</span><div><h2 id="basic-title">Explore daily activity</h2><p>Hover over a day for details. Click a cell, or focus it and press Enter, to inspect it.</p></div></div>
    <CalendarGrid cells={cells} onClick={setClicked} />
    <Legend />
    <div className="readout" aria-live="polite">{clicked?.date ? <><strong>{formatDate(clicked.date)}</strong><span>{clicked.value} activities</span></> : "Select a day to see its activity here."}</div>
  </section>;
}

function SelectionExample({ cells }: { cells: CalendarCell[] }) {
  const [weeks, setWeeks] = useState<WeekSelection>(null);
  const [reset, setReset] = useState(0);
  const selected = useMemo(() => selectedCells(cells, weeks), [cells, weeks]);
  const total = selected.reduce((sum, cell) => sum + cell.value, 0);
  return <section className="example" aria-labelledby="selection-title">
    <div className="example-heading"><span className="example-number">02</span><div><h2 id="selection-title">Select a range with RangeBand</h2><p>Drag across the grid to select weeks. Move the band or drag its edges to adjust it. Every week touched is included.</p></div></div>
    <CalendarGrid cells={cells} weeks={weeks}>
      <CalendarBand key={reset} weekCount={cells.length / 7} onSelection={setWeeks} />
    </CalendarGrid>
    <Legend />
    <div className="selection-summary">
      <div aria-live="polite">{selected.length ? <><strong>{formatDate(selected[0].date!)} – {formatDate(selected[selected.length - 1].date!)}</strong><p>{selected.length} days selected · {total} activities</p></> : <><strong>No weeks selected</strong><p>Drag over the calendar to inspect a date range.</p></>}</div>
      <button type="button" disabled={!weeks} onClick={() => { setWeeks(null); setReset(value => value + 1); }}>Clear selection</button>
    </div>
    <div className="table-scroll"><table><caption>Selected daily activity</caption><thead><tr><th scope="col">Date</th><th scope="col">Activity</th></tr></thead><tbody>
      {selected.length ? selected.map(cell => <tr key={cell.date}><td>{formatDate(cell.date!)}</td><td>{cell.value}</td></tr>) : <tr><td colSpan={2} className="empty-table">Selected dates will appear here.</td></tr>}
    </tbody></table></div>
  </section>;
}

export default function App() {
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-12-31");
  const [range, setRange] = useState({ start, end });
  const cells = useMemo(() => createCalendar(range.start, range.end), [range]);
  const error = validateRange(start, end);
  return <main>
    <header><p className="eyebrow">ALLEGRIA / DATAVIZ EXAMPLES</p><h1>A year, one day at a time.</h1><p className="intro">Explore a density grid and try selecting its data with RangeBand. Choose a date range to update both examples.</p></header>
    <form className="date-controls" noValidate onSubmit={event => { event.preventDefault(); if (!error) setRange({ start, end }); }}>
      <label>Start date<input type="date" value={start} onChange={event => setStart(event.target.value)} aria-describedby={error ? "date-error" : undefined} /></label>
      <label>End date<input type="date" value={end} onChange={event => setEnd(event.target.value)} aria-describedby={error ? "date-error" : undefined} /></label>
      <button className="primary-button" type="submit" disabled={!!error}>Apply date range</button>
      {error && <p className="form-error" id="date-error" role="alert">{error}</p>}
    </form>
    <div key={`${range.start}/${range.end}`}><BasicExample cells={cells} /><SelectionExample cells={cells} /></div>
    <footer>Built with DensityGrid and RangeBand · Each cell represents one day, with weeks starting on Monday.</footer>
  </main>;
}
