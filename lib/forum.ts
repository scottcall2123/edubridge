import "server-only";
import { createAdminClient } from "./supabase/admin";
import type { Subject, Topic, Answer } from "./types";
export interface ForumQuestion {
  id: string;
  text: string;
  subject_id: string;
  topic_id: string | null;
  is_sample: boolean;
  created_at: string;
  answerCount: number;
}
export async function loadForum(selected?: string) {
  const admin = createAdminClient();
  const subjectId = selected
    ? (
        await admin
          .from("subjects")
          .select("id")
          .eq("slug", selected)
          .maybeSingle()
      ).data?.id
    : undefined;
  const [questions, subjects, topics] = await Promise.all([
    admin
      .from("questions")
      .select("id,text,subject_id,topic_id,is_sample,created_at,answers(count)")
      .eq("is_public", true)
      .match(subjectId ? { subject_id: subjectId } : {})
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("subjects").select("*").order("sort"),
    admin.from("topics").select("*"),
  ]);
  if (questions.error || subjects.error || topics.error)
    throw new Error("Forum unavailable");
  return {
    // The answer count is aggregated by Postgres in the same query, which
    // keeps the forum to one round trip.
    questions: questions.data.map(({ answers, ...q }) => ({
      ...q,
      answerCount:
        (answers as { count: number }[] | null)?.[0]?.count ?? 0,
    })) as ForumQuestion[],
    subjects: subjects.data as Subject[],
    topics: topics.data as Topic[],
  };
}
export async function loadForumDetail(id: string, userId?: string) {
  const admin = createAdminClient();
  const { data: q, error } = await admin
    .from("questions")
    .select("id,user_id,text,subject_id,topic_id,is_sample,created_at")
    .eq("id", id)
    .eq("is_public", true)
    .single();
  if (error || !q) return null;
  const [answers, subject, topic] = await Promise.all([
    admin
      .from("answers")
      .select("*")
      .eq("question_id", id)
      .order("stars", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    admin.from("subjects").select("*").eq("id", q.subject_id).single(),
    q.topic_id
      ? admin.from("topics").select("*").eq("id", q.topic_id).single()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (answers.error || subject.error || topic.error)
    throw new Error("Forum unavailable");
  const owns = q.user_id === userId;
  return {
    question: {
      id: q.id,
      text: q.text,
      is_sample: q.is_sample,
      created_at: q.created_at,
    },
    subject: subject.data as Subject,
    topic: topic.data as Topic | null,
    answers: (answers.data as Answer[]).map((a) => ({
      id: a.id,
      author_name: a.author_name,
      steps: a.steps,
      stars: a.stars,
      is_sample: a.is_sample,
      canRate:
        owns &&
        !!a.author_id &&
        a.author_id !== userId &&
        !a.is_sample &&
        a.stars === null,
    })),
  };
}
