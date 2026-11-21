import { getTranslations } from "next-intl/server";
import { loadForum } from "@/lib/forum";
import { ForumList } from "@/components/forum/ForumList";
import { getCurrentUser } from "@/lib/auth";
export async function generateMetadata() {
  return { title: (await getTranslations("forum"))("title") };
}
export default async function Forum({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const [data, current] = await Promise.all([loadForum(subject), getCurrentUser()]);
  return (
    <ForumList
      {...data}
      hideNewQuestion={Boolean(current?.teacher)}
      selected={data.subjects.some((s) => s.slug === subject) ? subject : ""}
    />
  );
}
