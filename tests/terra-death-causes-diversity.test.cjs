'use strict';
const path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {context}=require('./support/presentation-cases.cjs');
const {installEmploymentAppointmentFixture}=require('./support/employment-appointment-fixture.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
installEmploymentAppointmentFixture(ctx);
const run=source=>JSON.parse(vm.runInContext(`JSON.stringify((()=>{${source}})())`,ctx));
const crisis=run(`
 born({seed:41125,by:1080,region:'龍門'});
 S.year=1097;S.age=17;S.p=10;S.h=90;S.inf=0;S.ob=0;S.cash=200000;S.debt=0;S.sp=null;
 S.mortality={episodes:[],crisis:{status:'none',years:0}};
 const before=D(S).filter(x=>x.c.startsWith('自死'));
 advanceMortalityState(S);
 const firstYear=D(S).filter(x=>x.c.startsWith('自死'));
 S.year++;S.age++;advanceMortalityState(S);
 const persistent=D(S).filter(x=>x.c.startsWith('自死'));
 const event=EV.find(e=>e.id==='life_terminal_despair_choice'),eligible=elig(event,S,tags(S));
 const text=txt(event,S,tags(S));
 const saved=makeResumeSnapshot();
 ap(event.c[0].o[0][2]);
 const supported={status:S.mortality.crisis.status,until:S.mortality.crisis.supportedUntilYear,
   risk:D(S).filter(x=>x.c.startsWith('自死')),eventEligible:elig(event,S,tags(S))};
 if(!cont(saved))throw Error('crisis snapshot failed to resume');
 ap(event.c[2].o[0][2]);
 const rested={dead:!!S.dead,until:S.mortality.crisis.supportedUntilYear,risk:D(S).find(x=>x.c==='自死')?.p};
 if(!cont(saved))throw Error('crisis snapshot failed to resume');
 ap(event.c[1].o[0][2]);
 const chosenDeath={dead:S.dead,category:S.dc,text:S.dl,origin:S.deathProcess.originKind};
 return {parentsAlive:[saved.S.par.fa,saved.S.par.mo].every(p=>!p.d),before,firstYear,persistent,eligible,text,supported,rested,chosenDeath};
`);
assert.equal(crisis.parentsAlive,true);assert.deepEqual(crisis.before,[]);assert.deepEqual(crisis.firstYear,[]);
assert.equal(crisis.persistent.length,1);assert.equal(crisis.persistent[0].c,'自死');assert(crisis.persistent[0].p>0);
assert.equal(crisis.eligible,true);assert.doesNotMatch(crisis.text,/家族も財産もすべて失|病の激痛|返せぬ負債/);
assert.equal(crisis.supported.status,'recovering');assert(crisis.supported.until>1098);
assert.deepEqual(crisis.supported.risk,[]);assert.equal(crisis.supported.eventEligible,false);
assert.equal(crisis.rested.dead,false);assert(crisis.rested.until>1098);assert(crisis.rested.risk<crisis.persistent[0].p);
assert.equal(crisis.chosenDeath.dead,1);assert.equal(crisis.chosenDeath.category,'自死');
assert.doesNotMatch(crisis.chosenDeath.text,/激痛|家族|負債|すべてを失/);

const medical=run(`
 born({seed:107701,by:1077,region:'クルビア'});
 S.year=1100;S.age=23;S.job=0;S.h=75;S.cash=50000;
 for(const id of ['sr_rhodes_recruitment_contact','sr_rhodes_hiring_review','sr_rhodes_posting_review']){
   if(id==='sr_rhodes_hiring_review')applyEmploymentAppointmentFixture(id,28,'rhodes-staff',0,0);else ap(EV.find(e=>e.id===id).c[0].o[0][2]);S.year++;S.age++;
 }
 S.inf=1;S.ob=10;S.h=100;S.mortality={episodes:[]};
 const light=D(S).filter(x=>x.c.includes('看取り'));
 S.ob=90;S.h=15;
 S.mortality.episodes=[{id:'audit-oripathy',kind:'oripathy',status:'active',severity:4,startedYear:S.year-3,history:[]}];
 const severe=D(S).find(x=>x.c.includes('看取り'));
 S.fl.tx=1;S.mortality.episodes[0].careUntilYear=S.year+1;
 const cared=D(S).find(x=>x.c.includes('看取り'));
 S.inf=0;S.ob=0;S.fl.tx=0;S.mortality.episodes=[{id:'audit-circulatory',kind:'circulatory',status:'active',severity:4,startedYear:S.year-2,history:[]}];
 const chronic=D(S).find(x=>x.c.includes('看取り'));
 const all=D(S),originalRandom=DEBUG_RANDOM;
 // Select the chronic candidate through the production fin()->die() path.
 const total=all.reduce((sum,x)=>sum+x.p,0),index=all.findIndex(x=>x.episodeId===chronic.episodeId),
   target=(all.slice(0,index).reduce((sum,x)=>sum+x.p,0)+chronic.p/2)/total;
 let draw=0;
 try {DEBUG_RANDOM=()=>draw++===0?0:draw===2?target:.5;fin();}
 finally {DEBUG_RANDOM=originalRandom;}
 const death={dead:S.dead,category:S.dc,detail:S.deathProcess};
 const saved=makeResumeSnapshot();
 born({seed:41126,region:'龍門'});
 if(!cont(saved))throw Error('death record snapshot failed to resume');
 return {light,severe,cared,chronic,death,resumedEpisode:S.deathProcess.episodeId};
`);
assert.deepEqual(medical.light,[]);assert(medical.severe.p>0);assert.equal(medical.severe.episodeId,'audit-oripathy');
assert(medical.cared.p<medical.severe.p);assert.equal(medical.chronic.episodeId,'audit-circulatory');
assert.equal(medical.death.dead,1);assert.equal(medical.death.category,'病死（ロドス医療部での看取り）');
assert.equal(medical.death.detail.episodeId,'audit-circulatory');assert.equal(medical.death.detail.causeCode,'medical.rhodes_palliative_care');
assert.equal(medical.resumedEpisode,'audit-circulatory');
console.log('PASS crisis onset/duration/support/rest/choice and light/severe/cared medical risk through actual death and same-version resume');
