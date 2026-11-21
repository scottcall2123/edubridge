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
const { earnedBadges } = require("../lib/badges.ts");
test("new profile has no invented achievements", () => {
  assert.deepEqual(earnedBadges({ streak_days: 0 }, [], []), {
    firstQuestion: false,
    firstAI: false,
    streak3: false,
    streak7: false,
    firstBooking: false,
  });
});
test("badges come from saved solved questions, current streak and confirmed bookings", () => {
  assert.deepEqual(
    earnedBadges(
      { streak_days: 7 },
      [{ status: "solved_by_ai" }],
      [{ status: "confirmed" }],
    ),
    {
      firstQuestion: true,
      firstAI: true,
      streak3: true,
      streak7: true,
      firstBooking: true,
    },
  );
  const b = earnedBadges(
    { streak_days: 3 },
    [{ status: "solved_by_forum" }],
    [{ status: "cancelled" }],
  );
  assert(b.firstQuestion);
  assert(b.streak3);
  assert(!b.streak7);
  assert(!b.firstAI);
  assert(!b.firstBooking);
});
