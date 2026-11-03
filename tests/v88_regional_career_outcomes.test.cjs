'use strict';
// Selected regression cases for the story-to-state contract. No life cohort run.
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context, setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
const run = src => vm.runInContext(src,ctx);
const snap = src => JSON.parse(run('JSON.stringify((()=>{'+src+'})())'));
function start(region, species='エラフィア') {
  setup(ctx,{id:'regional-career-outcomes',seed:740011,region,age:24});
  ctx.TEST_SPECIES=species;
  run('S.r={...S.r,n:TEST_SPECIES}; S.age=24; S.year=1098; S.mo=6; S.job=0; S.fl.retired=0; S.sn={};');
}
// Exercise the actual event dispatcher once, not a manually fabricated result.
// These fictional job applications must not silently depend on a nonexistent
// 'fl.inf' field. Infection policy needs event-level evidence, not an invented
// country-wide hiring prohibition.
for(const [region,eventId] of [
  ['イベリア','car_ibe_inq_entry'],
  ['炎国','car_yan_court_entry'],
  ['極東','car_hig_samurai_entry']
]) {
  start(region);
  const infected=snap(`
    S.inf=1;S.fl.dg=1;S.fl.inf=1;S.k=40;
    const event=EV.find(e=>e.id===${JSON.stringify(eventId)});
    return {present:!!event,open:event.show(S)};
  `);
  assert.equal(infected.present,true,eventId+' is defined');
  assert.equal(infected.open,true,eventId+' does not apply an undocumented universal infected ban');
}

start('イベリア');
const dispatchResult=snap(`
  AU='r';HL=0;
  rd=()=>{}; syncUIDialogs=()=>{}; $('stt').focus=()=>{}; // VM has no visual DOM
  const e=EV.find(x=>x.id==='car_ibe_inq_entry');
  fire(e,S,tags(S));
  const row=S.eventOutcomes?.[e.id];
  return {hasOutcome:!!row,year:row?.year,sn:S.sn[e.id],
    choiceIndex:row?.choiceIndex,outcomeIndex:row?.outcomeIndex,
    valid:!!row&&row.choiceIndex>=0&&row.choiceIndex<e.c.length&&
      row.outcomeIndex>=0&&row.outcomeIndex<e.c[row.choiceIndex].o.length};
`);
assert.equal(dispatchResult.hasOutcome,true,'an actually dispatched choice must record its concrete result');
assert.equal(dispatchResult.year,dispatchResult.sn,'result year must match the event occurrence');
assert.equal(dispatchResult.valid,true,'recorded indices must identify the selected choice and actual result');

start('イベリア');
assert.deepEqual(snap(`
  const e=EV.find(x=>x.id==='car_ibe_inq_entry'), choices=simulationChoiceStates(e,S,tags(S));
  return {eligible:elig(e,S,tags(S)),visible:choices.map(x=>x.shown)};
`),{eligible:true,visible:[true,false,true]},'non-Aegir applicant cannot receive the Aegir-only result');
let ordinary=snap(`
  const e=EV.find(x=>x.id==='car_ibe_inq_entry');
  ap(e.c[0].o[0][2]);
  return {job:S.job,detained:!!S.fl.detained,
    employer:S.lifeRecord.affiliations.find(x=>x.id==='iberia-inquisition-officer')?.status,
    role:S.lifeRecord.affiliations.find(x=>x.id==='iberia-inquisition-officer')?.role};
`);
assert.equal(ordinary.job,76);
assert.equal(ordinary.detained,false);
assert.equal(ordinary.employer,'active');
assert.equal(ordinary.role,'見習い審問官');

start('イベリア','エーギル');
assert.deepEqual(snap(`
  const e=EV.find(x=>x.id==='car_ibe_inq_entry'), choices=simulationChoiceStates(e,S,tags(S));
  return {eligible:elig(e,S,tags(S)),visible:choices.map(x=>x.shown)};
`),{eligible:true,visible:[false,true,true]},'Aegir applicant sees only the species-specific route plus withdrawal');
const detention=snap(`
  const e=EV.find(x=>x.id==='car_ibe_inq_entry');
  ap(e.c[1].o[1][2]);
  const confined=EV.find(x=>x.id==='detain_life'),
    now={restricted:restricted(S),job:S.job,available:elig(confined,S,tags(S))};
  ap(confined.c[2].o[0][2]);
  return {now, released:!restricted(S),availableAfter:elig(confined,S,tags(S))};
`);
assert.deepEqual(detention,{now:{restricted:true,job:0,available:true},released:true,availableAfter:false},
  'actual detention opens confinement, and review release closes it');

start('サルゴン');
const outcome=snap(`
  const entry=EV.find(x=>x.id==='car_sar_guard_entry'),
    incident=EV.find(x=>x.id==='car_sar_guard_choice_assassination');
  ap(entry.c[0].o[0][2]);
  const before=S.lifeRecord.affiliations.find(x=>x.id==='sargon-padishah-guard');
  const eligible=elig(incident,S,tags(S));
  const former=before.role;
  ap(incident.c[0].o[0][2]);
  const after=S.lifeRecord.affiliations.find(x=>x.id==='sargon-padishah-guard');
  S.sn[incident.id]=S.year;
  const repeat=elig(incident,S,tags(S));
  return {eligible,former,role:after.role,changeRecorded:after.history.some(x=>x.action==='role'&&x.role==='親衛隊長'),repeat};
`);
assert.equal(outcome.eligible,true);
assert.equal(outcome.role,'親衛隊長');
assert.notEqual(outcome.former,outcome.role);
assert.equal(outcome.changeRecorded,true,'the new role persists in affiliation history');
assert.equal(outcome.repeat,false,'same palace attack must not repeat after a cooldown');

assert.deepEqual(snap(`
  const incident=EV.find(x=>x.id==='car_sar_guard_choice_assassination'),
    followup={id:'test-actual-outcome-consequence',st:['青年','壮年'],
      after:{id:incident.id,min:1,choice:0,outcome:0},fx:{},w:1,t:'not dispatched'};
  S.year++;S.age++;S.sn[incident.id]=S.year-1;
  const missing=elig(followup,S,tags(S));
  S.eventOutcomes={[incident.id]:{year:S.year-1,choiceIndex:0,outcomeIndex:1}};
  const wrong=elig(followup,S,tags(S));
  S.eventOutcomes[incident.id].outcomeIndex=0;
  const correct=elig(followup,S,tags(S));
  const roundtrip=JSON.parse(JSON.stringify(S)).eventOutcomes[incident.id].outcomeIndex;
  return {missing,wrong,correct,roundtrip};
`),{missing:false,wrong:false,correct:true,roundtrip:0},
  'result-dependent after requires the actual result and is serializable');
