import { describe, expect, it } from "vitest";
import { dawImportGuides } from "@/lib/daw/importGuides";

describe("DAW import guides", () => {
  it("covers the target DAWs with source-backed MIDI import steps", () => {
    expect(dawImportGuides.map((guide) => guide.id)).toEqual(["ableton", "fl-studio", "logic-pro"]);

    dawImportGuides.forEach((guide) => {
      expect(guide.sourceUrl).toMatch(/^https:\/\//);
      expect(guide.steps).toHaveLength(3);
      expect(guide.steps.join(" ")).toMatch(/MIDI|\.mid/);
      expect(guide.check.length).toBeGreaterThan(20);
    });
  });

  it("reminds learners that MIDI still needs an instrument in major DAWs", () => {
    const text = dawImportGuides.map((guide) => `${guide.steps.join(" ")} ${guide.check}`).join(" ");

    expect(text).toContain("Instrument");
    expect(text).toContain("악기");
    expect(text).toContain("플러그인");
  });

  it("uses distinct source labels for accessible documentation links", () => {
    const labels = dawImportGuides.map((guide) => guide.sourceLabel);

    expect(new Set(labels).size).toBe(labels.length);
    labels.forEach((label) => expect(label).toMatch(/Ableton|FL Studio|Logic Pro/));
  });
});
