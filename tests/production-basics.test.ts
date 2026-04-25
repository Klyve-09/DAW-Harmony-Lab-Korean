import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";

function rootTitleText() {
  const { title } = metadata;
  if (typeof title === "string") return title;
  if (title && typeof title === "object" && "default" in title) return String(title.default);
  return "";
}

describe("production-facing app basics", () => {
  it("exports non-empty root metadata for crawlers and browser chrome", () => {
    expect(rootTitleText()).toBe("DAW Harmony Lab");
    expect(metadata.description).toEqual(expect.any(String));
    expect(String(metadata.description).trim().length).toBeGreaterThan(10);
  });
});
