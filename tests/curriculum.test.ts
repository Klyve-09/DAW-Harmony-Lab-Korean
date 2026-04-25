import { describe, expect, it } from "vitest";
import { generateStaticParams } from "@/app/lessons/[slug]/page";
import { curriculum } from "@/data/curriculum";
import { exercises } from "@/data/exercises";
import { quizzes } from "@/data/quizzes";

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

describe("curriculum data", () => {
  it("keeps every lesson complete enough to render", () => {
    expect(curriculum).toHaveLength(15);
    curriculum.forEach((lesson, index) => {
      expect(lesson.order).toBe(index + 1);
      expect(lesson.examples[0].notes.length).toBeGreaterThan(0);
      expect(lesson.exercises[0].expectedNotes?.length).toBeGreaterThan(0);
      expect(lesson.quizzes).toHaveLength(2);
      lesson.quizzes.forEach((quiz) => expect(quiz.choices).toContain(quiz.answer));
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
});
