import { describe, expect, it } from "vitest";
import { buildChord } from "@/lib/theory/chords";
import { getMajorScale, getNaturalMinorScale } from "@/lib/theory/scales";
import { transposeProgression } from "@/lib/theory/romanNumerals";
import { generateProgression, generatorOptions } from "@/lib/theory/progressions";
import { chordToPianoRollNotes } from "@/lib/utils";

describe("music theory utilities", () => {
  it("builds C major scale", () => {
    expect(getMajorScale("C")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("builds A natural minor scale", () => {
    expect(getNaturalMinorScale("A")).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });

  it("builds chords", () => {
    expect(buildChord("C", "major").notes).toEqual(["C", "E", "G"]);
    expect(buildChord("G", "7").notes).toEqual(["G", "B", "D", "F"]);
  });

  it("transposes roman numeral progressions", () => {
    expect(transposeProgression(["I", "V", "vi", "IV"], "C").map((chord) => chord.name)).toEqual(["C", "G", "Am", "F"]);
    expect(transposeProgression(["I", "V", "vi", "IV"], "G").map((chord) => chord.name)).toEqual(["G", "D", "Em", "C"]);
  });

  it("keeps lowercase seventh numerals minor", () => {
    expect(transposeProgression(["IVmaj7", "iii7", "vi7", "V7"], "C").map((chord) => chord.name)).toEqual([
      "Fmaj7",
      "Em7",
      "Am7",
      "G7"
    ]);
  });

  it("spells borrowed flat degrees as flats", () => {
    const chords = transposeProgression(["I", "bVI", "bVII", "I"], "C");
    expect(chords.map((chord) => chord.name)).toEqual(["C", "Ab", "Bb", "C"]);
    expect(chords[1].notes).toEqual(["Ab", "C", "Eb"]);
  });

  it("places add9 notes above the triad in piano roll output", () => {
    expect(chordToPianoRollNotes(buildChord("C", "add9")).map((note) => note.pitch)).toEqual(["C3", "E4", "G4", "D5"]);
    expect(chordToPianoRollNotes(buildChord("C", "add9")).map((note) => note.role)).toEqual(["root", "third", "fifth", "tension"]);
  });

  it("marks seventh chord tones with specific piano-roll roles", () => {
    expect(chordToPianoRollNotes(buildChord("C", "maj7")).map((note) => note.role)).toEqual(["root", "third", "fifth", "seventh"]);
  });

  it("uses minor-key templates for generated minor progressions", () => {
    const generated = generateProgression("Am", "pop", "bright", "basic");
    expect(generated.chords.map((chord) => chord.name)).toEqual(["Am", "F", "C", "G"]);
    expect(generated.fallback).toBeUndefined();
  });

  it("marks generated progressions when a request falls back to a nearby template", () => {
    const generated = generateProgression("C", "hiphop", "dreamy", "advanced");

    expect(generated.genre).toBe("hiphop");
    expect(generated.mood).toBe("dreamy");
    expect(generated.complexity).toBe("advanced");
    expect(generated.fallback).toEqual({
      requested: { genre: "hiphop", mood: "dreamy", complexity: "advanced" },
      used: { genre: "hiphop", mood: "tense", complexity: "basic" }
    });
  });

  it("generates playable progressions for every advertised option combination", () => {
    generatorOptions.keys.forEach((key) => {
      generatorOptions.genres.forEach((genre) => {
        generatorOptions.moods.forEach((mood) => {
          generatorOptions.complexities.forEach((complexity) => {
            const generated = generateProgression(key, genre, mood, complexity);

            expect(generated.key).toBe(key);
            expect(generated.genre).toBe(genre);
            expect(generated.mood).toBe(mood);
            expect(generated.complexity).toBe(complexity);
            expect(generated.romanNumerals).toHaveLength(generated.chords.length);
            expect(generated.chords.length).toBeGreaterThan(0);
            expect(Number.isNaN(Date.parse(generated.createdAt))).toBe(false);
            generated.chords.forEach((chord) => {
              expect(chord.name).toBeTruthy();
              expect(chord.notes.length).toBeGreaterThanOrEqual(3);
            });
          });
        });
      });
    });
  });
});