for(const entry of [
  {region:'龍門',job:45,id:'lungmen-black-market',goal:'lmd-underground-deals'},
  {region:'リターニア',job:59,id:'leithania-court-musician',goal:'leithania-court-music'},
  {region:'サーミ',job:71,id:'sami-scar-warrior',goal:'sami-scar-demon-defense'}
]){
  start(entry.region);
  ctx.EMPLOYMENT_CASE=entry;
  const result=snap(`
    const c=EMPLOYMENT_CASE;
    S.cash=10000000;S.house.cash=10000000;
    ap({job:c.job,lifeAffiliation:{id:c.id,title:'地域固有の勤務',action:'join',role:'現地の担当'},
        lifeGoal:{id:c.goal,title:'地域の仕事を続ける',action:'start'}});
    const prior={job:S.job,status:S.lifeRecord.affiliations.find(x=>x.id===c.id).status};
    const destination=moveDestinations(S).find(x=>x.n!==S.res.n);
    if(!destination)throw Error('No regional route from '+c.region);
    ap({resTo:destination.n,resFareCovered:true});
    const affiliation=S.lifeRecord.affiliations.find(x=>x.id===c.id),
      goal=S.lifeRecord.goals.find(x=>x.id===c.goal),
      career=S.lifeRecord.careerChanges.at(-1);
    return {prior,region:S.res.n,job:S.job,affiliation:affiliation.status,goal:goal.status,
      change:{from:career?.fromJobId,to:career?.toJobId},
      contract:S.workContract,site:S.siteAffiliations?.workplace||null,
      issues:auditLifeState(S)};
  `);
  assert.deepEqual(result.prior,{job:entry.job,status:'active'},entry.id+' was employed locally');
  assert.notEqual(result.region,entry.region,entry.id+' moved to a new region');
  assert.equal(result.affiliation,'left',entry.id+' old posting closed');
  assert.equal(result.goal,'compromised',entry.id+' personal goal reviewed after departure');
  assert.equal(result.job,0,entry.id+' no longer pays a region-bound occupation');
  assert.deepEqual(result.change,{from:entry.job,to:0},entry.id+' transition recorded');
  assert.equal(result.contract,null,entry.id+' no phantom work contract');
  assert.equal(result.site,null,entry.id+' no phantom local workplace');
  assert.deepEqual(result.issues,[],entry.id+' state audit');
}
start('イェラグ');
const portable=snap(`
  S.cash=10000000;S.house.cash=10000000;
  ap({job:16,
    lifeAffiliation:{id:'terra-general-transporter',title:'各地の運送業',action:'join'},
    lifeAffiliations:[{id:'kjerag-village-transporter',title:'集落間の便',action:'join'}]});
  const destination=moveDestinations(S).find(x=>x.n!==S.res.n);
  if(!destination)throw Error('No exit from Kjerag');
  ap({resTo:destination.n,resFareCovered:true});
  return {job:S.job,local:S.lifeRecord.affiliations.find(x=>x.id==='kjerag-village-transporter').status,
    general:S.lifeRecord.affiliations.find(x=>x.id==='terra-general-transporter').status,
    contract:!!S.workContract,issues:auditLifeState(S)};
`);
assert.equal(portable.job,16,'ordinary transporter keeps the portable occupation');
assert.equal(portable.local,'left','original village route closes after departure');
assert.equal(portable.general,'active','general transporter work remains active');
assert.equal(portable.contract,true,'a new current-region employer is modeled for the portable job');
assert.deepEqual(portable.issues,[],'portable occupation audit');


for(const row of [
  {region:'龍門',event:'car_lmd_black_entry',job:45,affiliation:'lungmen-black-market',goal:'lmd-underground-deals',achieved:true},
  {region:'リターニア',event:'car_lei_court_entry',job:59,affiliation:'leithania-court-musician',goal:'leithania-court-music',achieved:true},
  {region:'サーミ',event:'car_sam_warrior_entry',job:71,affiliation:'sami-scar-warrior',goal:'sami-scar-demon-defense',achieved:false}
]){
  start(row.region);
  ctx.REHIRE_CASE=row;
  const outcome=snap(`
    const c=REHIRE_CASE,e=EV.find(x=>x.id===c.event);
    if(!e)throw Error('Regional career event missing: '+c.event);
    S.cash=10000000;S.house.cash=10000000;
    const firstChoice=e.c[0].o[0][2];
    ap(firstChoice);
    S.sn[e.id]=S.year;
    const initial=S.lifeRecord.affiliations.find(x=>x.id===c.affiliation);
    const goal=S.lifeRecord.goals.find(x=>x.id===c.goal);
    if(c.achieved)applyLifeGoal({id:c.goal,action:'complete',note:'第一の勤務期間で目標を達成した'});
    const completedYear=goal.lastChangedYear;
    ap({job:0});
    const afterExit={job:S.job,affiliation:initial.status,goal:goal.status,episodes:initial.episodes.length};
    S.year+=3;S.age+=3;S.mo=4;
    const canApply=elig(e,S,tags(S)),canChoose=e.c[0].show(S,tags(S));
    ap(firstChoice);
    const result={job:S.job,affiliation:initial.status,goal:goal.status,
      goalChangedYear:goal.lastChangedYear,completedYear,
      completions:goal.history.filter(x=>x.action==='complete').length,
      goalHistory:goal.history.map(x=>x.action),episodes:initial.episodes.length,
      priorEpisodeEnd:initial.episodes[0]?.endedYear,
      returnEpisodeStart:initial.episodes[1]?.startedYear,
      returning:initial.episodes[1]?.returning,
      role:initial.role,
      duplicateAffiliations:S.lifeRecord.affiliations.filter(x=>x.id===c.affiliation).length,
      duplicateGoals:S.lifeRecord.goals.filter(x=>x.id===c.goal).length,
      changes:S.lifeRecord.careerChanges.slice(-3).map(x=>[x.fromJobId,x.toJobId]),
      issues:auditLifeState(S)};
    return {canApply,canChoose,afterExit,result};
  `);
  assert.equal(outcome.canApply,true,row.event+' is eligible again after cooldown');
  assert.equal(outcome.canChoose,true,row.event+' allows a new period after leaving');
  assert.deepEqual(outcome.afterExit,{job:0,affiliation:'left',
    goal:row.achieved?'achieved':'compromised',episodes:1},row.event+' closes first period');
  assert.equal(outcome.result.job,row.job,row.event+' second hiring starts same occupation');
  assert.equal(outcome.result.affiliation,'active',row.event+' second period is active');
  assert.equal(outcome.result.goal,row.achieved?'achieved':'active',row.event+' respects completion history');
  assert.equal(outcome.result.episodes,2,row.event+' starts a separate affiliation period');
  assert.equal(outcome.result.returning,true,row.event+' records re-entry');
  assert.equal(outcome.result.priorEpisodeEnd,1098,row.event+' keeps first ending');
  assert.equal(outcome.result.returnEpisodeStart,1101,row.event+' stores new start');
  assert.equal(outcome.result.duplicateAffiliations,1,row.event+' does not duplicate employer identity');
  assert.equal(outcome.result.duplicateGoals,1,row.event+' does not duplicate goal identity');
  assert.deepEqual(outcome.result.changes,[[0,row.job],[row.job,0],[0,row.job]],row.event+' career episodes');
  if(row.achieved){
    assert.equal(outcome.result.goalChangedYear,outcome.result.completedYear,row.event+' keeps completion date');
    assert.equal(outcome.result.completions,1,row.event+' keeps single historical achievement');
    assert.equal(outcome.result.goalHistory.at(-1),'complete',row.event+' rehire does not rewrite achievement');
  }else{
    assert.equal(outcome.result.goalHistory.at(-1),'start',row.event+' reopens unresolved aspiration');
  }
  assert.deepEqual(outcome.result.issues,[],row.event+' rehire audit');
}


// Audit every registered regional career, using the real event catalogue and effects.
// The matrix is intentionally generated from the current catalogue; new careers
// enter the regression without a separate mirror of profession IDs.
const regionalCareers=snap(`
  return EV.filter(e=>/^car_[a-z0-9_]+_entry$/.test(e.id)).map(e=>{
    const outcome=e.c.flatMap(c=>c.o).find(o=>o[2]?.job>=41 && o[2]?.job<=82),
      effect=outcome?.[2],affiliation=effect?.lifeAffiliation?.id,
      rule=affiliation&&AFFILIATION_RULES[affiliation];
    return effect&&rule?{
      id:e.id,key:e.id.slice(4,-6),region:rule.region,job:effect.job,
      affiliation,goal:effect.lifeGoal.id
    }:null;
  }).filter(Boolean);
`);
assert.equal(regionalCareers.length,42,'all 42 regional careers have genuine hiring outcomes');
assert.deepEqual(regionalCareers.map(c=>c.job).sort((a,b)=>a-b),
  Array.from({length:42},(_,i)=>41+i),'regional job IDs 41–82 are all represented');
