import { curriculum } from "@/data/curriculum";

export const exercises = curriculum.flatMap((lesson) =>
  lesson.exercises.map((exercise) => ({
    ...exercise,
    lessonId: lesson.id
  }))
);
