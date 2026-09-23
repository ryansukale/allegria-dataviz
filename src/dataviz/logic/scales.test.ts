import { describe, expect, it } from "vitest";
import { getLinearScale, getOrdinalScale } from "./scales";

describe("scale helpers", () => {
  it("creates a linear scale from the input extent", () => {
    const scale = getLinearScale([10, 20, 30], ["white", "black"]);
    expect(scale(10)).toBe("rgb(255, 255, 255)");
    expect(scale(30)).toBe("rgb(0, 0, 0)");
  });

  it("creates an ordinal scale", () => {
    const scale = getOrdinalScale(["low", "high"], ["blue", "red"]);
    expect(scale("low")).toBe("blue");
    expect(scale("high")).toBe("red");
  });
});