let checkedRegionalDutyEvents=0;
for(const career of regionalCareers){
  start(career.region,career.job===60?'サンクタ':'エラフィア');
  ctx.REGIONAL_MATRIX_CASE=career;
  const result=snap(`
    const c=REGIONAL_MATRIX_CASE,entry=EV.find(e=>e.id===c.id),
      choice=entry.c.flatMap(x=>x.o).find(o=>o[2]?.job===c.job),
      success=choice[2],
      duties=EV.filter(e=>e.id.startsWith('car_'+c.key+'_') &&
        (e.id.includes('_daily_')||e.id.includes('_choice_')));
    S.cash=15000000;S.house.cash=15000000;
    S.k=100;S.p=100;S.cr=100;
    S.mo=entry.months?.[0]||4;
    if(c.key==='hig_cyber')S.fl.cyber_trace=1;
    const before={shown:entry.show(S),eligible:elig(entry,S,tags(S))};
    ap(success);
    S.sn[entry.id]=S.year;
    const member=S.lifeRecord.affiliations.find(a=>a.id===c.affiliation);
    const goal=S.lifeRecord.goals.find(g=>g.id===c.goal);
    const employed={
      job:S.job,affiliation:member?.status,goal:goal?.status,
      duty:duties.map(e=>({id:e.id,shown:e.show(S)})),
      contract:!!S.workContract
    };
    ap({lifeAffiliation:{id:c.affiliation,action:'leave'}});
    const ended={
      job:S.job,affiliation:member.status,goal:goal.status,
      contract:S.workContract,site:S.siteAffiliations?.workplace||null,
      duty:duties.map(e=>e.show(S))
    };
    // Even a stale manually assigned occupation may not impersonate active duty.
    S.job=c.job;
    const staleDuty=duties.map(e=>e.show(S));
    S.job=0;
    S.year+=3;S.age+=3;S.mo=entry.months?.[0]||4;
    const canRehire={shown:entry.show(S),eligible:elig(entry,S,tags(S))};
    ap(success);
    const hiredAgain={
      job:S.job,status:member.status,goal:goal.status,
      episodes:member.episodes.map(x=>({startedYear:x.startedYear,endedYear:x.endedYear,returning:x.returning})),
      occupationChanges:S.lifeRecord.careerChanges.slice(-3).map(x=>[x.fromJobId,x.toJobId]),
      memberCount:S.lifeRecord.affiliations.filter(a=>a.id===c.affiliation).length,
      goalCount:S.lifeRecord.goals.filter(g=>g.id===c.goal).length,
      issues:auditLifeState(S)
    };
    return {before,employed,ended,staleDuty,canRehire,hiredAgain};
  `);
  assert.equal(result.before.shown,true,career.id+' hiring opportunity is shown');
  assert.equal(result.before.eligible,true,career.id+' hiring opportunity is eligible');
  assert.equal(result.employed.job,career.job,career.id+' actually sets intended occupation');
  assert.equal(result.employed.affiliation,'active',career.id+' actually joins the employer');
  assert.equal(result.employed.goal,'active',career.id+' starts a livelihood goal');
  assert.equal(result.employed.contract,false,career.id+' uses the regional affiliation and base pay, not a fabricated standard-work contract');
  checkedRegionalDutyEvents+=result.employed.duty.length;
  assert(result.employed.duty.every(e=>e.shown),career.id+' has all current duty scenes available');
  assert.equal(result.ended.job,0,career.id+' explicit leave removes old occupation');
  assert.equal(result.ended.affiliation,'left',career.id+' closes original employer');
  assert.equal(result.ended.goal,'compromised',career.id+' retains unresolved livelihood history');
  assert.equal(result.ended.contract,null,career.id+' closes old contract');
  assert.equal(result.ended.site,null,career.id+' closes old workplace');
  assert(result.ended.duty.every(x=>x===false),career.id+' has no duty event after leaving');
  assert(result.staleDuty.every(x=>x===false),career.id+' job ID alone cannot impersonate active employment');
  assert.deepEqual(result.canRehire,{shown:true,eligible:true},career.id+' may reapply after cooldown');
  assert.equal(result.hiredAgain.job,career.job,career.id+' is re-employed');
  assert.equal(result.hiredAgain.status,'active',career.id+' renews current affiliation');
  assert.equal(result.hiredAgain.goal,'active',career.id+' reopens unresolved goal');
  assert.deepEqual(result.hiredAgain.episodes,[
    {startedYear:1098,endedYear:1098,returning:false},
    {startedYear:1101,endedYear:null,returning:true}
  ],career.id+' records two separate employment periods');
  assert.deepEqual(result.hiredAgain.occupationChanges,
    [[0,career.job],[career.job,0],[0,career.job]],career.id+' retains exact career sequence');
  assert.equal(result.hiredAgain.memberCount,1,career.id+' never duplicates employer ID');
  assert.equal(result.hiredAgain.goalCount,1,career.id+' never duplicates goal ID');
  assert.deepEqual(result.hiredAgain.issues,[],career.id+' passes state audit');
}
assert(checkedRegionalDutyEvents>=60,'all registered duty event groups are exercised');

// Severe employer-specific departures must not turn into a normal reapplication.
for(const [region,entryId,incidentId] of [
  ['ウルサス','car_urs_officer_entry','car_urs_officer_choice_purge'],
  ['ウルサス','car_urs_guard_entry','car_urs_guard_choice_riot'],
  ['ヴィクトリア','car_vic_royal_entry','car_vic_royal_choice_coup']
]){
  start(region);
  const contextCase={entryId,incidentId};
  ctx.EXPELLED_CASE=contextCase;
  const result=snap(`
    const c=EXPELLED_CASE,e=EV.find(x=>x.id===c.entryId);
    S.k=100;S.cr=100;
    const before=e.show(S);
    S.eventOutcomes ||= {};
    S.eventOutcomes[c.incidentId]={year:S.year-3,choiceIndex:0,outcomeIndex:0};
    if(c.entryId==='car_vic_royal_entry') S.sn[c.incidentId]=S.year-3;
    const loyal=e.show(S);
    S.eventOutcomes[c.incidentId]={year:S.year-3,choiceIndex:1,outcomeIndex:0};
    S.sn[c.incidentId]=S.year-3;
    const discharged={shown:e.show(S),eligible:elig(e,S,tags(S))};
    return {before,loyal,discharged};
  `);
  assert.equal(result.before,true,entryId+' ordinarily recruits');
  assert.equal(result.loyal,entryId==='car_vic_royal_entry'?false:true,
    entryId+' reapplication follows the actual survival and affiliation history');
  assert.deepEqual(result.discharged,{shown:false,eligible:false},
    entryId+' cannot rehire a recorded expelled officer/guard');
}
for(const [region,eventId] of [
  ['ウルサス','car_urs_officer_entry'],
  ['ヴィクトリア','car_vic_royal_entry'],
  ['リターニア','car_lei_golden_entry']
]){
  start(region);
  ctx.INFECTION_RECRUIT=eventId;
  const candidate=snap(`
    S.inf=1;S.fl.dg=1;S.k=100;S.cr=100;
    const e=EV.find(x=>x.id===INFECTION_RECRUIT);
    return {shown:e.show(S),eligible:elig(e,S,tags(S)),
      hasBogusFlag:Object.hasOwn(S.fl,'inf')};
  `);
  assert.equal(candidate.shown,true,eventId+' uses actual eligibility rather than fl.inf');
  assert.equal(candidate.eligible,true,eventId+' has no invented blanket infection hiring ban');
  assert.equal(candidate.hasBogusFlag,false,eventId+' does not write an unregistered infection flag');
}
for(const branch of [0,1]){
  start('極東');
  ctx.NINJA_OUTCOME=branch;
  const result=snap(`
    const entry=EV.find(x=>x.id==='car_hig_ninja_entry'),
      escape=EV.find(x=>x.id==='car_hig_ninja_choice_escape');
    ap(entry.c[0].o[0][2]);
    const before={job:S.job,affiliation:S.lifeRecord.affiliations.find(a=>a.id==='higashi-ninja-clan').status};
    ap(escape.c[0].o[NINJA_OUTCOME][2]);
    S.year+=3;S.age+=3;
    return {before,after:{job:S.job,escaped:S.fl.nukenin,
      affiliation:S.lifeRecord.affiliations.find(a=>a.id==='higashi-ninja-clan').status,
      ninjaAgain:entry.show(S),
      otherCareer:EV.find(e=>e.id==='car_hig_samurai_entry').show(S),
      issues:auditLifeState(S)}};
  `);
  assert.deepEqual(result.before,{job:47,affiliation:'active'},'ninja begins in the clan');
  assert.equal(result.after.job,0,'ninja departure ends original job');
  assert.equal(result.after.escaped,1,'ninja desertion is recorded');
  assert.equal(result.after.affiliation,'left','ninja clan records its departure');
  assert.equal(result.after.ninjaAgain,false,'escaped ninja cannot immediately rejoin same clan');
  assert.equal(result.after.otherCareer,true,'escape is not a universal employment ban');
  assert.deepEqual(result.after.issues,[],'ninja desertion state audit');
}


