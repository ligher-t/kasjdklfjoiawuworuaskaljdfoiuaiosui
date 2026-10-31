'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const annual=require('./support/annual-cases.cjs');
const {ctx}=annual.context(path.resolve(__dirname,'..'));
annual.setup(ctx,{id:'p0-school-regional-access',seed:291029,region:'クルビア',age:13});
const rows=vm.runInContext(`(()=>{
  const s=S, names=REG.map(x=>x.n);
  const profiles=Object.keys(EDUCATION_REGION_PROFILES);
  s.r=RACE.find(x=>x.n==='リーベリ');
  s.inf=1;s.fl.dg=1;
  const infection=REG.map(r=>{s.res=r;return {
    region:r.n,policy:educationRegionProfile(s).infection,
    admission:educationBarrier(s,'university').allowed,
    source:educationRegionProfile(s).source
  }});
  s.res=REG.find(r=>r.n==='ウルサス');
  const school=activeFacility(s,'school'),
    universityBeforeDisclosure=educationBarrier(s,'university').chance,
    primaryBeforeDisclosure=educationBarrier(s,'primary').chance;
  recordInfectionAwareness(s,{subject:'protagonist',audience:'school',certainty:'confirmed',
    source:'self-disclosure',consent:'voluntary',recipientRef:'current-school'});
  const schoolAware=educationSchoolKnowsInfection(s,'primary'),
    universityAware=educationSchoolKnowsInfection(s,'university'),
    recordedRecipient=infectionAwarenessEntries(s).at(-1)?.recipientRef,
    knownPrimary=educationBarrier(s,'primary').chance,
    knownAdmission=educationBarrier(s,'university').chance;
  s.inf=0;s.fl.dg=0;s.res=REG.find(r=>r.n==='ヴィクトリア');
  s.r=RACE.find(x=>x.n==='サルカズ');
  const sarkaz=educationBarrier(s,'university').chance;
  s.res=REG.find(r=>r.n==='カズデル');
  const kazdel=educationBarrier(s,'university').chance;
  s.res=REG.find(r=>r.n==='ヴィクトリア');s.r=RACE.find(x=>x.n==='リーベリ');
  s.culturalIdentity={affiliation:'ターラー系'};
  const tara=educationBarrier(s,'university').chance;
  s.culturalIdentity={affiliation:null};
  const victoriaOther=educationBarrier(s,'university').chance;
  s.res=REG.find(r=>r.n==='クルビア');
  const facility=activeFacility(s,'school'),previous=facility.status;
  facility.status='limited';
  const blockedPrimary=educationCanEnter(s,'primary').allowed,
        blockedLower=educationBarrier(s,'lower').allowed,
        universityNotInferredFromPrimarySite=educationBarrier(s,'university').allowed;
  facility.status=previous;
  s.res=REG.find(r=>r.n==='サーミ');
  s.local.kind='遊牧氏族の生活圏';
  const tribal=educationBarrier(s,'primary');
  const apprenticeship=educationExam(s,'university',1).allowed;
  return {names,profiles,infection,sarkaz,kazdel,tara,victoriaOther,schoolAware,knownAdmission,
    blockedPrimary,blockedLower,universityNotInferredFromPrimarySite,
    tribal,apprenticeship,universityBeforeDisclosure,primaryBeforeDisclosure,
    universityAware,recordedRecipient,knownPrimary,schoolId:school.id};
})()`,ctx,{timeout:18000});
assert.deepEqual(Array.from(rows.profiles).sort(),Array.from(rows.names).sort(),
  'every playable region must declare an explicit school-simulation profile');
for(const row of rows.infection){
  assert(row.source && row.source !== 'unverified-region-fallback','all regions must disclose model provenance');
  assert.equal(row.admission,true,
    `${row.region}: an unreported medical diagnosis cannot automatically prove school awareness`);
}
assert.equal(rows.schoolAware,true,'the current school can be confirmed informed');
assert.equal(rows.universityAware,false,'school awareness does not transfer to a different education stage');
assert.equal(rows.recordedRecipient,rows.schoolId,'the current-school recipient resolves to its exact facility');
assert(rows.knownPrimary<rows.primaryBeforeDisclosure,'confirmed awareness affects only the receiving school');
assert.equal(rows.knownAdmission,rows.universityBeforeDisclosure,'a local school disclosure does not change university admission');
assert(rows.sarkaz>=0.16&&rows.sarkaz<=0.86,'Sarkaz opportunities vary by facility and era rather than an almost-universal national ban');
assert(rows.kazdel>rows.sarkaz,'Kazdel Sarkaz admission must not inherit the foreign ethnic barrier');
assert(rows.tara>=0.24&&rows.tara<=0.85,'Victoria Tara opportunities vary by facility and era');
assert(rows.victoriaOther>rows.tara,'the same policy must not punish unrelated Victoria residents');
assert.equal(rows.blockedPrimary,false,'a limited local primary school cannot admit');
assert.equal(rows.blockedLower,false,'a limited local school cannot silently advance children');
assert.equal(rows.universityNotInferredFromPrimarySite,true,'a limited neighborhood primary school is not an invented university closure');
assert.equal(rows.tribal.allowed,false,'a recorded Sami clan without a fixed school has another learning route');
assert.equal(rows.apprenticeship,false,'absence of a completed secondary course cannot become university eligibility');
console.log('PASS 19 scoped school profiles, infection admissions, Sarkaz and Tara, campus and Sami locality');
