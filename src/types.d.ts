type D3Selection = {
  SVG: Selection<SVGSVGElement, unknown, null, undefined>;
  G: Selection<SVGGElement, unknown, null, undefined>;
  DIV: Selection<HTMLDivElement, unknown, null, undefined>;
};

type IsDefined<T> = Exclude<T, undefined>;