start('ヴィクトリア');
const victorianExile=snap(`
  const entry=EV.find(e=>e.id==='car_vic_royal_entry'),
    coup=EV.find(e=>e.id==='car_vic_royal_choice_coup'),
    oldDuty=EV.find(e=>e.id==='car_vic_royal_daily_01'),
    review=EV.find(e=>e.id==='car_vic_exile_command_review'),
    postwar=EV.find(e=>e.id==='car_vic_exile_postwar_review');
  S.year=1094;S.by=1070;S.age=24;S.mo=6;
  S.k=100;S.cr=100;S.p=100;S.cash=10000000;S.house.cash=10000000;
  const hiring=entry.c[0].o[0][2];
  ap(hiring);
  const old=S.lifeRecord.affiliations.find(a=>a.id==='victoria-royal-officer'),
    priorGoal=S.lifeRecord.goals.find(g=>g.id==='victoria-officer-career');
  const initially={
    job:S.job,oldRole:old.role,oldStatus:old.status,
    coupEligible:elig(coup,S,tags(S)),oldDuty:oldDuty.show(S)
  };
  ap(coup.c[0].o[0][2]);
  S.sn[coup.id]=S.year;
  S.eventOutcomes ||= {};
  S.eventOutcomes[coup.id]={year:S.year,choiceIndex:0,outcomeIndex:0};
  const exile=S.lifeRecord.affiliations.find(a=>a.id==='victoria-exiled-ducal-command'),
    newGoal=S.lifeRecord.goals.find(g=>g.id==='victoria-exiled-command');
  const escaped={
    job:S.job,region:S.res.n,priorStatus:old.status,priorEnd:old.episodes.at(-1)?.endedYear,
    oldGoal:priorGoal.status,newGoal:newGoal?.status,oldDuty:oldDuty.show(S),
    newRole:exile?.role,newStatus:exile?.status,
    exileCount:S.lifeRecord.affiliations.filter(a=>a.id===exile.id).length,
    oldCareerAgain:entry.show(S),reviewNow:elig(review,S,tags(S)),
    postwarNow:elig(postwar,S,tags(S)),
    issues:auditLifeState(S)
  };
  S.year=1096;S.age=26;
  const ready={shown:review.show(S),eligible:elig(review,S,tags(S))};
  ap({k:1});
  const incidental={
    job:S.job,oldStatus:old.status,newStatus:exile.status,
    oldDuty:oldDuty.show(S),review:elig(review,S,tags(S))
  };
  ap(review.c[0].o[0][2]);
  S.sn[review.id]=S.year;
  const continued={
    job:S.job,status:exile.status,role:exile.role,
    goal:newGoal.status,latest:newGoal.history.at(-1)?.action,
    reviewAgain:elig(review,S,tags(S))
  };
  S.year=1098;S.age=28;
  const wartimeLastYear={shown:review.show(S),postwarEligible:elig(postwar,S,tags(S))};
  S.year=1099;S.age=29;
  const repeat=elig(review,S,tags(S)),
    postwarReady={shown:postwar.show(S),eligible:elig(postwar,S,tags(S))};
  ap(postwar.c[0].o[0][2]);
  S.sn[postwar.id]=S.year;
  const postwarContinued={
    job:S.job,role:exile.role,goal:newGoal.status,
    latest:newGoal.history.at(-1)?.action,
    oldDuty:oldDuty.show(S),repeat:elig(postwar,S,tags(S))
  };
  S.year=1102;S.age=32;
  const postwarRepeat=elig(postwar,S,tags(S));
  ap(postwar.c[1].o[0][2]);
  const retired={
    job:S.job,oldStatus:old.status,newStatus:exile.status,
    exileEnd:exile.episodes.at(-1)?.endedYear,
    newGoal:newGoal.status,oldGoal:priorGoal.status,
    oldDuty:oldDuty.show(S),reviewShown:review.show(S),
    careerAgain:entry.show(S),
    history:exile.history.map(row=>row.action),
    issues:auditLifeState(S)
  };
  return {initially,escaped,ready,incidental,continued,wartimeLastYear,
    repeat,postwarReady,postwarContinued,postwarRepeat,retired};
`);
assert.deepEqual(victorianExile.initially,{
  job:55,oldRole:'公爵軍近衛少尉',oldStatus:'active',coupEligible:true,oldDuty:true
},'Victorian officer may face the historically scoped 1094 coup');
assert.deepEqual(victorianExile.escaped,{
  job:55,region:'ヴィクトリア',priorStatus:'left',priorEnd:1094,
  oldGoal:'compromised',newGoal:'active',oldDuty:false,
  newRole:'最高指揮官',newStatus:'active',exileCount:1,
  oldCareerAgain:false,reviewNow:false,postwarNow:false,issues:[]
},'surviving the coup transfers to a separate exile command without fabricating a new country');
assert.deepEqual(victorianExile.ready,{shown:true,eligible:true},
  'only the surviving exile commander receives the two-year follow-up');
assert.deepEqual(victorianExile.incidental,{
  job:55,oldStatus:'left',newStatus:'active',oldDuty:false,review:true
},'later unrelated effects cannot erase a valid second employer with the same occupation');
assert.deepEqual(victorianExile.continued,{
  job:55,status:'active',role:'最高指揮官',goal:'active',
  latest:'continue',reviewAgain:false
},'remaining with the exiled force retains command and respects cooldown');
assert.deepEqual(victorianExile.wartimeLastYear,
  {shown:true,postwarEligible:false},
  '1098 wartime review may still exist, while postwar negotiations cannot begin prematurely');
assert.equal(victorianExile.repeat,false,
  'the wartime review cannot recur after the 1098 conclusion');
assert.deepEqual(victorianExile.postwarReady,{shown:true,eligible:true},
  'the exiled command receives a post-1098 review only after the historical boundary');
assert.deepEqual(victorianExile.postwarContinued,{
  job:55,role:'最高指揮官',goal:'active',latest:'continue',
  oldDuty:false,repeat:false
},'postwar continuation keeps separate employer, duty and personal aspiration');
assert.equal(victorianExile.postwarRepeat,true,
  'the survivor can review the postwar command after the three-year cooldown');
assert.deepEqual(victorianExile.retired,{
  job:0,oldStatus:'left',newStatus:'left',exileEnd:1102,
  newGoal:'abandoned',oldGoal:'compromised',oldDuty:false,
  reviewShown:false,careerAgain:false,
  history:['join','leave'],issues:[]
},'demobilization closes the new posting while both employer histories persist');

start('ヴィクトリア');
const royalSurrender=snap(`
  const entry=EV.find(e=>e.id==='car_vic_royal_entry'),
    coup=EV.find(e=>e.id==='car_vic_royal_choice_coup'),
    review=EV.find(e=>e.id==='car_vic_exile_command_review');
  S.year=1094;S.by=1070;S.age=24;S.k=100;S.cr=100;
  ap(entry.c[0].o[0][2]);
  ap(coup.c[1].o[0][2]);
  S.sn[coup.id]=S.year;
  S.eventOutcomes ||= {};
  S.eventOutcomes[coup.id]={year:S.year,choiceIndex:1,outcomeIndex:0};
  return {job:S.job,former:S.lifeRecord.affiliations.find(a=>a.id==='victoria-royal-officer').status,
    oldGoal:S.lifeRecord.goals.find(g=>g.id==='victoria-officer-career').status,
    exile:S.lifeRecord.affiliations.some(a=>a.id==='victoria-exiled-ducal-command'),
    formerDuty:EV.find(e=>e.id==='car_vic_royal_daily_01').show(S),
    rehire:entry.show(S),exileReview:elig(review,S,tags(S)),
    postwarReview:EV.find(e=>e.id==='car_vic_exile_postwar_review').show(S),
    issues:auditLifeState(S)};
`);
assert.deepEqual(royalSurrender,{
  job:0,former:'left',oldGoal:'abandoned',exile:false,formerDuty:false,
  rehire:false,exileReview:false,postwarReview:false,issues:[]
},'surrender ends the original army career without creating exiled command');

