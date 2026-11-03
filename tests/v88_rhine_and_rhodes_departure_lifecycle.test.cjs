'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=source=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx,{timeout:30000}));

for(let i=0;i<2;i++){
  ctx.BRANCH=i;
  const result=inspect(`
    born({seed:20261131+BRANCH,by:1064,region:'クルビア'});
    S.year=1098;S.age=34;S.job=39;
    ap({lifeAffiliation:{id:'rhine-lab',title:'ライン生命医科学研究所',
        kind:'employer',action:'join',role:'専任研究員'},
        lifeGoal:{id:'rhine-research',
          title:'ライン生命で最先端科学の真理を開拓する',action:'start'}});
    S.fl.rhine_whistleblower=1;
    const event=EV.find(e=>e.id==='sr_rhine_rhodes_asylum'),
      ethics=EV.find(e=>e.id==='sr_rhine_diabolic_ethical_crossroad');
    const before=elig(event,S,tags(S));
    ap(event.c[BRANCH].o[0][2]);
    const aff=S.lifeRecord.affiliations.find(a=>a.id==='rhine-lab'),
      goal=S.lifeRecord.goals.find(g=>g.id==='rhine-research'),
      staff=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-staff'),
      rhodesGoal=S.lifeRecord.goals.find(g=>g.id==='rhodes-work');
    const after=elig(event,S,tags(S)),
      staffStatus=staff?.status||null,
      rhodesGoalStatus=rhodesGoal?.status||null,
      stateIssues=auditLifeState(S);
    S.sn[event.id]=S.year;
    S.job=39;
    ap({lifeAffiliation:{id:'rhine-lab',action:'return'}});
    const secondTry=elig(event,S,tags(S));
    return {before,after,secondTry,asylumOnce:event.once,ethicsOnce:ethics.once,
      aff:aff.status,goal:goal.status,goalAction:goal.history.at(-1).action,
      goalTitle:goal.title,staff:staffStatus,
      rhodesGoal:rhodesGoalStatus,
      whistleblower:S.fl.rhine_whistleblower,issues:stateIssues};
  `);
  assert.equal(result.before,true,'current whistleblower has an asylum option');
  assert.equal(result.after,false,'the prior employer must not receive another asylum event');
  assert.equal(result.secondTry,false,'once prevents repetition even after a return');
  assert.equal(result.asylumOnce,true);
  assert.equal(result.ethicsOnce,true);
  assert.equal(result.goal,'abandoned');
  assert.equal(result.goalAction,'abandon');
  assert.equal(result.goalTitle,'ライン生命で最先端科学の真理を開拓する');
  assert.equal(result.staff,i===0?'active':null);
  assert.equal(result.rhodesGoal,i===0?'active':null,
    'successful transfer must start Rhodes employment goal, while pharmacy work does not');
  assert.equal(result.whistleblower,1,'the historical whistleblower flag survives');
  assert.deepEqual(result.issues,[]);
}
const research=inspect(`
 born({seed:20261141,by:1064,region:'クルビア'});
 S.year=1102;S.age=38;S.job=29;
 ap({lifeAffiliation:{id:'rhodes-staff',title:'ロドス・アイランド',
     kind:'employer',action:'join',role:'医療補助'},
     lifeGoal:{id:'rhodes-work',title:'ロドスで担当する仕事を無理なく続ける',action:'start'}});
 ap({lifeAffiliation:{id:'rhodes-research',title:'ロドスの鉱石病経過研究',
     kind:'project',action:'join'},
     lifeGoal:{id:'oripathy-research',title:'病状を記録する研究を続ける',action:'start'}});
 ap({lifeAffiliation:{id:'rhodes-staff',action:'suspend'},
     lifeGoal:{id:'rhodes-work',action:'pause'}});
 const event=EV.find(e=>e.id==='life_rhodes_research_stall');
 ap(event.c[3].o[0][2]);
 const status=id=>S.lifeRecord.affiliations.find(a=>a.id===id)?.status,
   goal=id=>S.lifeRecord.goals.find(g=>g.id===id);
 return {research:status('rhodes-research'),staff:status('rhodes-staff'),
   medicalGoal:goal('oripathy-research').status,staffGoal:goal('rhodes-work').status,
   staffAction:goal('rhodes-work').history.at(-1).action,
   job:S.job,issues:auditLifeState(S)};
`);
assert.deepEqual([research.research,research.staff],['left','left']);
assert.deepEqual([research.medicalGoal,research.staffGoal],['abandoned','abandoned']);
assert.equal(research.staffAction,'abandon');
assert.equal(research.job,0);
assert.deepEqual(research.issues,[]);
const arena=inspect(`
 born({seed:20261142,by:1063,region:'カジミエーシュ'});
 S.year=1101;S.age=38;S.job=32;
 ap({lifeAffiliation:{id:'kazimierz-arena-staff',title:'競技会場の運営職',kind:'employer',
     action:'join',role:'施設運営・整備'},
     lifeGoal:{id:'kazimierz-arena-work',title:'会場の仕事で生活を立てる',action:'start'}});
 const e=EV.find(x=>x.id==='sr_kazimierz_arena_shift');
 const eligibleBefore=elig(e,S,tags(S));
 ap(e.c[2].o[0][2]);
 const goal=S.lifeRecord.goals.find(g=>g.id==='kazimierz-arena-work');
 return {eligibleBefore,eligibleAfter:elig(e,S,tags(S)),
   affiliation:S.lifeRecord.affiliations.find(a=>a.id==='kazimierz-arena-staff').status,
   goal:goal.status,goalAction:goal.history.at(-1).action,job:S.job,
   issues:auditLifeState(S)};
`);
assert.equal(arena.eligibleBefore,true);
assert.equal(arena.eligibleAfter,false);
assert.equal(arena.affiliation,'left');
assert.equal(arena.goal,'abandoned');
assert.equal(arena.goalAction,'abandon');
assert.equal(arena.job,0);
assert.deepEqual(arena.issues,[]);

