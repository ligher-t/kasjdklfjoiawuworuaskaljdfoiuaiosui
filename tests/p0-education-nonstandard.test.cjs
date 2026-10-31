'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const annual=require('./support/annual-cases.cjs');
const {ctx}=annual.context(path.resolve(__dirname,'..'));
annual.setup(ctx,{id:'education-nonstandard',seed:970006,region:'クルビア',age:20});
function scenarios(){
 const s=S;s.cash=30000000;s.job=24;s.k=40;socialModel(s).literacy=40;
 const before=educationExam(s,'university',1).allowed,
   event=EV.find(e=>e.id==='higher_ed');
 const direct=!!event?.show(s);
 TRACE_RESOLUTION={id:'education_return_path',label:'三年間の基礎準備'};
 educationApplyAction(s,'start-preparatory');TRACE_RESOLUTION=null;
 const bridging=educationLive(s) && s.educationPath.stage==='preparatory' && s.job===24;
 const noInstant=educationExam(s,'university',1).allowed;
 for(let i=1;i<=3;i++){s.age++;s.year++;educationAdvanceYear(s);}
 const equiv=s.educationPath.equivalency.includes('upper') &&
   s.educationPath.status==='completed';
 const after=educationExam(s,'university',1).allowed;
 const second=JSON.parse(JSON.stringify(s));
 second.educationPath=null;second.study=null;second.fl.sch=0;second.fl.uni=0;
 second.age=10;second.year=1087;
 second.res=REG.find(row=>row.n==='ウルサス');
 educationStart(second,'primary',1,'sch');
 second.inf=1;second.fl.dg=1;
 educationEnforceAccess(second);
 const confidential=educationLive(second);
 const site=activeFacility(second,'school');
 recordInfectionAwareness(second,{subject:'protagonist',audience:'school',certainty:'confirmed',
   source:'self-disclosure',consent:'voluntary',recipientRef:site.id});
 const access=educationBarrier(second,'primary');
 educationEnforceAccess(second);
 const disclosedOutcome=access.allowed ? educationLive(second) :
   second.educationPath.status==='withdrawn' &&
   !second.fl.sch && !second.educationRecord.awards.length;
 const ethnic=JSON.parse(JSON.stringify(second));
 ethnic.inf=0;ethnic.fl.dg=0;ethnic.r=RACE.find(r=>r.n==='サルカズ');
 const sarkazChance=educationBarrier(ethnic,'primary').chance;
 ethnic.res=REG.find(r=>r.n==='ヴィクトリア');
 ethnic.r=RACE.find(r=>r.n==='リーベリ');
 ethnic.culturalIdentity={affiliation:'ターラー系'};
 const taraChance=educationBarrier(ethnic,'primary').chance;
 const funding=JSON.parse(JSON.stringify(s));
 funding.age=23;funding.year=s.year+1;
 funding.res=REG.find(r=>r.n==='クルビア');
 funding.cash=0;funding.house.cash=0;
 educationStart(funding,'university',1,'higher_ed');
 funding.cash=0;funding.house.cash=0;
 funding.age++;funding.year++;
 educationAdvanceYear(funding);
 const pending=funding.educationDecision?.kind==='funding';
 educationApplyAction(funding,'funding-pause');
 const paused=funding.educationPath.status==='paused';
 funding.cash=2000000;
 const blockedConcurrentStudy=!educationExam(funding,'university',2).allowed;
 funding.job=24;
 funding.age++;funding.year++;
 educationAdvanceYear(funding);
 const offeredResume=funding.educationDecision?.kind==='resume';
 educationApplyAction(funding,'funding-resume');
 const resumedNoFulltimeWork=educationLive(funding) && funding.job===0 &&
   !funding.study.suspended && funding.educationAnnualFee?.year===funding.year;
 const yan=JSON.parse(JSON.stringify(s));
 yan.by=1077;yan.age=14;yan.year=1091;
 yan.res=REG.find(r=>r.n==='炎国');
 yan.educationPath={version:1,status:'outside',completed:[],equivalency:[],history:[]};
 yan.fl.sch=0;yan.fl.uni=0;yan.study=null;yan.job=0;
 yan.k=95;yan.cash=30000000;socialModel(yan).literacy=95;
 const yanNoDegree=!educationExam(yan,'university',1).allowed &&
   !EV.find(e=>e.id==='higher_ed').show(yan);
 const youth=EV.find(e=>e.id==='life_youth_apprenticeship');
 const yanNoSchoolChoice=!youth.c[0].show(yan) &&
   youth.c[1].l.includes('工房');
 const grant=JSON.parse(JSON.stringify(s));
 grant.age=23;grant.year=s.year+1;
 grant.res=REG.find(r=>r.n==='クルビア');
 educationStart(grant,'university',1,'higher_ed');
 grant.age++;grant.year++;grant.cash=20000;grant.house.cash=30000;
 educationAdvanceYear(grant);
 const grantPending=grant.educationDecision?.kind==='funding';
 const grantFee=educationFunds(grant,'university',1);
 educationApplyAction(grant,'funding-grant');
 const grantPaid=grantPending&&educationLive(grant)&&
   grant.educationDecision===null&&grant.educationPath.yearsCompleted===1&&
   grant.educationAnnualFee?.amount===grantFee&&
   grant.educationAnnualFee?.paidByPersonal===20000&&
   grant.educationAnnualFee?.paidByHousehold===30000&&
   grant.educationAnnualFee?.aidAmount===grantFee-50000;
 return{yanNoDegree,yanNoSchoolChoice,grantPaid,
   before,direct,bridging,noInstant,equiv,after,confidential,disclosedOutcome,
   sarkazChance,taraChance,pending,paused,blockedConcurrentStudy,offeredResume,resumedNoFulltimeWork,
   audit:auditLifeState(s)};
}
const x=vm.runInContext('('+scenarios.toString()+')()',ctx,{timeout:18000});
assert.equal(x.before,false,'no school degree means no university entry');
assert.equal(x.direct,false,'the university offer is not a bypass for unschooled adults');
assert.equal(x.bridging,true,'multiyear adult study may coexist with ordinary employment');
assert.equal(x.noInstant,false,'night school or one preparatory year is not university eligibility');
assert.equal(x.equiv,true,'only completed preparation plus measured competence awards equivalency');
assert.equal(x.after,true,'an actual equivalency enables future entrance examination');
assert.equal(x.confidential,true,'a medical diagnosis alone does not notify the school');
assert.equal(x.disclosedOutcome,true,'a documented disclosure follows the individual site decision, not a national law');
assert(x.sarkazChance>=0.16&&x.sarkazChance<=0.86,'Sarkaz access is site- and era-specific, not a blanket ban');
assert(x.taraChance>=0.24&&x.taraChance<=0.85,'Victoria Tara discrimination is scoped to the recorded identity and site');
assert.equal(x.pending,true,'funding cannot be ignored in the next year');
assert.equal(x.paused,true,'institutions offering leave can suspend rather than fake graduation');
assert.equal(x.blockedConcurrentStudy,true,'paused students cannot silently enter another full-time program');
assert.equal(x.offeredResume,true,'next year a paused student receives the resume decision');
assert.equal(x.resumedNoFulltimeWork,true,'resuming a full-time course ends a regular job and records fees');
assert.equal(x.yanNoDegree,true,'1077 Yan unschooled life cannot earn university eligibility from high learning scores alone');
assert.equal(x.yanNoSchoolChoice,true,'an unschooled 14-year-old cannot choose to buy school supplies for an imaginary course');
assert.equal(x.grantPaid,true,'tuition support has a shortfall ledger without minting wages or household money');
assert.deepEqual(Array.from(x.audit),[],'unusual adult education pathway validates');
console.log('PASS second-chance schooling, institutional discrimination, funding leave');