start('ヴィクトリア');
const missingExile=snap(`
  const entry=EV.find(e=>e.id==='car_vic_royal_entry'),
    coup=EV.find(e=>e.id==='car_vic_royal_choice_coup'),
    review=EV.find(e=>e.id==='car_vic_exile_command_review');
  S.year=1099;S.age=29;S.by=1070;
  ap(entry.c[0].o[0][2]);
  S.sn[coup.id]=1094;
  S.eventOutcomes={[coup.id]:{year:1094,choiceIndex:0,outcomeIndex:0}};
  const postwar=EV.find(e=>e.id==='car_vic_exile_postwar_review');
  return {shown:review.show(S),eligible:elig(review,S,tags(S)),
    postwarShown:postwar.show(S),postwarEligible:elig(postwar,S,tags(S))};
`);
assert.deepEqual(missingExile,{
  shown:false,eligible:false,postwarShown:false,postwarEligible:false
},
  'a recorded crisis outcome without an actual exile posting cannot provide exile duties');


// Former-service careers have a separate next-livelihood goal. It is only
// completed after a real independent hiring outcome has established a job.
const departureCases=[
  {region:'極東',entry:'car_hig_ninja_entry',incident:'car_hig_ninja_choice_escape',
    exitChoice:0,exitOutcome:0,former:'higashi-ninja-clan',oldGoal:'higashi-ninja-mission',
    goal:'higashi-nukenin-next-livelihood',review:'car_hig_ninja_after_escape',
    other:'car_hig_samurai_entry',oldJob:47,otherJob:46},
  {region:'極東',entry:'car_hig_ninja_entry',incident:'car_hig_ninja_choice_escape',
    exitChoice:0,exitOutcome:1,former:'higashi-ninja-clan',oldGoal:'higashi-ninja-mission',
    goal:'higashi-nukenin-next-livelihood',review:'car_hig_ninja_after_escape',
    other:'car_hig_samurai_entry',oldJob:47,otherJob:46},
  {region:'ウルサス',entry:'car_urs_officer_entry',incident:'car_urs_officer_choice_purge',
    exitChoice:1,exitOutcome:0,former:'ursus-imperial-officer',oldGoal:'ursus-imperial-command',
    goal:'ursus-dismissed-officer-next-livelihood',review:'car_urs_officer_after_dismissal',
    other:'car_urs_academy_entry',oldJob:51,otherJob:53},
  {region:'ウルサス',entry:'car_urs_guard_entry',incident:'car_urs_guard_choice_riot',
    exitChoice:1,exitOutcome:0,former:'ursus-border-mine-guard',oldGoal:'ursus-border-mine-patrol',
    goal:'ursus-expelled-guard-next-livelihood',review:'car_urs_guard_after_expulsion',
    other:'car_urs_academy_entry',oldJob:52,otherJob:53}
];
for(const c of departureCases){
  start(c.region);
  ctx.AFTER_DEPARTURE_CASE=c;
  const result=snap(`
    const c=AFTER_DEPARTURE_CASE,
      entry=EV.find(e=>e.id===c.entry),
      incident=EV.find(e=>e.id===c.incident),
      review=EV.find(e=>e.id===c.review),
      other=EV.find(e=>e.id===c.other),
      hiring=entry.c[0].o[0][2],
      exit=incident.c[c.exitChoice].o[c.exitOutcome][2];
    if(!entry||!incident||!review||!other||!hiring||!exit)
      throw Error('Departure pathway missing: '+c.incident);
    const startYear=S.year;
    S.cash=10000000;S.house.cash=10000000;S.k=100;S.cr=100;
    ap(hiring);
    const member=S.lifeRecord.affiliations.find(a=>a.id===c.former),
      formerGoal=S.lifeRecord.goals.find(g=>g.id===c.oldGoal);
    const onDuty=incident.show(S);
    ap(exit);
    S.sn[incident.id]=startYear;
    S.eventOutcomes ||= {};
    S.eventOutcomes[incident.id]={
      year:startYear,choiceIndex:c.exitChoice,outcomeIndex:c.exitOutcome
    };
    const nextGoal=S.lifeRecord.goals.find(g=>g.id===c.goal);
    const afterExit={
      job:S.job,member:member.status,ended:member.episodes.at(-1)?.endedYear,
      oldGoal:formerGoal.status,nextGoal:nextGoal?.status,
      oldDuty:incident.show(S),alreadyReady:elig(review,S,tags(S)),
      issues:auditLifeState(S)
    };
    S.year+=2;S.age+=2;
    const firstReview={
      open:elig(review,S,tags(S)),
      choices:review.c.map(row=>row.show(S,tags(S)))
    };
    ap(review.c[0].o[0][2]);
    S.sn[review.id]=S.year;
    const search={job:S.job,goal:nextGoal.status,
      action:nextGoal.history.at(-1)?.action,
      cooldown:elig(review,S,tags(S))
    };
    S.year+=3;S.age+=3;
    ap(review.c[1].o[0][2]);
    S.sn[review.id]=S.year;
    const resting={job:S.job,goal:nextGoal.status,
      action:nextGoal.history.at(-1)?.action};
    const otherHiring=other.c.flatMap(ch=>ch.o).find(out=>out[2]?.job===c.otherJob)?.[2];
    if(!otherHiring) throw Error('Actual alternative employer hiring missing: '+c.other);
    ap(otherHiring);
    S.year+=3;S.age+=3;
    const hired={job:S.job,former:member.status,
      nextGoal:nextGoal.status,oldGoal:formerGoal.status,
      oldEmployerRehire:entry.show(S),
      choices:review.c.map(row=>row.show(S,tags(S))),
      eligible:elig(review,S,tags(S))
    };
    ap(review.c[2].o[0][2]);
    S.sn[review.id]=S.year;
    const completed={job:S.job,goal:nextGoal.status,
      action:nextGoal.history.at(-1)?.action,
      shown:review.show(S),eligible:elig(review,S,tags(S)),
      history:nextGoal.history.map(h=>h.action),
      affiliationCount:S.lifeRecord.affiliations.filter(a=>a.id===c.former).length,
      issues:auditLifeState(S)
    };
    return {startYear,onDuty,afterExit,firstReview,search,resting,hired,completed};
  `);
  assert.equal(result.onDuty,true,c.incident+' belongs to active employee');
  assert.deepEqual(result.afterExit,{
    job:0,member:'left',ended:result.startYear,
    oldGoal:'abandoned',nextGoal:'active',oldDuty:false,alreadyReady:false,issues:[]
  },c.incident+' leaves the former employer and closes prior mission');
  assert.deepEqual(result.firstReview,{
    open:true,choices:c.oldJob===47?[true,true,false,false]:[true,true,false,false,false]
  },c.review+' offers search or rest only when unemployed');
  assert.deepEqual(result.search,{
    job:0,goal:'active',action:'continue',cooldown:false
  },c.review+' does not invent an employment outcome');
  assert.deepEqual(result.resting,{
    job:0,goal:'paused',action:'pause'
  },c.review+' allows a reversible pause without reopening former service');
  assert.deepEqual(result.hired,{
    job:c.otherJob,former:'left',nextGoal:'paused',oldGoal:'abandoned',
    oldEmployerRehire:false,
    choices:c.oldJob===47?[false,false,true,true]:[false,false,true,true,false],eligible:true
  },c.review+' later reflects an actual independent employment decision');
  assert.deepEqual(result.completed,{
    job:c.otherJob,goal:'achieved',action:'complete',shown:false,eligible:false,
    history:['start','continue','pause','complete'],affiliationCount:1,issues:[]
  },c.review+' completes only after a real new job and preserves former records');
}
// Another incident outcome is never permission to invent expulsion or new work.
for(const cfg of [
  {region:'極東',incident:'car_hig_ninja_choice_escape',choice:1,review:'car_hig_ninja_after_escape'},
  {region:'ウルサス',incident:'car_urs_officer_choice_purge',choice:0,review:'car_urs_officer_after_dismissal'},
  {region:'ウルサス',incident:'car_urs_guard_choice_riot',choice:0,review:'car_urs_guard_after_expulsion'}
]){
  start(cfg.region);
  ctx.FORMER_SERVICE_NEGATIVE=cfg;
  const negative=snap(`
    const c=FORMER_SERVICE_NEGATIVE,
      e=EV.find(x=>x.id===c.review);
    S.sn[c.incident]=1097;
    S.eventOutcomes={[c.incident]:{year:1097,choiceIndex:c.choice,outcomeIndex:0}};
    S.year=1100;S.age=26;
    return {shown:e.show(S),eligible:elig(e,S,tags(S)),
      goalCreated:S.lifeRecord.goals.some(g=>g.id.includes('next-livelihood'))};
  `);
  assert.deepEqual(negative,{shown:false,eligible:false,goalCreated:false},
    cfg.review+' cannot activate from another historical choice');
}


