/* eslint-disable @typescript-eslint/no-require-imports -- Node TypeScript test harness. */
const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  ts = require("typescript");
require.extensions[".ts"] = (module, file) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    file,
  );
const {
  slotCandidates,
  localDay,
  slotLabel,
  bookingInput,
  formatUzs,
  slotDate,
} = require("../lib/booking.ts");
test("booking prices and numeric dates have deterministic server/browser formatting", () => {
  assert.equal(formatUzs(35000), "35 000");
  assert.equal(formatUzs(1200000), "1 200 000");
  assert.equal(slotDate("2026-11-21T19:00:00Z"), "22.11.2026");
});
test("future slots use Tashkent 09:00/14:00/17:00 and never return passed times", () => {
  for (const value of [
    "2026-11-21T03:59:00Z",
    "2026-11-21T12:00:00Z",
    "2026-11-21T19:01:00Z",
  ]) {
    const now = new Date(value),
      slots = slotCandidates(now);
    assert(slots.length >= 3);
    assert.equal(new Set(slots).size, slots.length);
    for (const start of slots) {
      assert(Date.parse(start) > now.getTime());
      assert([4, 9, 12].includes(new Date(start).getUTCHours()));
    }
  }
});
test("slot labels use Uzbekistan dates and explicit locale", () => {
  const now = new Date("2026-11-21T19:01:00Z");
  assert.equal(localDay(now), "2026-11-22");
  assert.equal(
    slotLabel("2026-11-22T04:00:00Z", "en", (k) => k, now),
    "today 09:00",
  );
  assert.equal(
    slotLabel("2026-11-23T09:00:00Z", "en", (k) => k, now),
    "tomorrow 14:00",
  );
});
test("booking input accepts only UUIDs and optional question", () => {
  const id = "00000001-0000-4000-8000-000000000001";
  assert(bookingInput.safeParse({ slotId: id }).success);
  assert(bookingInput.safeParse({ slotId: id, questionId: id }).success);
  assert(!bookingInput.safeParse({ slotId: id, questionId: "other" }).success);
  assert(!bookingInput.safeParse({ slotId: "bad" }).success);
});
