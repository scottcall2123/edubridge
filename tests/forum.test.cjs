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
    answerInput,
    ratingInput,
    reportInput,
  } = require("../lib/forum-input.ts"),
  id = "00000001-0000-4000-8000-000000000001";
test("answers require at least two trimmed bounded steps", () => {
  assert(
    answerInput.safeParse({
      requestId: id,
      questionId: id,
      steps: [" First step ", "Second step"],
    }).success,
  );
  for (const steps of [
    ["only one"],
    ["ok", "second"],
    ["one step", "x".repeat(1001)],
  ])
    assert(
      !answerInput.safeParse({ requestId: id, questionId: id, steps }).success,
    );
});
test("stars are integers 1–5 and targets must be UUIDs", () => {
  assert(ratingInput.safeParse({ answerId: id, stars: 5 }).success);
  for (const stars of [0, 6, 1.5, "5"])
    assert(!ratingInput.safeParse({ answerId: id, stars }).success);
  assert(!ratingInput.safeParse({ answerId: "bad", stars: 5 }).success);
});
test("reports only accept known post types and UUIDs", () => {
  assert(
    reportInput.safeParse({ targetType: "question", targetId: id }).success,
  );
  assert(
    !reportInput.safeParse({ targetType: "profile", targetId: id }).success,
  );
});