// Historical company events belong to actual staff during their documented
// 1099 months, not just a detached job number in any year.
const yearBounds=inspect(`
  born({seed:20261183,by:1068,region:'クルビア'});
  S.year=1099;S.age=31;S.job=39;S.k=100;
  const base=EV.find(e=>e.id==='sr_rhine_359_transmitter_consent'),
    horizon=EV.find(e=>e.id==='sr_rhine_lone_trail_sky_horizon'),
    promotion=EV.find(e=>e.id==='sr_rhine_promotion_chief'),
    patent=EV.find(e=>e.id==='sr_rhine_patent_breakthrough');
  const phantom={
    base:base.show(S),horizon:horizon.show(S),
    promotion:promotion.show(S),patent:patent.show(S)
  };
  S.job=0;
  ap(EV.find(e=>e.id==='sr_rhine_recruitment_exam').c[0].o[0][2]);
  ap(EV.find(e=>e.id==='sr_rhine_section_assignment').c[0].o[0][2]);
  const collect=(y,m)=>{
    S.year=y;S.mo=m;S.age=y-1068;
    return {base:elig(base,S,tags(S)),horizon:elig(horizon,S,tags(S))};
  };
  const oct1098=collect(1098,10),
    sep1099=collect(1099,9),
    oct1099=collect(1099,10),
    nov1099=collect(1099,11),
    dec1099=collect(1099,12),
    year1100=collect(1100,10);
  S.year=1099;S.age=31;S.mo=11;
  ap(horizon.c[0].o[0][2]);
  S.sn[horizon.id]=S.year;
  const again=elig(horizon,S,tags(S));
  return {phantom,oct1098,sep1099,oct1099,nov1099,dec1099,year1100,
    once:[base.once,horizon.once],again};
`);
assert.deepEqual(yearBounds.phantom,{
  base:false,horizon:false,promotion:false,patent:false
},'a former or unrecorded researcher cannot perform Rhine-specific events');
assert.deepEqual(yearBounds.oct1098,{base:false,horizon:false},
  'the 359 Site incident is not a 1098 event');
assert.deepEqual(yearBounds.sep1099,{base:false,horizon:false});
assert.deepEqual(yearBounds.oct1099,{base:true,horizon:false});
assert.deepEqual(yearBounds.nov1099,{base:false,horizon:true});
assert.deepEqual(yearBounds.dec1099,{base:false,horizon:false});
assert.deepEqual(yearBounds.year1100,{base:false,horizon:false});
assert.deepEqual(yearBounds.once,[true,true]);
assert.equal(yearBounds.again,false,'a historic sky-breaking event cannot repeat');

