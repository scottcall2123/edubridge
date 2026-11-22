/* eslint-disable @typescript-eslint/no-require-imports -- Test TypeScript server code without new dependencies. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const path = require('node:path');
function compile(file, overrides = {}) {
  const absolute = path.resolve(__dirname, '..', file);
  const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  const localRequire = (name) => name in overrides ? overrides[name] : name === 'server-only' ? {} : require(name);
  new Function('require', 'exports', code)(localRequire, exports);
  return exports;
}
const practice = compile('lib/practice.ts', { './gemini': { DEFAULT_GEMINI_MODEL: 'unused', FALLBACK_GEMINI_MODELS: [] } });
const userId = '00000001-0000-4000-8000-000000000001';
const questionId = '00000001-0000-4000-8000-000000000002';
const result = { problems: [{ question: 'Solve 2x + 3 = 11', steps: ['Subtract 3 from both sides.', 'Divide by 2 to find x = 4.'] }, { question: 'Solve 3x + 1 = 16', steps: ['Subtract 1 from both sides.', 'Divide by 3 to find x = 5.'] }] };
test('practice reservations are three stable UUIDs scoped to the user and question', () => {
  const ids = practice.practiceSlotIds(userId, questionId);
  assert.equal(new Set(ids).size, 3);
  assert.deepEqual(ids, practice.practiceSlotIds(userId, questionId));
  assert.notDeepEqual(ids, practice.practiceSlotIds(questionId, userId));
  for (const id of ids) assert.match(id, /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-a[\da-f]{3}-[\da-f]{12}$/);
  assert(practice.practiceResult.safeParse(result).success);
  assert(!practice.practiceResult.safeParse({ problems: [{ question: 'Bare answer', steps: ['4'] }] }).success);
});
function harness({ signedIn = true, status = 'solved_by_ai', fail = false } = {}) {
  const rows = new Map();
  let calls = 0;
  function from(table) {
    const query = { filters: [], mode: 'read', value: null, head: false,
      select(_, options) { this.head = options?.head; return this; },
      in(_, ids) { this.ids = ids; return this; },
      eq(key, value) { this.filters.push([key, value]); return this; },
      insert(value) { this.mode = 'insert'; this.value = value; return this; },
      update(value) { this.mode = 'update'; this.value = value; return this; },
      single() { return Promise.resolve({ data: table === 'profiles' ? { grade: 8 } : { name_uz: 'Algebra', title_uz: 'Equations' }, error: null }); },
      then(resolve, reject) {
        return Promise.resolve().then(() => {
          if (this.mode === 'insert') {
            if (rows.has(this.value.id)) return { error: { code: '23505' } };
            rows.set(this.value.id, { ...this.value }); return { error: null };
          }
          const found = [...rows.values()].filter(row => (!this.ids || this.ids.includes(row.id)) && this.filters.every(([key,value]) => row[key] === value));
          if (this.mode === 'update') for (const row of found) Object.assign(row, this.value);
          return { data: found, count: found.length, error: null };
        }).then(resolve, reject);
      }
    };
    return query;
  }
  const client = { from, auth: { getUser: async () => ({ data: { user: signedIn ? { id: userId } : null } }) } };
  const route = compile('app/api/practice/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@/lib/supabase/server': { createClient: async () => client, isSupabaseConfigured: () => true },
    '@/lib/supabase/admin': { createAdminClient: () => ({ from }) },
    '@/lib/questions': { ownedQuestion: async () => ({ id: questionId, status, subject_id: 'subject', topic_id: 'topic', text: 'Original equation' }) },
    '@/lib/practice': { ...practice, generatePractice: async () => { calls++; if (fail) throw new Error('unavailable'); return result; } },
  });
  return { rows, get calls() { return calls; }, post: (requestId) => route.POST({ headers: new Headers({ origin: 'https://edubridge.test' }), nextUrl: { origin: 'https://edubridge.test' }, text: async () => JSON.stringify({ questionId, requestId, locale: 'uz' }) }) };
}
const requestIds = [3,4,5,6].map(n => `00000001-0000-4000-8000-00000000000${n}`);
test('practice authenticates, requires a solved question, replays requests and caps concurrent generations', async () => {
  const previousKey = process.env.GEMINI_API_KEY, previousRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.GEMINI_API_KEY = 'test-placeholder'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-placeholder';
  try {
    assert.equal((await harness({ signedIn: false }).post(requestIds[0])).status, 401);
    assert.equal((await harness({ status: 'open' }).post(requestIds[0])).status, 403);
    const h = harness();
    assert.equal((await h.post(requestIds[0])).status, 200);
    assert.equal((await h.post(requestIds[0])).status, 200);
    assert.equal(h.calls, 1);
    await Promise.all(requestIds.slice(1).map(id => h.post(id)));
    assert.equal(h.calls, 3); assert.equal(h.rows.size, 3);
    assert.equal((await h.post(requestIds[3])).status, 429);
    const failing = harness({ fail: true });
    assert.equal((await failing.post(requestIds[0])).status, 503);
    assert.equal([...failing.rows.values()][0].state, 'failed');
    assert.equal((await failing.post(requestIds[1])).status, 503);
    assert.equal(failing.calls, 2);
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previousKey;
    if (previousRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previousRole;
  }
});
