import { curriculum } from "@/data/curriculum";

export const quizzes = curriculum.flatMap((lesson) =>
  lesson.quizzes.map((quiz) => ({
    ...quiz,
    lessonId: lesson.id
  }))
);