// Each exceptional military return needs a documented departure, individual
// positive review, then a separate ordinary hiring result. Re-entry is not an amnesty.
for(const c of [
  {entry:'car_urs_officer_entry',incident:'car_urs_officer_choice_purge',
    hearing:'car_urs_officer_disciplinary_review',review:'car_urs_officer_after_dismissal',
    employer:'ursus-imperial-officer',formerGoal:'ursus-imperial-command',
    civilianGoal:'ursus-dismissed-officer-next-livelihood',job:51},
  {entry:'car_urs_guard_entry',incident:'car_urs_guard_choice_riot',
    hearing:'car_urs_guard_disciplinary_review',review:'car_urs_guard_after_expulsion',
    employer:'ursus-border-mine-guard',formerGoal:'ursus-border-mine-patrol',
    civilianGoal:'ursus-expelled-guard-next-livelihood',job:52}
]){
  start('ウルサス');ctx.URS_REENTRY=c;
  const result=snap(`
    const c=URS_REENTRY,
      hire=EV.find(x=>x.id===c.entry),
      original=EV.find(x=>x.id===c.incident),
      hearing=EV.find(x=>x.id===c.hearing),
      after=EV.find(x=>x.id===c.review);
    if(!hire||!original||!hearing||!after)
      throw Error('Missing exceptional military career event '+c.entry);
    S.year=1094;S.age=26;S.by=1068;S.cr=90;S.k=90;S.h=90;
    ap(hire.c[0].o[0][2]);
    const group=S.lifeRecord.affiliations.find(x=>x.id===c.employer);
    const oldGoal=S.lifeRecord.goals.find(x=>x.id===c.formerGoal);
    ap(original.c[1].o[0][2]);
    S.sn[original.id]=S.year;
    S.eventOutcomes={[original.id]:{year:S.year,choiceIndex:1,outcomeIndex:0}};
    const next=S.lifeRecord.goals.find(x=>x.id===c.civilianGoal);
    const discharged={
      job:S.job,status:group.status,oldGoal:oldGoal.status,
      newGoal:next.status,canApply:hire.show(S),hearing:elig(hearing,S,tags(S)),
      oldDuty:original.show(S),issues:auditLifeState(S)
    };
    S.year=1096;S.age=28;
    const early={shown:hearing.show(S),eligible:elig(hearing,S,tags(S))};
    S.year=1097;S.age=29;
    const eligible=elig(hearing,S,tags(S));
    ap(hearing.c[0].o[1][2]);
    S.sn[hearing.id]=S.year;
    S.eventOutcomes[hearing.id]={year:S.year,choiceIndex:0,outcomeIndex:1};
    const denied={job:S.job,canApply:hire.show(S),
      hearingAgain:elig(hearing,S,tags(S)),status:group.status};
    S.year=1100;S.age=32;
    const later=elig(hearing,S,tags(S));
    ap(after.c[1].o[0][2]);
    S.sn[after.id]=S.year;
    const paused=next.status;
    ap(hearing.c[0].o[0][2]);
    S.sn[hearing.id]=S.year;
    S.eventOutcomes[hearing.id]={year:S.year,choiceIndex:0,outcomeIndex:0};
    const cleared={
      job:S.job,oldStatus:group.status,oldGoal:oldGoal.status,
      civilianGoal:next.status,canApply:elig(hire,S,tags(S)),
      reviewOnceMore:elig(hearing,S,tags(S)),
      episodes:group.episodes.length,issues:auditLifeState(S)
    };
    ap(hire.c[0].o[0][2]);
    const again={
      job:S.job,status:group.status,episodes:group.episodes.length,
      firstEnded:group.episodes[0]?.endedYear,
      newStarted:group.episodes.at(-1)?.startedYear,
      oldGoal:oldGoal.status,pausedCivilian:next.status,
      duty:original.show(S),hearing:hearing.show(S),
      followup:elig(after,S,tags(S)),
      choices:after.c.map(x=>x.show(S,tags(S))),
      issues:auditLifeState(S)
    };
    S.year+=3;S.age+=3;
    const afterReady=elig(after,S,tags(S));
    ap(after.c[4].o[0][2]);
    const settled={
      job:S.job,goal:next.status,
      action:next.history.at(-1)?.action,
      oldGoal:oldGoal.status,
      originalMemory:S.eventOutcomes[original.id].choiceIndex,
      employmentEpisodes:group.episodes.length,
      afterShown:after.show(S),issues:auditLifeState(S)
    };
    return {discharged,early,eligible,denied,later,paused,cleared,again,afterReady,settled};
  `);
  assert.deepEqual(result.discharged,{
    job:0,status:'left',oldGoal:'abandoned',newGoal:'active',
    canApply:false,hearing:false,oldDuty:false,issues:[]
  },c.incident+' has real military discharge and blocks ordinary recruitment');
  assert.deepEqual(result.early,{shown:true,eligible:false},
    'a petition cannot precede the three-year waiting period');
  assert.equal(result.eligible,true,'a documented discharge opens individual military review');
  assert.deepEqual(result.denied,{
    job:0,canApply:false,hearingAgain:false,status:'left'
  },'review refusal gives no rank or job and observes cooldown');
  assert.equal(result.later,true,'the former soldier may reapply for a hearing in three years');
  assert.equal(result.paused,'paused',
    'a later hearing does not itself complete the post-expulsion livelihood goal');
  assert.deepEqual(result.cleared,{
    job:0,oldStatus:'left',oldGoal:'abandoned',civilianGoal:'paused',
    canApply:true,reviewOnceMore:false,episodes:1,issues:[]
  },'an approved review restores eligibility, not military employment');
  assert.deepEqual(result.again,{
    job:c.job,status:'active',episodes:2,firstEnded:1094,
    newStarted:1100,oldGoal:'active',pausedCivilian:'paused',
    duty:true,hearing:false,followup:false,
    choices:[false,false,false,false,true],issues:[]
  },'a separate successful enlistment restarts work without deleting the discharge');
  assert.equal(result.afterReady,true,
    'the formerly dismissed recruit can settle the old livelihood goal after its genuine three-year cooldown');
  assert.deepEqual(result.settled,{
    job:c.job,goal:'achieved',action:'complete',oldGoal:'active',
    originalMemory:1,employmentEpisodes:2,afterShown:false,issues:[]
  },'an explicitly chosen livelihood settlement closes the old post-dismissal goal');
}
// Positive-looking hearing results alone cannot restore an undocumented position.
for(const c of [
  {entry:'car_urs_officer_entry',incident:'car_urs_officer_choice_purge',
    hearing:'car_urs_officer_disciplinary_review'},
  {entry:'car_urs_guard_entry',incident:'car_urs_guard_choice_riot',
    hearing:'car_urs_guard_disciplinary_review'}
]){
  start('ウルサス');ctx.URS_PHANTOM=c;
  const bad=snap(`
    const c=URS_PHANTOM;
    S.year=1101;S.age=33;S.by=1068;S.cr=90;S.k=90;S.h=90;
    S.eventOutcomes={
      [c.incident]:{year:1094,choiceIndex:1,outcomeIndex:0},
      [c.hearing]:{year:1100,choiceIndex:0,outcomeIndex:0}
    };
    S.sn[c.incident]=1094;S.sn[c.hearing]=1100;
    const hiring=EV.find(x=>x.id===c.entry),
      review=EV.find(x=>x.id===c.hearing);
    return {hire:hiring.show(S),review:elig(review,S,tags(S))};
  `);
  assert.deepEqual(bad,{hire:false,review:false},
    'outcome logs without a previous employer cannot invent exceptional reinstatement');
}