const postRhine=inspect(`
  born({seed:20261184,by:1068,region:'クルビア'});
  S.year=1099;S.age=31;S.mo=11;S.job=0;S.k=100;
  ap(EV.find(e=>e.id==='sr_rhine_recruitment_exam').c[0].o[0][2]);
  ap(EV.find(e=>e.id==='sr_rhine_section_assignment').c[0].o[0][2]);
  const horizon=EV.find(e=>e.id==='sr_rhine_lone_trail_sky_horizon'),
    review=EV.find(e=>e.id==='sr_rhine_post_lone_trail_career_review'),
    livelihood=EV.find(e=>e.id==='sr_rhine_after_departure_livelihood'),
    patent=EV.find(e=>e.id==='sr_rhine_patent_breakthrough'),
    former=S.lifeRecord.affiliations.find(a=>a.id==='rhine-lab'),
    oldGoal=S.lifeRecord.goals.find(g=>g.id==='rhine-research');
  const withoutHistory=review.show(S);
  ap(horizon.c[0].o[0][2]);
  S.sn[horizon.id]=S.year;
  S.eventOutcomes ||={};
  S.eventOutcomes[horizon.id]={year:S.year,choiceIndex:0,outcomeIndex:0};
  S.year=1100;S.age=32;
  const before={eligible:elig(review,S,tags(S)),
    hasNewGoal:S.lifeRecord.goals.some(g=>g.id==='rhine-after-departure-livelihood')};
  ap(review.c[1].o[0][2]);
  S.sn[review.id]=S.year;
  S.eventOutcomes[review.id]={year:S.year,choiceIndex:1,outcomeIndex:0};
  const newGoal=S.lifeRecord.goals.find(g=>g.id==='rhine-after-departure-livelihood');
  const left={job:S.job,former:former.status,
    ended:former.episodes.at(-1)?.endedYear,
    oldGoal:oldGoal.status,newGoal:newGoal?.status,
    researchEvent:patent.show(S),
    review:review.show(S),
    followupEligible:elig(livelihood,S,tags(S)),
    issues:auditLifeState(S)};
  S.year=1102;S.age=34;
  const unemployed={
    eligible:elig(livelihood,S,tags(S)),
    choices:livelihood.c.map(c=>c.show(S,tags(S)))
  };
  ap(livelihood.c[0].o[0][2]);
  S.sn[livelihood.id]=S.year;
  const searching={job:S.job,goal:newGoal.status,
    action:newGoal.history.at(-1)?.action,
    cooldown:elig(livelihood,S,tags(S))};
  S.year=1105;S.age=37;S.h=100;
  const bsw=EV.find(e=>e.id==='sr_bsw_recruitment_assessment');
  const realOffer=bsw.show(S);
  ap(bsw.c[0].o[0][2]);
  const hired={job:S.job,bsw:S.lifeRecord.affiliations.find(a=>a.id==='bsw-contract')?.status,
    former:former.status,oldGoal:oldGoal.status,
    newGoal:newGoal.status,
    choices:livelihood.c.map(c=>c.show(S,tags(S))),
    eligible:elig(livelihood,S,tags(S))};
  ap(livelihood.c[2].o[0][2]);
  const achieved={job:S.job,goal:newGoal.status,
    action:newGoal.history.at(-1)?.action,
    review:livelihood.show(S),oldGoal:oldGoal.status,
    former:former.status};
  return {withoutHistory,before,left,unemployed,searching,
    realOffer,hired,achieved};
`);
assert.equal(postRhine.withoutHistory,true,
  'the review show predicate can be true without the documented event history');
assert.deepEqual(postRhine.before,{eligible:true,hasNewGoal:false},
  'after 1099 direct experience, 1100 reorganization review becomes eligible');
assert.deepEqual(postRhine.left,{
  job:0,former:'left',ended:1100,oldGoal:'abandoned',
  newGoal:'active',researchEvent:false,review:false,
  followupEligible:false,issues:[]
},'resignation closes Rhine research without fabricating a civilian hiring result');
assert.deepEqual(postRhine.unemployed,{eligible:true,choices:[true,true,false,false]},
  'unemployed ex-researcher can search or pause');
assert.deepEqual(postRhine.searching,{
  job:0,goal:'active',action:'continue',cooldown:false
});
assert.equal(postRhine.realOffer,true,'a different employer can hire after the resignation');
assert.deepEqual(postRhine.hired,{
  job:35,bsw:'active',former:'left',oldGoal:'abandoned',newGoal:'active',
  choices:[false,false,true,true],eligible:true
});
assert.deepEqual(postRhine.achieved,{
  job:35,goal:'achieved',action:'complete',review:false,
  oldGoal:'abandoned',former:'left'
},'new work goal is completed only after a real alternative career begins');

const nonResigner=inspect(`
  born({seed:20261185,by:1068,region:'クルビア'});
  S.year=1099;S.age=31;S.mo=11;S.k=100;S.job=0;
  ap(EV.find(e=>e.id==='sr_rhine_recruitment_exam').c[0].o[0][2]);
  ap(EV.find(e=>e.id==='sr_rhine_section_assignment').c[0].o[0][2]);
  const horizon=EV.find(e=>e.id==='sr_rhine_lone_trail_sky_horizon'),
    review=EV.find(e=>e.id==='sr_rhine_post_lone_trail_career_review'),
    livelihood=EV.find(e=>e.id==='sr_rhine_after_departure_livelihood');
  ap(horizon.c[0].o[0][2]);S.sn[horizon.id]=S.year;
  S.year=1100;S.age=32;
  ap(review.c[0].o[0][2]);S.sn[review.id]=S.year;
  S.eventOutcomes={[review.id]:{year:S.year,choiceIndex:0,outcomeIndex:0}};
  return {job:S.job,former:S.lifeRecord.affiliations.find(a=>a.id==='rhine-lab').status,
    goal:S.lifeRecord.goals.find(g=>g.id==='rhine-research').status,
    fakeGoal:S.lifeRecord.goals.some(g=>g.id==='rhine-after-departure-livelihood'),
    followup:elig(livelihood,S,tags(S)),reviewAgain:elig(review,S,tags(S))};
`);
assert.deepEqual(nonResigner,{
  job:39,former:'active',goal:'active',fakeGoal:false,
  followup:false,reviewAgain:false
},'remaining on the company payroll creates no fictitious resignation history');

console.log('PASS: Rhine dated crisis and post-exit jobs, asylum boundary, Rhodes parallel exit, arena retirement');
