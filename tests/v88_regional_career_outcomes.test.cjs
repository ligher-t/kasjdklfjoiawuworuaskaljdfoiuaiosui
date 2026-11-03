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
    S.year+=3;S.age+=3;S.mo=4;
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
  assert.equal(result.employed.contract,true,career.id+' has actual work contract');
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
    S.eventOutcomes[c.incidentId]={year:S.year-3,choiceIndex:0,outcomeIndex:0};
    const loyal=e.show(S);
    S.eventOutcomes[c.incidentId]={year:S.year-3,choiceIndex:1,outcomeIndex:0};
    S.sn[c.incidentId]=S.year-3;
    const discharged={shown:e.show(S),eligible:elig(e,S,tags(S))};
    return {before,loyal,discharged};
  `);
  assert.equal(result.before,true,entryId+' ordinarily recruits');
  assert.equal(result.loyal,true,entryId+' prior non-resignation outcome is not a bar');
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

console.log('PASS Aegir gate, non-Aegir route, custody-release, promotion history, once-only, after-outcome, 42 regional career duties, rehiring and expulsion');