// All distinctive employer losses previously expressed only as job:0 now have
// an ended posting, an abandoned old career goal and actual later hiring.
const jobLossCases=[
  {region:'炎国',entry:'car_yan_court_entry',
    trigger:'car_yan_court_choice_bribe',choice:1,outcome:1,
    review:'car_yan_court_after_dismissal',former:'yan-court-bureaucracy',
    oldGoal:'yan-governance',next:'yan-dismissed-clerk-livelihood',
    oldJob:41,custody:false},
  {region:'龍門',entry:'car_lmd_black_entry',
    trigger:'car_lmd_black_choice_big_deal',choice:0,outcome:1,
    review:'car_lmd_black_after_detention',former:'lungmen-black-market',
    oldGoal:'lmd-underground-deals',next:'lungmen-post-custody-livelihood',
    oldJob:45,custody:true},
  {region:'クルビア',entry:'car_col_pioneer_entry',
    trigger:'car_col_pioneer_choice_bandits',choice:1,outcome:0,
    review:'car_col_pioneer_after_dispossession',former:'columbia-frontier-pioneer',
    oldGoal:'columbia-frontier-survival',next:'columbia-dispossessed-pioneer-livelihood',
    oldJob:62,custody:false}
];
for(const c of jobLossCases){
  start(c.region);
  ctx.JOB_LOSS_CASE=c;
  const result=snap(`
    const c=JOB_LOSS_CASE,
      entry=EV.find(e=>e.id===c.entry),
      loss=EV.find(e=>e.id===c.trigger),
      review=EV.find(e=>e.id===c.review),
      civilian=EV.find(e=>e.id==='work_unemployed_reentry'),
      detention=EV.find(e=>e.id==='detain_life');
    if(!entry||!loss||!review||!civilian||!detention)
      throw Error('Incomplete lost-job review path '+c.trigger);
    S.year=1098;S.age=24;S.by=1074;S.mo=4;S.k=100;S.h=100;S.cr=100;
    S.cash=10000000;S.house.cash=10000000;
    const firstOffer=elig(entry,S,tags(S));
    ap(entry.c[0].o[0][2]);
    const old=S.lifeRecord.affiliations.find(a=>a.id===c.former),
      oldGoal=S.lifeRecord.goals.find(g=>g.id===c.oldGoal);
    const originalJob=S.job,onDuty=loss.show(S);
    ap(loss.c[c.choice].o[c.outcome][2]);
    S.sn[loss.id]=S.year;
    S.eventOutcomes ||={};
    S.eventOutcomes[loss.id]={year:S.year,choiceIndex:c.choice,outcomeIndex:c.outcome};
    const next=S.lifeRecord.goals.find(g=>g.id===c.next);
    const lost={job:S.job,former:old.status,end:old.episodes.at(-1)?.endedYear,
      goal:oldGoal.status,next:next?.status,detained:!!S.fl.detained,
      duty:loss.show(S),review:elig(review,S,tags(S)),
      issues:auditLifeState(S)};
    S.year+=1;S.age+=1;
    const premature=elig(review,S,tags(S));
    S.year+=1;S.age+=1;
    const inCustody={detained:!!S.fl.detained,eligible:elig(review,S,tags(S))};
    if(c.custody){
      ap(detention.c[1].o[0][2]);
      ap(detention.c[2].o[0][2]);
    }
    const ready={eligible:elig(review,S,tags(S)),
      choices:review.c.map(q=>q.show(S,tags(S))),
      detentionCleared:!S.fl.detained};
    ap(review.c[0].o[0][2]);
    S.sn[review.id]=S.year;
    const seeking={job:S.job,status:next.status,action:next.history.at(-1)?.action,
      repeat:elig(review,S,tags(S))};
    S.year+=3;S.age+=3;
    ap(review.c[1].o[0][2]);
    S.sn[review.id]=S.year;
    const paused=next.status;
    const workOpen=elig(civilian,S,tags(S));
    ap(civilian.c[0].o[0][2]);
    S.year+=3;S.age+=3;
    const employed={job:S.job,former:old.status,formerGoal:oldGoal.status,
      nextGoal:next.status,eligible:elig(review,S,tags(S)),
      choices:review.c.map(q=>q.show(S,tags(S)))};
    ap(review.c[2].o[0][2]);
    const completed={job:S.job,next:next.status,old:old.status,
      formerGoal:oldGoal.status,history:next.history.map(e=>e.action),
      eligible:elig(review,S,tags(S)),issues:auditLifeState(S)};
    return{firstOffer,originalJob,onDuty,lost,premature,inCustody,ready,
      seeking,paused,workOpen,employed,completed};
  `);
  assert.equal(result.firstOffer,true,c.entry+' must be real, permitted hiring');
  assert.equal(result.originalJob,c.oldJob);
  assert.equal(result.onDuty,true,c.trigger+' must describe actual active career');
  assert.deepEqual(result.lost,{
    job:0,former:'left',end:1098,goal:'abandoned',
    next:'active',detained:c.custody,duty:false,review:false,issues:[]
  },c.trigger+' closes former employment and opens an independent livelihood goal');
  assert.equal(result.premature,false,'loss cannot generate review after one year');
  assert.deepEqual(result.inCustody,{
    detained:c.custody,eligible:!c.custody
  },'a prisoner may not search for outside work while detained');
  assert.deepEqual(result.ready,{
    eligible:true,choices:[true,true,false],detentionCleared:true
  },'after two years and any release the owner can search or rest');
  assert.deepEqual(result.seeking,{
    job:0,status:'active',action:'continue',repeat:false
  },'searching cannot invent employment');
  assert.equal(result.paused,'paused');
  assert.equal(result.workOpen,true,'an actual general reemployment offer is available');
  assert.deepEqual(result.employed,{
    job:1,former:'left',formerGoal:'abandoned',nextGoal:'paused',
    eligible:true,choices:[false,false,true]
  },'independent paid work opens an optional livelihood settlement');
  assert.deepEqual(result.completed,{
    job:1,next:'achieved',old:'left',formerGoal:'abandoned',
    history:['start','continue','pause','complete'],eligible:false,issues:[]
  },'goal completion leaves the old loss episode intact and makes review terminal');
}
// A recorded choice with no real former membership/goal cannot create a review.
for(const c of jobLossCases){
  start(c.region);ctx.FAKE_JOB_LOSS_CASE=c;
  const falsePath=snap(`
    const c=FAKE_JOB_LOSS_CASE,
      e=EV.find(x=>x.id===c.review);
    S.year=1101;S.age=27;S.by=1074;
    S.sn[c.trigger]=1098;
    S.eventOutcomes={[c.trigger]:{year:1098,choiceIndex:c.choice,outcomeIndex:c.outcome}};
    return{shown:e.show(S),eligible:elig(e,S,tags(S))};
  `);
  assert.deepEqual(falsePath,{shown:false,eligible:false},
    c.review+' requires a genuine terminated affiliation and active new goal');
}
// Reopening a pioneer farm is a distinct hiring episode, not a revival of
// a previously seized property. A job ID alone is insufficient.
start('クルビア');
const pioneerReturn=snap(`
  S.year=1098;S.age=24;S.by=1074;S.k=100;S.h=100;S.cr=100;S.mo=6;
  const entry=EV.find(x=>x.id==='car_col_pioneer_entry'),
    loss=EV.find(x=>x.id==='car_col_pioneer_choice_bandits'),
    followup=EV.find(x=>x.id==='car_col_pioneer_after_dispossession');
  ap(entry.c[0].o[0][2]);
  ap(loss.c[1].o[0][2]);
  S.sn[loss.id]=S.year;
  S.eventOutcomes={[loss.id]:{year:S.year,choiceIndex:1,outcomeIndex:0}};
  S.year=1101;S.age=27;
  const former=S.lifeRecord.affiliations.find(a=>a.id==='columbia-frontier-pioneer');
  const canHire=entry.show(S);
  ap(entry.c[0].o[0][2]);
  const legit={job:S.job,episodes:former.episodes.length,
    firstEnd:former.episodes[0].endedYear,
    secondStart:former.episodes.at(-1)?.startedYear,
    choices:followup.c.map(c=>c.show(S,tags(S)))};
  return{canHire,legit};
`);
assert.deepEqual(pioneerReturn,{
  canHire:true,legit:{job:62,episodes:2,firstEnd:1098,
    secondStart:1101,choices:[false,false,true]}
},'a separately obtained second farm can settle the first dispossession livelihood goal');


