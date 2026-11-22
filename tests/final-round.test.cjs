/* eslint-disable @typescript-eslint/no-require-imports -- Exercise time boundaries and sample badge privacy without new dependencies. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, overrides = {}) {
  const output = ts.transpileModule(fs.readFileSync(require.resolve(file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('require', 'exports', output)(name => overrides[name] ?? require(name), exports);
  return exports;
}
const booking = load('../lib/booking.ts');
const { matchesTime, timeFilter } = load('../lib/teacher-time.ts', { './booking': booking });
const samples = load('../lib/forum-samples.ts');
test('time filters use Tashkent midnight and non-overlapping hour boundaries', () => {
  const now = new Date('2026-11-22T19:01:00Z');
  const slot = at => ({ starts_at: at });
  assert(matchesTime(slot('2026-11-23T00:00:00+05:00'), 'today', now));
  assert(!matchesTime(slot('2026-11-22T23:59:00+05:00'), 'today', now));
  assert(matchesTime(slot('2026-11-24T09:00:00+05:00'), 'tomorrow', now));
  assert(matchesTime(slot('2026-11-23T09:00:00+05:00'), 'morning', now));
  assert(!matchesTime(slot('2026-11-23T12:00:00+05:00'), 'morning', now));
  assert(matchesTime(slot('2026-11-23T12:00:00+05:00'), 'afternoon', now));
  assert(!matchesTime(slot('2026-11-23T17:00:00+05:00'), 'afternoon', now));
  assert(matchesTime(slot('2026-11-23T17:00:00+05:00'), 'evening', now));
  assert(!matchesTime(slot('2026-11-23T21:00:00+05:00'), 'evening', now));
  assert.equal(timeFilter('bad'), undefined);
});
test('Olympiad demo flags never confer a badge on an authenticated author or a real answer', () => {
  const sample = samples.SAMPLE_OLYMPIAD_STUDENTS[0];
  assert(samples.sampleOlympiadAnswer({ id: sample.answer_id, is_sample: true, author_id: null }));
  assert.equal(samples.sampleOlympiadAnswer({ id: sample.answer_id, is_sample: false, author_id: null }), undefined);
  assert.equal(samples.sampleOlympiadAnswer({ id: sample.answer_id, is_sample: true, author_id: 'real-user' }), undefined);
  assert(!samples.hasSampleOlympiadAnswer({ id: sample.question_id, is_sample: true, answerCount: 0 }));
});
