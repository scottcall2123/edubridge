"use server";
import { z } from "zod";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  ownedQuestion,
  questionInput,
  type SimilarQuestion,
} from "@/lib/questions";
import { awardPoints, POINTS } from "@/lib/points";
import type { Answer, Subject, Topic } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export async function createQuestion(input: unknown) {
  const { user } = await requireUser(),
    parsed = questionInput.safeParse(input);
  if (!parsed.success) return { error: "validation" as const };
  const { requestId, subjectId, topicId, text } = parsed.data;
  try {
    await awardPoints(
      user.id,
      "question_asked",
      POINTS.question_asked,
      requestId,
      { newQuestion: { subject_id: subjectId, topic_id: topicId, text } },
    );
    revalidatePath("/dashboard");
    return { questionId: requestId };
  } catch {
    return { error: "save" as const };
  }
}
export async function findSimilar(
  questionId: string,
): Promise<SimilarQuestion[]> {
  const { user } = await requireUser();
  const question = await ownedQuestion(z.uuid().parse(questionId), user.id),
    client = await createClient(),
    locale = (await getLocale()) as Locale;
  const { data, error } = await client.rpc("search_similar_questions", {
    q: question.text,
    p_topic: question.topic_id,
    p_subject: question.subject_id,
    p_exclude: question.id,
  });
  if (error) throw new Error("Search unavailable");
  const found = data as Pick<SimilarQuestion, "id" | "text" | "is_sample">[];
  if (!found.length) return [];
  const [answers, topics, subject] = await Promise.all([
    client
      .from("answers")
      .select("*")
      .in(
        "question_id",
        found.map((q) => q.id),
      )
      .order("stars", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    client.from("topics").select("*").eq("subject_id", question.subject_id),
    client.from("subjects").select("*").eq("id", question.subject_id).single(),
  ]);
  if (answers.error || topics.error || subject.error)
    throw new Error("Answers unavailable");
  const rows = answers.data as Answer[],
    ts = topics.data as Topic[],
    s = subject.data as Subject;
  return found.flatMap((q) => {
    const answer = rows.find((a) => a.question_id === q.id);
    if (!answer) return [];
    return [
      {
        ...q,
        steps: z.array(z.string()).parse(answer.steps),
        answerId: answer.id,
        subject: s[`name_${locale}`],
        topic:
          ts.find(
            (t) =>
              t.id ===
              (data as { id: string; topic_id: string }[]).find(
                (r) => r.id === q.id,
              )?.topic_id,
          )?.[`title_${locale}`] ?? "",
        is_sample: q.is_sample || answer.is_sample,
      },
    ];
  });
}
export async function markHelped(input: unknown) {
  const { user } = await requireUser(),
    parsed = z
      .object({ questionId: z.uuid(), answerId: z.uuid() })
      .safeParse(input);
  if (!parsed.success) return { error: "validation" as const };
  try {
    const question = await ownedQuestion(parsed.data.questionId, user.id);
    if (question.status === "open") {
      const similar = await findSimilar(question.id);
      if (!similar.some((q) => q.answerId === parsed.data.answerId))
        return { error: "validation" as const };
      await awardPoints(
        user.id,
        "forum_helped",
        POINTS.forum_helped,
        question.id,
        { status: "solved_by_forum" },
      );
    }
    revalidatePath("/dashboard");
    return { questionId: question.id };
  } catch {
    return { error: "save" as const };
  }
}
