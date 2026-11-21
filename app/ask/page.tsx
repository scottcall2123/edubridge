import { requireUser } from "@/lib/auth";
import { ComingSoon } from "@/components/ComingSoon";
export default async function Ask() {
  await requireUser();
  return <ComingSoon />;
}
