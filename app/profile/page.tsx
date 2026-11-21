import { getTranslations } from "next-intl/server";
import { requireStudent } from "@/lib/auth";
import { loadProfile } from "@/lib/profile";
import { ProfileView } from "@/components/profile/ProfileView";
export async function generateMetadata() {
  return { title: (await getTranslations("profile"))("title") };
}
export default async function Profile() {
  const { user } = await requireStudent();
  return <ProfileView {...await loadProfile(user.id)} />;
}