// A paid company camp and a farmer cultivating private land share job 62 but
// have different employers, career goals and actual on-duty obligations.
for(const choiceIndex of [0,1]){
 for(const outcomeIndex of [0,1]){
  start('クルビア');
  ctx.FRONTIER_CASE={choiceIndex,outcomeIndex};
  const result=snap(`
    const cfg=FRONTIER_CASE,
      offer=EV.find(e=>e.id==='col_frontier'),
      farmDuty=EV.find(e=>e.id==='car_col_pioneer_daily_01'),
      campReview=EV.find(e=>e.id==='col_frontier_contract_review'),
      after=EV.find(e=>e.id==='col_frontier_after_contract_loss'),
      generic=EV.find(e=>e.id==='work_unemployed_reentry');
    S.year=1098;S.age=24;S.by=1074;S.h=100;S.k=100;
    S.debt=cfg.choiceIndex===0?2000000:0;
    S.fl.frontier_contract=0;
    const offered=elig(offer,S,tags(S));
    ap(offer.c[cfg.choiceIndex].o[cfg.outcomeIndex][2]);
    S.sn[offer.id]=S.year;
    S.eventOutcomes={[offer.id]:{
      year:S.year,choiceIndex:cfg.choiceIndex,outcomeIndex:cfg.outcomeIndex
    }};
    const a=S.lifeRecord.affiliations.find(r=>r.id==='columbia-frontier-contract-crew'),
      g=S.lifeRecord.goals.find(r=>r.id==='columbia-frontier-contract-work'),
      next=S.lifeRecord.goals.find(r=>r.id==='columbia-frontier-camp-next-livelihood');
    const initial={job:S.job,employer:a?.status,episodes:a?.episodes.length,
      ended:a?.episodes.at(-1)?.endedYear??null,goal:g?.status,
      next:next?.status??null,
      farmDuty:farmDuty.show(S),
      companyWork:$rules.affiliations.canWork(S,'columbia-frontier-contract-crew'),
      campReview:elig(campReview,S,tags(S)),issues:auditLifeState(S)};
    S.year=1100;S.age=26;
    const eligibleReview=elig(campReview,S,tags(S)),
      eligibleRecovery=elig(after,S,tags(S));
    let continued=null,departed=null;
    if(cfg.outcomeIndex===0){
      ap(campReview.c[0].o[0][2]);
      S.sn[campReview.id]=S.year;
      continued={employer:a.status,goal:g.status,job:S.job,
        cooldown:elig(campReview,S,tags(S))};
      S.year+=3;S.age+=3;
      ap(campReview.c[1].o[0][2]);
      S.sn[campReview.id]=S.year;
      departed={job:S.job,employer:a.status,formerGoal:g.status,
        next:S.lifeRecord.goals.find(r=>r.id==='columbia-frontier-camp-next-livelihood')?.status,
        ended:a.episodes.at(-1)?.endedYear,
        oldDuty:farmDuty.show(S),issues:auditLifeState(S)};
    }
    const ready=elig(after,S,tags(S));
    const target=S.lifeRecord.goals.find(r=>r.id==='columbia-frontier-camp-next-livelihood');
    const choices=after.c.map(x=>x.show(S,tags(S)));
    ap(after.c[0].o[0][2]);
    S.sn[after.id]=S.year;
    const seeking={job:S.job,goal:target.status,
      action:target.history.at(-1)?.action,
      cooldown:elig(after,S,tags(S))};
    S.year+=3;S.age+=3;
    ap(after.c[1].o[0][2]);
    S.sn[after.id]=S.year;
    const paused=target.status;
    const genericOpen=elig(generic,S,tags(S));
    ap(generic.c[0].o[0][2]);
    S.year+=3;S.age+=3;
    const employed={job:S.job,employer:a.status,
      goal:target.status,choices:after.c.map(x=>x.show(S,tags(S)))};
    ap(after.c[2].o[0][2]);
    const achieved={job:S.job,goal:target.status,
      history:target.history.map(x=>x.action),
      former:a.status,formerEpisodes:a.episodes.length,
      review:after.show(S),issues:auditLifeState(S)};
    return {offered,initial,eligibleReview,eligibleRecovery,continued,
      departed,ready,choices,seeking,paused,genericOpen,employed,achieved};
  `);
  assert.equal(result.offered,true);
  assert.deepEqual(result.initial,{
    job:outcomeIndex===0?62:0,employer:outcomeIndex===0?'active':'left',
    episodes:1,ended:outcomeIndex===0?null:1098,
    goal:outcomeIndex===0?'active':'abandoned',
    next:outcomeIndex===0?null:'active',
    farmDuty:false,companyWork:outcomeIndex===0,campReview:false,issues:[]
  },'generic frontier recruiter must never create an independent farmer appointment');
  assert.equal(result.eligibleReview,outcomeIndex===0);
  assert.equal(result.eligibleRecovery,outcomeIndex===1);
  if(outcomeIndex===0){
    assert.deepEqual(result.continued,{
      employer:'active',goal:'active',job:62,cooldown:false
    },'ongoing company work is retained without a new hire');
    assert.deepEqual(result.departed,{
      job:0,employer:'left',formerGoal:'abandoned',
      next:'active',ended:1103,oldDuty:false,issues:[]
    },'a voluntary camp resignation closes company work and opens a livelihood goal');
  }else{
    assert.equal(result.continued,null);
    assert.equal(result.departed,null);
  }
  assert.equal(result.ready,true);
  assert.deepEqual(result.choices,[true,true,false]);
  assert.deepEqual(result.seeking,{
    job:0,goal:'active',action:'continue',cooldown:false
  });
  assert.equal(result.paused,'paused');
  assert.equal(result.genericOpen,true);
  assert.deepEqual(result.employed,{
    job:1,employer:'left',goal:'paused',choices:[false,false,true]
  });
  assert.deepEqual(result.achieved,{
    job:1,goal:'achieved',
    history:['start','continue','pause','complete'],
    former:'left',formerEpisodes:1,review:false,issues:[]
  },'a short failed camp contract and a later voluntary exit each recover through real work');
 }
}
// The same occupation number is never enough for the independent farmer story.
start('クルビア');
const companyPhantom=snap(`
  S.year=1100;S.age=26;S.job=62;
  const camp=EV.find(e=>e.id==='col_frontier_contract_review'),
    farm=EV.find(e=>e.id==='car_col_pioneer_daily_01');
  return {camp:camp.show(S),farm:farm.show(S)};
`);
assert.deepEqual(companyPhantom,{camp:false,farm:false},
  'a job number without either company or farm membership cannot create duty');

console.log('PASS Aegir gate, non-Aegir route, custody-release, promotion history, once-only, after-outcome, 42 regional career duties, rehiring, expulsion Victorian wartime/postwar exile and two Ursus military hearings, three explicit regional career losses and genuine later reemployment, two frontier company hiring and failure branches');
