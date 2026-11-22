"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, Star } from "lucide-react";
import { Card, Tag, Avatar, Button } from "@/components/ui";
import { bookSlot } from "@/app/actions/booking";
import {
  slotLabel,
  localDay,
  slotDate,
  SOON_WINDOW_MS,
} from "@/lib/booking";
import type { TeacherWithSlots } from "@/lib/teachers";
import type { Locale } from "@/lib/i18n";
import type { TeacherSlot, Booking } from "@/lib/types";
export function BookingFlow({
  teacher,
  questionId,
  confirmation,
  referenceTime,
}: {
  teacher: TeacherWithSlots;
  questionId?: string;
  confirmation?: { booking: Booking; slot: TeacherSlot };
  referenceTime: string;
}) {
  // referenceTime comes from the server, so "is this slot soon?" resolves the
  // same on both sides and the preselected radio cannot cause a hydration
  // mismatch.
  const soonLimit = Date.parse(referenceTime) + SOON_WINDOW_MS;
  const isSoon = (startsAt: string) => Date.parse(startsAt) <= soonLimit;
  const t = useTranslations(),
    locale = useLocale() as Locale,
    router = useRouter(),
    // A student who came from "Hozir bo'sh ustozlar" wants the soonest lesson,
    // so start with it chosen instead of making them hunt for it.
    [selected, setSelected] = useState(
      () => teacher.slots.find((s) => isSoon(s.starts_at))?.id ?? "",
    ),
    [reviewing, setReviewing] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(false),
    [pending, start] = useTransition();
  const slot =
    confirmation?.slot ?? teacher.slots.find((s) => s.id === selected);
  const time = (at: string) =>
    slotLabel(
      at,
      locale,
      (key) => t(`teachers.${key}`),
      new Date(referenceTime),
    );
  const groups = Map.groupBy(teacher.slots, (s) => localDay(s.starts_at));
  if (confirmation)
    return (
      <Card className="mx-auto max-w-xl space-y-6 text-center">
        <CheckCircle className="mx-auto text-success" />
        <h1>{t("booking.done")}</h1>
        {teacher.is_sample && <Tag>{t("common.sample")}</Tag>}
        <h2>{teacher.full_name}</h2>
        <p>
          {time(confirmation.slot.starts_at)} · {t("booking.duration")}
        </p>
        <p className="text-sm text-muted">{t("teachers.timezone")}</p>
        <p className="font-bold text-accent">{t("teachers.freeForStudents")}</p>
        <p className="text-sm text-muted">{t("teachers.fundingPlan")}</p>
        <p>{t("booking.meeting")}</p>
        <Link href="/jonli-dars" className="button button-secondary">{t("lesson.preview")}</Link>
        <div className="rounded-xl bg-sky-50 p-4">
          <p className="mb-3 text-sm text-muted">{t("booking.offlineNotice")}</p>
          <Button variant="secondary" onClick={() => setToast(true)}>
            {t("booking.offline")}
          </Button>
          {toast && (
            <p role="status" className="mt-3 text-sm">
              {t("booking.offlineSent")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/profile" className="button button-primary">
            {t("ask.toProfile")}
          </Link>
          <Link href="/dashboard" className="button button-secondary">
            {t("nav.home")}
          </Link>
        </div>
      </Card>
    );
  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      <Card className="space-y-5">
        <Avatar name={teacher.full_name} />
        <h1>{teacher.full_name}</h1>
        <Tag>{teacher.subject[`name_${locale}`]}</Tag>
        {teacher.is_sample && <Tag>{t("common.sample")}</Tag>}
        <p className="text-muted">{teacher.district}</p>
        <p className="flex items-center gap-2">
          <Star className="text-gold" />
          {t("teachers.rating", { rating: teacher.rating })}
        </p>
        <p>{teacher[`bio_${locale}`]}</p>
        <p className="text-sm text-muted">
          {t("teachers.center", { name: teacher.offline_center })}
        </p>
        <p className="font-bold text-accent">{t("teachers.freeSession")}</p>
        <p className="text-sm text-muted">{t("teachers.fundingPlan")}</p>
      </Card>
      <Card className="space-y-5">
        {reviewing && slot ? (
          <>
            <h2>{t("booking.reviewTitle")}</h2>
            <p>{t("booking.notice")}</p>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted">{t("booking.summary")}</dt>
                <dd>{teacher.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{t("teachers.timezone")}</dt>
                <dd>
                  {time(slot.starts_at)} · {t("booking.duration")}
                </dd>
              </div>
            </dl>
            <p className="font-bold text-accent">{t("teachers.freeForStudents")}</p>
            <Button
              disabled={pending}
              className="w-full"
              onClick={() => {
                setError("");
                start(async () => {
                  try {
                    const result = await bookSlot(slot.id, questionId);
                    if (result.error) {
                      setError(result.error);
                      if (result.error === "slotTaken") {
                        setSelected("");
                        setReviewing(false);
                        router.refresh();
                      }
                    } else
                      router.push(
                        `/teachers/${teacher.id}?booking=${result.bookingId}${questionId ? `&q=${questionId}` : ""}`,
                      );
                  } catch {
                    setError("save");
                  }
                });
              }}
            >
              {t(pending ? "common.loading" : "booking.confirmFree")}
            </Button>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => setReviewing(false)}
            >
              {t("booking.back")}
            </Button>
          </>
        ) : (
          <>
            <h2>{t("teachers.slots")}</h2>
            <p className="text-sm text-muted">{t("teachers.timezone")}</p>
            <div
              role="radiogroup"
              aria-label={t("teachers.slots")}
              className="space-y-4"
            >
              {[...groups].map(([day, slots]) => (
                <fieldset key={day} className="space-y-2">
                  <legend className="mb-2 text-sm font-bold">
                    {slotDate(slots[0].starts_at)}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <label
                        key={s.id}
                        className={`mb-0 min-h-12 cursor-pointer rounded-xl border p-3 ${selected === s.id ? "border-accent bg-sky-50" : "border-line"}`}
                      >
                        <input
                          type="radio"
                          style={{
                            width: 16,
                            height: 16,
                            minHeight: 0,
                            padding: 0,
                          }}
                          name="slot"
                          className="mr-2 inline min-h-0 w-auto"
                          checked={selected === s.id}
                          onChange={() => {
                            setSelected(s.id);
                            setError("");
                          }}
                        />
                        {time(s.starts_at)}
                        {isSoon(s.starts_at) && (
                          <span className="availability availability-now ml-2">
                            <span className="availability-dot" aria-hidden />
                            {t("teachers.status_now")}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            {!teacher.slots.length && (
              <>
                <p>{t("teachers.noSlots")}</p>
                <Button variant="secondary" onClick={() => router.refresh()}>
                  {t("errors.retry")}
                </Button>
              </>
            )}
            <Button disabled={!slot} onClick={() => setReviewing(true)}>
              {t("common.continue")}
            </Button>
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {t(`booking.${error}`)}
          </p>
        )}
      </Card>
    </div>
  );
}
