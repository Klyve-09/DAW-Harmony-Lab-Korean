import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LessonContent } from "@/components/lesson/LessonContent";
import { curriculum, getLessonBySlug } from "@/data/curriculum";

export function generateStaticParams() {
  return curriculum.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return {};

  return {
    title: lesson.title,
    description: lesson.description,
    alternates: {
      canonical: `/lessons/${lesson.slug}`
    },
    openGraph: {
      title: lesson.title,
      description: lesson.description,
      type: "article"
    }
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();
  return (
    <AppShell>
      <LessonContent key={lesson.id} lesson={lesson} />
    </AppShell>
  );
}
