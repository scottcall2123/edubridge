/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness loads server TypeScript without a test-framework dependency. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Module=require('node:module');
const ts=require('typescript');
const original=Module._load;
Module._load=function(name,...args){if(name==='server-only')return {};return original.call(this,name,...args);};
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const {dailyProgress,streakAfter,tashkentDay,dayStart}=require('../lib/points.ts');
const base={points:20,streak_days:7,last_streak_date:'2026-11-20',last_visit_date:null};
test('Tashkent day changes at 19:00 UTC',()=>{assert.equal(tashkentDay(new Date('2026-11-20T18:59:59Z')),'2026-11-20');assert.equal(tashkentDay(new Date('2026-11-20T19:00:00Z')),'2026-11-21');assert.equal(dayStart('2026-11-21'),'2026-11-20T19:00:00.000Z');});
test('daily visit awards once without extending solve streak',()=>{const a=dailyProgress(base,'2026-11-21');assert.equal(a.next.points,25);assert.equal(a.next.streak_days,7);assert.equal(a.next.last_streak_date,'2026-11-20');assert.deepEqual(dailyProgress(a.next,'2026-11-21').events,[]);});
test('third missed day loses five and resets streak; loss caps at 50; points never negative',()=>{assert.equal(dailyProgress(base,'2026-11-22').events.length,1);const a=dailyProgress(base,'2026-11-23');assert.equal(a.next.points,20);assert.equal(a.next.streak_days,0);assert.equal(a.events[1].points,-5);const b=dailyProgress(base,'2027-01-01');assert.equal(b.events[1].points,-50);assert.equal(b.next.points,0);});
test('solving twice on one day does not extend streak; yesterday extends; gap starts at one',()=>{const a=streakAfter(base,'2026-11-21');assert.equal(a.streak_days,8);assert.deepEqual(streakAfter(a,'2026-11-21'),a);assert.equal(streakAfter(base,'2026-11-23').streak_days,1);assert.equal(streakAfter({...base,last_streak_date:null},'2026-11-21').streak_days,1);});
