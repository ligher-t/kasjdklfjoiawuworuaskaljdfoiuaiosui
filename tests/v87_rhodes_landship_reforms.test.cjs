'use strict';
const path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {context}=require('./support/presentation-cases.cjs');
const {installEmploymentAppointmentFixture}=require('./support/employment-appointment-fixture.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
installEmploymentAppointmentFixture(ctx);
const run=source=>JSON.parse(vm.runInContext(`JSON.stringify((()=>{${source}})())`,ctx));
const entered=run(`
 born({seed:107701,by:1077,region:'クルビア'});
 S.year=1100;S.age=23;S.job=0;S.h=75;S.cash=50000;
 const apply=id=>id==='sr_rhodes_hiring_review'?applyEmploymentAppointmentFixture(id,28,'rhodes-staff',0,0):ap(EV.find(e=>e.id===id).c[0].o[0][2]);
 const dueYear=(event,state)=>{const period=scheduledFollowupDuePeriod(event,state);return period===null?null:Math.floor((period-1)/12);};
 apply('sr_rhodes_recruitment_contact');S.sn.sr_rhodes_recruitment_contact=S.year;
 const review=EV.find(e=>e.id==='sr_rhodes_hiring_review');
 const before=dueYear(review,S);
 S.year++;S.age++;
 const due=dueYear(review,S);
 apply('sr_rhodes_hiring_review');S.sn.sr_rhodes_hiring_review=S.year;
 S.year++;S.age++;apply('sr_rhodes_posting_review');
 const T=tags(S);
 return {before,due,aboard:isRhodesLandshipResident(S),flag:S.fl.rhodes_landship,
   base:S.residenceBase?.id,nation:[...T].find(x=>x.startsWith('国:')),
   origin:T.has('出身:クルビア'),exposure:oriAnnualChance(S),
   disaster:D(S).some(x=>x.c==='天災による死亡')};
`);
assert.equal(entered.before,null);assert.equal(entered.due,1101);
assert.equal(entered.aboard,true);assert.equal(entered.flag,1);
assert.equal(entered.base,'rhodes-landship');assert.equal(entered.nation,'国:ロドス本艦');
assert.equal(entered.origin,true);assert.equal(entered.exposure,0);assert.equal(entered.disaster,false);

const dispatch=run(`
 const originals=EV.slice(),previousRandom=DEBUG_RANDOM;
 const ground=EV.find(e=>e.id==='clinical_trial_screams_daily');
 const ship=EV.find(e=>e.id==='daily_rhodes_01');
 const family=EV.find(e=>e.id==='family_daily_small_care');
 const groundEligible=elig(ground,S,tags(S));
 const familyEligible=elig(family,S,tags(S));
 try {
   DEBUG_RANDOM=()=>.99;
   EV.splice(0,EV.length,ground);slot(.2);
   const groundFired=S.sn[ground.id]!=null;
   EV.splice(0,EV.length,ship);slot(.3);
   const shipFired=S.sn[ship.id]===S.year;
   EV.splice(0,EV.length,family);slot(.4);
   return {groundEligible,groundFired,shipFired,familyEligible,familyFired:S.sn[family.id]===S.year};
 } finally {EV.splice(0,EV.length,...originals);DEBUG_RANDOM=previousRandom;}
`);
assert.equal(dispatch.groundEligible,false);assert.equal(dispatch.groundFired,false);
assert.equal(dispatch.shipFired,true);assert.equal(dispatch.familyEligible,true);assert.equal(dispatch.familyFired,true);

const transfers=run(`
 const aboard=makeResumeSnapshot();
 S.year+=3;S.age+=3;
 ap(EV.find(e=>e.id==='sr_rhodes_posting_transfer').c[0].o[0][2]);
 const branch={aboard:isRhodesLandshipResident(S),flag:S.fl.rhodes_landship,
   base:S.residenceBase?.id??null,nation:[...tags(S)].find(x=>x.startsWith('国:')),
   exposure:oriAnnualChance(S),disaster:D(S).some(x=>x.c==='天災による死亡')};
 const branchSave=makeResumeSnapshot();
 born({seed:107702,region:'龍門'});
 if(!cont(branchSave))throw Error('branch snapshot failed to resume');
 branch.restoredAboard=isRhodesLandshipResident(S);branch.restoredFlag=S.fl.rhodes_landship;
 if(!cont(aboard))throw Error('landship snapshot failed to resume');
 const restoredAboard=isRhodesLandshipResident(S);
 const serviceJob=S.job;
 S.job=J.findIndex(j=>j.n.includes('外勤オペレーター'));
 const fieldRisk=oriAnnualChance(S);
 const fieldDeath=D(S).some(x=>x.c==='殉職（ロドス外勤作戦）');
 S.job=serviceJob;
 ap(EV.find(e=>e.id==='sr_rhodes_work_review').c[2].o[0][2]);
 const leftSave=makeResumeSnapshot();
 born({seed:107703,region:'龍門'});
 if(!cont(leftSave))throw Error('departed snapshot failed to resume');
 const T=tags(S),left={aboard:isRhodesLandshipResident(S),flag:S.fl.rhodes_landship,
   employed:S.fl.rhodes,base:S.residenceBase?.id??null,status:S.lifeRecord.affiliations.find(a=>a.id==='rhodes-staff').status,
   nation:[...T].find(x=>x.startsWith('国:')),exposure:oriAnnualChance(S),
   disaster:D(S).some(x=>x.c==='天災による死亡'),
   localDaily:elig(EV.find(e=>e.id==='clinical_trial_screams_daily'),S,T),
   shipDaily:elig(EV.find(e=>e.id==='daily_rhodes_01'),S,T)};
 return {branch,restoredAboard,fieldRisk,fieldDeath,left};
`);
assert.equal(transfers.restoredAboard,true);assert(transfers.fieldRisk>0&&transfers.fieldRisk<=.005);assert.equal(transfers.fieldDeath,true);
assert.equal(transfers.branch.aboard,false);assert.equal(transfers.branch.flag,0);
assert.equal(transfers.branch.base,null);assert.equal(transfers.branch.nation,'国:クルビア');
assert(transfers.branch.exposure>0);assert.equal(transfers.branch.disaster,true);
assert.equal(transfers.branch.restoredAboard,false);assert.equal(transfers.branch.restoredFlag,0);
assert.equal(transfers.left.aboard,false);assert.equal(transfers.left.flag,0);assert.equal(transfers.left.employed,0);
assert.equal(transfers.left.base,null);assert.equal(transfers.left.status,'left');assert.equal(transfers.left.nation,'国:クルビア');
assert(transfers.left.exposure>0);assert.equal(transfers.left.disaster,true);
assert.equal(transfers.left.localDaily,true);assert.equal(transfers.left.shipDaily,false);
console.log('PASS actual recruitment, landship/ground dispatch, family daily, posting transfer, departure and same-version resume boundaries');
