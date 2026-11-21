"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { bookingInput } from "@/lib/booking";
import { bookWithPoints } from "@/lib/points";
export async function bookSlot(slotId: string, questionId?: string) {
  const { user } = await requireUser(),
    parsed = bookingInput.safeParse({ slotId, questionId });
  if (!parsed.success) return { error: "invalidQuestion" as const };
  try {
    const bookingId = await bookWithPoints(
      user.id,
      parsed.data.slotId,
      parsed.data.questionId,
    );
    for (const path of ["/teachers", "/dashboard", "/profile"])
      revalidatePath(path);
    return { bookingId };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    return {
      error:
        code === "slotTaken"
          ? ("slotTaken" as const)
          : code === "invalidQuestion"
            ? ("invalidQuestion" as const)
            : ("save" as const),
    };
  }
}
