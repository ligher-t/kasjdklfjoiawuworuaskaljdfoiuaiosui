'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const w10=JSON.parse(fs.readFileSync(path.join(root,
  'docs/employment/W10_INTEGRATION_ACCEPTANCE_107_CASES_20261104.json'),'utf8'));
const v3=JSON.parse(fs.readFileSync(path.join(root,
  'docs/employment/V3_EMPLOYMENT_ACCESS_UX_ACCEPTANCE_20261105.json'),'utf8'));
const workflow=fs.readFileSync(path.join(root,'.github/workflows/p0-education-work.yml'),'utf8');
assert.equal(w10.count,107);
assert.equal(w10.cases.length,107);
assert.equal(v3.baseCaseCount,107);
assert.equal(v3.additionalCaseCount,28);
assert.equal(v3.combinedNominalCount,135);
assert.equal(v3.cases.length,28);
const all=[...w10.cases,...v3.cases],ids=all.map(row=>row.id);
assert.equal(new Set(ids).size,135,'the combined acceptance case identifiers must be unique');
const suites=new Set();
for(const row of all){
  assert(['mapped-for-ci','accepted'].includes(row.status),row.id+' has no CI disposition');
  assert(Array.isArray(row.ciEvidence)&&row.ciEvidence.length>0,row.id+' has no test evidence');
  assert.equal(new Set(row.ciEvidence).size,row.ciEvidence.length,row.id+' repeats an evidence suite');
  for(const name of row.ciEvidence){
    assert(fs.existsSync(path.join(root,'tests',name)),row.id+' references missing test '+name);
    assert(workflow.includes(name),row.id+' references a test absent from the employment Actions job: '+name);
    suites.add(name);
  }
}
for(const id of ['S11','T12','L12']){
  const row=w10.cases.find(item=>item.id===id);
  assert(!/legacy|old[- ]save|旧セーブ|移行/i.test(row.title+' '+row.fixture+' '+row.expected),
    id+' must cover same-version restore, not old-save migration');
}
const v324=v3.cases.find(row=>row.id==='V3-24');
assert(!/old[- ]save|旧セーブ|legacy[- ]format/i.test(v324.title+' '+v324.fixture+' '+v324.expected),
  'V3-24 must cover same-version restore, not old-format compatibility');
console.log(`PASS employment acceptance traceability: W10 ${w10.cases.length} + V3 ${v3.cases.length} = ${all.length} cases mapped to ${suites.size} Actions suites; same-version restore scope`);
