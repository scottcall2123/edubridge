import { requireUser } from "@/lib/auth";
import { ComingSoon } from "@/components/ComingSoon";
export default async function Profile() {
  await requireUser();
  return <ComingSoon />;
}
