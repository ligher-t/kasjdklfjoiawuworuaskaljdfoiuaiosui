'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {context,diagnostics}=require('./support/presentation-cases.cjs'),root=path.resolve(__dirname,'..');
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/audit-diagnostics-v87.json'),'utf8'));
for(const scenario of fixture.cases){const actual=diagnostics(context(root),scenario);assert.deepEqual(actual,scenario.expected,scenario.id+' exact problems, duplicates and ordering');if(!scenario.id.startsWith('clean-'))assert(actual.length>0,scenario.id+' directly detects corrupted input');}
console.log(`PASS ${fixture.cases.length} clean/corrupted catalog and life-state diagnostic cases`);

const vm=require('node:vm'),runtimeEnv=context(root);
assert.deepEqual(Array.from(vm.runInContext('validate()',runtimeEnv.ctx)),[],
  'current catalog has no unknown handled effects, missing reasons or school-flag ledger drift');
const malformed=vm.runInContext(`(()=>{const e=EV.find(e=>e.id==='sch'),old=e.c[0].o[0][2];
 e.c[0].o[0][2]={...old,loanPayment:'invalid',unknownAuditProbe:1};
 const problems=validate();e.c[0].o[0][2]=old;return problems;})()`,runtimeEnv.ctx);
assert(malformed.some(x=>x.includes('loanPayment') && x.includes('オブジェクト')));
assert(malformed.some(x=>x.includes('unknownAuditProbe')),'genuine unknown effects still fail');
const invalidConditions=vm.runInContext(`(()=>{
 const event=EV.find(e=>e.id==='sch'),choice=event.c[0];
 const oldShow=event.show,oldEn=choice.en;
 try {
  event.when='就学中';event.show={or:[{need:['在学中']},{affordable:80000}]};
  choice.en={affordable:80000};choice.sh=()=>false;
  return validate();
 } finally {
  delete event.when;delete choice.sh;event.show=oldShow;choice.en=oldEn;
 }
})()`,runtimeEnv.ctx);
assert(invalidConditions.some(x=>x.includes('イベントキー「when」')),
  'top-level when cannot silently bypass event eligibility');
assert(invalidConditions.some(x=>x.includes('条件キー「affordable」')),
  'unhandled affordability fails even inside event.show/or');
assert(invalidConditions.some(x=>x.includes('タグ「在学中」')),
  'event.show tags are checked against the actual runtime vocabulary');
assert(invalidConditions.some(x=>x.includes('選択肢キー「sh」')),
  'misspelled choice visibility cannot silently show an unavailable action');
const validConditions=vm.runInContext(`(()=>{
 const event=EV.find(e=>e.id==='sch'),oldShow=event.show;
 try {event.show={or:[{need:['就学中']},{ge:{age:18}}]};return validate();}
 finally {event.show=oldShow;}
})()`,runtimeEnv.ctx);
assert.deepEqual(Array.from(validConditions),[],
  'supported nested conditions and the unchanged catalog remain valid');
const missingOwnedEligibility=vm.runInContext(`(()=>{
 const event=EV.find(row=>row.lifeSystemFamily),oldShow=event.show;
 try {event.show=null;return validate();}
 finally {event.show=oldShow;}
})()`,runtimeEnv.ctx);
assert(Array.from(missingOwnedEligibility).some(problem=>problem.includes('状態所有者の動的適格性判定')),
  'state-owned life-system events cannot lose their dynamic eligibility gate');
const {revision,canonicalSource}=require('../tools/update-version.cjs');
assert.equal(canonicalSource('a\r\nb\r\n'),canonicalSource('a\nb\n'));
assert(fs.readFileSync(path.join(root,'js/version.js'),'utf8').includes(revision(root)),
  'generated revision matches canonical runtime, not platform checkout line endings');
assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(normalizedDeathCauseCounts({"天災":2,"天災による死亡":3,"鉱石病":1}))',runtimeEnv.ctx)),{'天災':5,'鉱石病':1});
console.log('PASS actual catalog schema, malformed handled effects, canonical revision and cause normalization');
