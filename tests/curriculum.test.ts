import { describe, expect, it } from "vitest";
import { generateStaticParams } from "@/app/lessons/[slug]/page";
import { curriculum } from "@/data/curriculum";
import { exercises } from "@/data/exercises";
import { quizzes } from "@/data/quizzes";
import { pianoRollNoteRoles } from "@/lib/pianoRoll/noteRoles";
import { getEditableBeatCount, getEditableMidiRange } from "@/lib/pianoRoll/grid";

const allowedRoles = new Set(pianoRollNoteRoles);

function pitchClassesFor(slug: string) {
  const lesson = curriculum.find((item) => item.slug === slug);
  if (!lesson) throw new Error(`Missing lesson: ${slug}`);
  return [...new Set(lesson.exercises[0].expectedNotes?.map((note) => note.pitch.replace(/[0-9]/g, "")) ?? [])];
}

function chordNamesFor(slug: string) {
  const lesson = curriculum.find((item) => item.slug === slug);
  if (!lesson) throw new Error(`Missing lesson: ${slug}`);
  return lesson.exercises[0].expectedChords?.map((chord) => chord.name) ?? [];
}

function exerciseRolesFor(slug: string) {
  const lesson = curriculum.find((item) => item.slug === slug);
  if (!lesson) throw new Error(`Missing lesson: ${slug}`);
  return lesson.exercises[0].expectedNotes?.map((note) => note.role) ?? [];
}

