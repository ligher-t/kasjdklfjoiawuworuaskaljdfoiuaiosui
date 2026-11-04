const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {ctx}=require('./support/annual-cases.cjs').context(path.resolve(__dirname,'..'));
const run=s=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+s+'})())',ctx));
for(let i=0;i<5;i++){
 ctx.VARIANT=i;
 const result=run(`born({seed:81211,by:1077,region:'ウルサス'});S.year=1083;S.age=6;S.mo=0;
 const p=S.par.fa;p.inf=1;p.d=1083;p.dead=true;p.deathCause='病死（鉱石病）';p.deathKnownYear=1083;
 S.par.mo.inf=0;const old=DEBUG_RANDOM;DEBUG_RANDOM=()=>VARIANT/5+0.01;
 const first=notifyParentOripathyDeath(S,p,'fa'),again=notifyParentOripathyDeath(S,p,'fa');DEBUG_RANDOM=old;
 const living=EV.find(e=>e.id==='bias_family_infected_parent_solidarity'),dead=EV.find(e=>e.id==='bias_family_infected_parent_memory');
 return {first,again,id:p.oripathyDeathNotice.eventId,year:p.oripathyDeathNotice.notifiedYear,
 living:elig(living,S,tags(S)),dead:elig(dead,S,tags(S)),infected:!!S.inf,diagnosed:!!S.fl.dg};`);
 assert.equal(result.first,true);assert.equal(result.again,false);
 assert.equal(result.id,'parent_oripathy_death_'+(i+1));assert.equal(result.year,1083);
 assert.equal(result.living,false);assert.equal(result.dead,true);
 if(i!==2)assert.equal(result.infected,false);
 assert.equal(result.diagnosed,false);
}
assert.deepEqual(run(`born({seed:81212,by:1077,region:'ウルサス'});S.year=1083;S.age=6;
 const p=S.par.fa;p.inf=1;p.health=0;p.healthUpdatedYear=1082;p.tx=0;p.d=0;
 const old=spouseMortalityRisk;spouseMortalityRisk=()=>({risk:1,cause:'病死（鉱石病）'});
 try{advanceParentWorkLives(S);}finally{spouseMortalityRisk=old;}
 const notice=p.oripathyDeathNotice;advanceParentWorkLives(S);
 return {d:p.d,notice:notice===p.oripathyDeathNotice,year:notice.notifiedYear};`),{d:1083,notice:true,year:1083});
assert.deepEqual(run(`born({seed:81213,by:1077,region:'ウルサス'});S.year=1087;S.age=10;S.par.fa.inf=1;S.par.fa.d=0;
 S.par.mo.inf=1;S.par.mo.d=1083;S.par.mo.deathKnownYear=1083;
 return {alive:elig(EV.find(e=>e.id==='bias_family_infected_parent_solidarity'),S,tags(S)),
 dead:elig(EV.find(e=>e.id==='bias_family_infected_parent_memory'),S,tags(S))};`),{alive:true,dead:false});
assert.deepEqual(run(`born({seed:81214,by:1077,region:'ウルサス'});S.year=1083;S.age=6;S.inf=0;S.fl.dg=0;
 const p=S.par.fa;Object.assign(p,{inf:1,d:1083,separated:false,deathCause:'病死（鉱石病）'});
 const old=DEBUG_RANDOM;let draw=0;DEBUG_RANDOM=()=>draw++===0?0.41:0.01;
 try{notifyParentOripathyDeath(S,p,'fa');}finally{DEBUG_RANDOM=old;}
 return {infected:!!S.inf,route:S.oripathy?.route||S.infection?.basis,diagnosed:!!S.fl.dg};`),
 {infected:true,route:'event-recorded',diagnosed:false});
assert.deepEqual(run('return validate();'),[]);
console.log('PASS immediate parent mortality notice, five variants, deduplication, actual dust infection and living/dead parent scenes');
