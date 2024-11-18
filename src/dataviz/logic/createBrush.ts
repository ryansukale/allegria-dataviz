import { brushX, type D3BrushEvent } from "d3-brush";

export default function createBrush({
  container,
  size,
  onStart,
  onEnd,
  onBrush,
}: {
  container: D3Selection["G"];
  size?: { startX: number; startY: number; width: number; height: number };
  onStart?: (event: D3BrushEvent<unknown>) => void;
  onEnd?: (event: D3BrushEvent<unknown>) => void;
  onBrush?: (event: D3BrushEvent<unknown>) => void;
}) {
  const brush = brushX();
  if (size) {
    const { startX, startY, width, height } = size;

    brush.extent([
      [startX, startY],
      [startX + width, startY + height],
    ]);
  }

  if (onStart) {
    brush.on("start", onStart);
  }

  if (onBrush) {
    brush.on("brush", onBrush);
  }

  if (onEnd) {
    brush.on("end", onEnd);
  }

  container.call(brush);

  return brush;
}