describe("curriculum data", () => {
  it("keeps every lesson complete enough to render", () => {
    expect(curriculum).toHaveLength(15);
    curriculum.forEach((lesson, index) => {
      expect(lesson.order).toBe(index + 1);
      expect(lesson.examples[0].notes.length).toBeGreaterThan(0);
      expect(lesson.commonMistakes).toHaveLength(3);
      lesson.commonMistakes.forEach((mistake) => {
        expect(mistake.title).toBeTruthy();
        expect(mistake.fix).toBeTruthy();
        expect(mistake.miniDrill).toBeTruthy();
      });
      expect(lesson.listeningDrills).toHaveLength(2);
      lesson.listeningDrills.forEach((drill) => {
        expect(["A", "B"]).toContain(drill.answerId);
        expect(drill.options.map((option) => option.id).sort()).toEqual(["A", "B"]);
        expect(drill.options.map((option) => option.label).sort()).toEqual(["버전 A", "버전 B"]);
        drill.options.forEach((option) => expect(option.notes.length).toBeGreaterThan(0));
      });
      expect(lesson.exercises[0].hints).toHaveLength(3);
      expect(lesson.exercises[0].expectedNotes?.length).toBeGreaterThan(0);
      expect(lesson.quizzes).toHaveLength(2);
      lesson.quizzes.forEach((quiz) => expect(quiz.choices).toContain(quiz.answer));
    });
  });

  it("varies listening answer positions across the curriculum", () => {
    const answerPatterns = curriculum.map((lesson) => lesson.listeningDrills.map((drill) => drill.answerId).join(""));

    expect(new Set(answerPatterns).size).toBeGreaterThan(1);
    expect(answerPatterns.some((pattern) => pattern !== "AB")).toBe(true);
  });

  it("includes three 4-bar genre project checkpoints", () => {
    const projects = curriculum.flatMap((lesson) => (lesson.projectCheckpoint ? [lesson.projectCheckpoint] : []));

    expect(projects.map((project) => project.genre)).toEqual(["Pop", "Lo-fi", "Cinematic"]);
    projects.forEach((project) => {
      expect(project.bars).toBe(4);
      expect(project.chords).toHaveLength(4);
      expect(project.notes.length).toBeGreaterThan(0);
      expect(project.steps).toHaveLength(3);
      expect(project.instrumentLayers).toHaveLength(4);
      expect(project.extensionBars).toBe(8);
      expect(project.extensionSteps).toHaveLength(3);
      project.notes.forEach((note) => {
        expect(note.chordId).toBeTruthy();
        expect(note.voice).toBeTruthy();
      });
    });
  });

  it("uses exercise-specific answers instead of copying unrelated examples", () => {
    expect(pitchClassesFor("triads")).toEqual(["C", "E", "G"]);
    expect(chordNamesFor("roman-numerals")).toEqual(["C", "G", "Am", "F"]);
    expect(chordNamesFor("chord-functions")).toEqual(["Dm", "G", "C"]);
    expect(pitchClassesFor("seventh-chords")).toEqual(["C", "E", "G", "B"]);
    expect(pitchClassesFor("basslines-slash-chords")).toEqual(["C", "B", "A", "G"]);
    expect(pitchClassesFor("tensions-add-sus")).toEqual(["C", "E", "G", "D"]);
    expect(chordNamesFor("secondary-dominants")).toEqual(["C", "E7", "Am"]);
  });

  it("allows the practice piano roll to cover every exercise target beat", () => {
    curriculum.forEach((lesson) => {
      const expectedNotes = lesson.exercises[0].expectedNotes ?? [];
      const latestEndBeat = Math.max(...expectedNotes.map((note) => note.startBeat + note.duration));

      expect(getEditableBeatCount([], expectedNotes)).toBeGreaterThanOrEqual(latestEndBeat);
    });
  });

  it("allows the practice piano roll to cover every exercise target pitch", () => {
    curriculum.forEach((lesson) => {
      const expectedNotes = lesson.exercises[0].expectedNotes ?? [];
      const midiRange = getEditableMidiRange([], expectedNotes);
      const rangeSet = new Set(midiRange);

      expectedNotes.forEach((note) => {
        expect(rangeSet.has(note.midi)).toBe(true);
      });
    });
  });

  it("labels pitch-list chord exercises with chord roles instead of passing tones", () => {
    expect(exerciseRolesFor("triads")).toEqual(["root", "third", "fifth"]);
    expect(exerciseRolesFor("seventh-chords")).toEqual(["root", "third", "fifth", "seventh"]);
    expect(exerciseRolesFor("tensions-add-sus")).toEqual(["root", "third", "fifth", "tension"]);
  });

  it("keeps lesson route slugs unique, URL-safe, and statically generated", () => {
    const slugs = curriculum.map((lesson) => lesson.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(true);
    expect(generateStaticParams()).toEqual(slugs.map((slug) => ({ slug })));

    slugs.forEach((slug) => {
      expect(curriculum.find((lesson) => lesson.slug === slug)?.slug).toBe(slug);
    });
  });

  it("keeps flattened exercise and quiz indexes aligned to lessons", () => {
    const lessonIds = new Set(curriculum.map((lesson) => lesson.id));
    const exerciseCount = curriculum.reduce((count, lesson) => count + lesson.exercises.length, 0);
    const quizCount = curriculum.reduce((count, lesson) => count + lesson.quizzes.length, 0);

    expect(exercises).toHaveLength(exerciseCount);
    expect(quizzes).toHaveLength(quizCount);

    exercises.forEach((exercise) => {
      expect(lessonIds.has(exercise.lessonId)).toBe(true);
      expect(curriculum.find((lesson) => lesson.id === exercise.lessonId)?.exercises.some((item) => item.id === exercise.id)).toBe(true);
    });

    quizzes.forEach((quiz) => {
      expect(lessonIds.has(quiz.lessonId)).toBe(true);
      expect(curriculum.find((lesson) => lesson.id === quiz.lessonId)?.quizzes.some((item) => item.id === quiz.id)).toBe(true);
    });
  });

  it("uses only supported piano-roll note roles in generated lesson content", () => {
    curriculum.forEach((lesson) => {
      const notes = [
        ...lesson.examples.flatMap((example) => example.notes),
        ...lesson.exercises.flatMap((exercise) => exercise.expectedNotes ?? []),
        ...lesson.listeningDrills.flatMap((drill) => drill.options.flatMap((option) => option.notes))
      ];

      notes.forEach((note) => {
        if (note.role) expect(allowedRoles.has(note.role)).toBe(true);
      });
    });
  });
});
