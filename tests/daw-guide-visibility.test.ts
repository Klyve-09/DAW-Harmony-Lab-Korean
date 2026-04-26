import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function source(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("DAW import guide visibility", () => {
  it("keeps the shared transport guide opt-in", () => {
    expect(source("components/audio/TransportControls.tsx")).toContain("showDawGuide = false");
  });

  it("shows the DAW import guide on generator and project export panels", () => {
    expect(source("components/generator/ChordProgressionGenerator.tsx")).toContain("showDawGuide");
    expect(source("components/lesson/ProjectCheckpointPanel.tsx")).toContain("showDawGuide");
  });

  it("keeps lesson examples focused on playback without the import guide", () => {
    expect(source("components/lesson/LessonContent.tsx")).not.toContain("showDawGuide");
  });
});
