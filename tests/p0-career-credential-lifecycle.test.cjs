'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const annual=require('./support/annual-cases.cjs');
const {ctx}=annual.context(path.resolve(__dirname,'..'));
annual.setup(ctx,{id:'p0-career-credential-lifecycle',seed:9261029,region:'クルビア',age:20});
const result=vm.runInContext(`(()=>{
  const s=S;
  s.ep=150;s.k=90;s.ar=90;
  socialModel(s).literacy=90;
  s.fl.sch=0;
  const highScore=careerOpeningAssessment(s,{role:'technical'});
  const clinical=careerOpeningAssessment(s,{role:'clinical'});
  const research=careerOpeningAssessment(s,{role:'research-lead'});
  const teacher=careerOpeningAssessment(s,{role:'teacher'});
  s.cash=30000000;
  s.educationPath={version:1,status:'completed',completed:['primary','lower','upper'],history:[]};
  educationStart(s,'university',1,'higher_ed');
  const enrollment=JSON.parse(JSON.stringify(s.educationRecord));
  const noAward=educationCredential(s,'university');
  for(let n=0;n<4;n++){
    s.age++;s.year++;educationAdvanceYear(s);
  }
  const graduates=JSON.parse(JSON.stringify(s.educationRecord));
  const ready=careerOpeningAssessment(s,{role:'technical'});
  const readyResearch=careerOpeningAssessment(s,{role:'research-lead'});
  const before=JSON.stringify({record:s.educationRecord,rng:s.rngState,skills:s.lifeRecord?.skills});
  careerOpeningAssessment(s,{role:'technical'});
  careerOpeningAssessment(s,{role:'technical'});
  const pure=before===JSON.stringify({record:s.educationRecord,rng:s.rngState,skills:s.lifeRecord?.skills});
  DEBUG_RANDOM=()=>0.47;
  const baseJob=pickStarterJob(s);
  s.inf=1;s.fl.dg=1;
  const diagnosedJob=pickStarterJob(s);
  DEBUG_RANDOM=null;
  s.inf=0;s.fl.dg=0;
  const undocumented=careerOpeningAssessment(s,{role:'general',policy:{
    region:'クルビア',role:'general',sourceRef:'',certainty:'unverified'
  }});
  const documented=careerOpeningAssessment(s,{role:'general',policy:{
    region:'クルビア',role:'general',sourceRef:'SRC_EXPLICIT_EMPLOYMENT_RESTRICTION',
    certainty:'verified',fromYear:1000,toYear:1200
  }});
  const otherRegion=careerOpeningAssessment(s,{role:'general',policy:{
    region:'ウルサス',role:'general',sourceRef:'SRC_EXPLICIT_EMPLOYMENT_RESTRICTION',
    certainty:'verified'
  }});
  const previousWork = {
    inf:s.inf, diagnosis:s.fl.dg, disclosureFlag:s.fl.infection_work_disclosed,
    job:s.job, workContract:s.workContract, infectionWorkplace:s.infectionWorkplace,
    infectionAwareness:s.infectionAwareness, equityLedger:s.equityLedger
  };
  s.inf=1;s.fl.dg=1;s.fl.infection_work_disclosed=1;s.job=7;
  s.workContract={siteId:'employer-fixture-1',jobId:7,status:'active'};
  s.infectionWorkplace={siteId:'employer-fixture-1',disclosedJobId:7,status:'awaiting-review'};
  s.infectionAwareness={version:1,entries:[{
    subject:'protagonist',audience:'employer',certainty:'confirmed',
    subjectMatch:'confirmed',region:s.res.n,recipientRef:'employer-fixture-1'
  }]};
  s.equityLedger={version:1,episodes:[{
    domain:'work',status:'active',siteId:'employer-fixture-1',jobId:7
  }],history:[]};
  const knownHere=careerOpeningAssessment(s,{role:'technical',worksiteId:'employer-fixture-1'});
  const unknownElsewhere=careerOpeningAssessment(s,{
    role:'technical',worksiteId:'employer-fixture-2',employerKnowsDiagnosis:true
  });
  const unknownWithoutSite=careerOpeningAssessment(s,{role:'technical'});
  s.inf=previousWork.inf;s.fl.dg=previousWork.diagnosis;s.job=previousWork.job;
  s.workContract=previousWork.workContract;s.infectionWorkplace=previousWork.infectionWorkplace;
  s.infectionAwareness=previousWork.infectionAwareness;s.equityLedger=previousWork.equityLedger;
  if(previousWork.disclosureFlag==null)delete s.fl.infection_work_disclosed;
  else s.fl.infection_work_disclosed=previousWork.disclosureFlag;
  const firstSchool=(()=>{const t={year:s.year,fl:{},educationRecord:{version:1,enrollments:[],awards:[]}};
    recordEducationTransition(t,'general-school','start','sch');return t.educationRecord;})();
  const dropout=(()=>{const t={year:s.year,fl:{},res:s.res,educationRecord:{version:1,enrollments:[],awards:[]}};
    recordEducationTransition(t,'university','start','higher_ed');
    recordEducationTransition(t,'university','stop','uni_fee');return t.educationRecord;})();
  const noGhostGraduation=(()=>{const t={year:s.year,fl:{},res:s.res,educationRecord:{version:1,enrollments:[],awards:[]}};
    try{recordEducationTransition(t,'university','finish','uni_final_fee');return false;}
    catch(e){return /在籍記録/.test(e.message);}})();
  const apprentice=careerOpeningAssessment({
    ...s,fl:{...s.fl,uni:0,voc:0,arts_grad:0},
    lifeRecord:{skills:[{id:'repair-workshop',level:18}]}
  },{role:'technical'});
  return {highScore,clinical,research,teacher,enrollment,noAward,graduates,
    ready,readyResearch,pure,baseJob,diagnosedJob,undocumented,documented,otherRegion,firstSchool,
    knownHere,unknownElsewhere,unknownWithoutSite,dropout,noGhostGraduation,apprentice,
    standing:educationStandingLabel(s),audit:auditLifeState(s)};
})()`,ctx,{timeout:15000});
assert.equal(result.highScore.canBeAssigned,false,'learning points do not award a technical credential');
assert.equal(result.clinical.canBeAssigned,false,'a clinical role is not granted by education points');
assert.equal(result.research.canBeAssigned,false,'a research lead needs a completed course');
assert.equal(result.teacher.canBeAssigned,false,'a score-only applicant is not a qualified teacher');
assert.equal(result.enrollment.enrollments[0].status,'enrolled');
assert.equal(result.enrollment.awards.length,0,'enrollment never issues the course award');
assert.equal(result.noAward,false);
assert.equal(result.graduates.enrollments[0].status,'completed');
assert.equal(result.graduates.awards.length,1);
assert.equal(result.graduates.awards[0].sourceEventId,'annual-progression');
assert.equal(result.ready.canBeAssigned,true,'an earned credential opens technical work');
assert.equal(result.readyResearch.canBeAssigned,true,'graduation and high knowledge permit research applications');
assert.equal(result.pure,true,'qualification inquiries never alter the state or RNG');
assert.equal(result.baseJob,result.diagnosedJob,'diagnosis alone cannot erase a generic starter job pool');
assert.equal(result.undocumented.canApply,true,'unverified policy cannot become a national ban');
assert.equal(result.otherRegion.canApply,true,'another region\'s rule does not apply here');
assert.equal(result.documented.canApply,false,'a specific sourced, current opening restriction can be represented');
assert.equal(result.firstSchool.awards.length,0,'first enrollment does not imply elementary graduation');
assert.equal(result.dropout.enrollments[0].status,'interrupted','withdrawal has an explicit outcome');
assert.equal(result.dropout.awards.length,0,'withdrawal preserves skills without inventing a diploma');
assert.equal(result.noGhostGraduation,true,'an unrecorded course cannot issue an award');
assert.equal(result.apprentice.canApply,true,'real craft experience can open technical jobs without university');
assert.equal(result.knownHere.employerKnowsDiagnosis,true,'a disclosed diagnosis is known only at the recorded workplace');
assert.equal(result.knownHere.discriminationRecorded,true,'a confirmed active same-site incident is observed harm');
assert.equal(result.unknownElsewhere.employerKnowsDiagnosis,false,'a new employer cannot inherit diagnosis knowledge from another');
assert.equal(result.unknownElsewhere.discriminationRecorded,false,'a new employer cannot inherit another worksite incident');
assert.equal(result.unknownElsewhere.canApply,true,'a recorded diagnosis does not bar a qualified applicant');
assert.equal(result.unknownWithoutSite.employerKnowsDiagnosis,false,'missing site identity cannot imply awareness');
assert.match(result.standing,/大学課程修了/);
assert.deepEqual(Array.from(result.audit),[],'current educational history is internally consistent');
console.log('PASS P0 credential evidence, current hiring eligibility, infection neutrality, and audited awards');
