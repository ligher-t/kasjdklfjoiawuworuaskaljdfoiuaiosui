'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
function verify(){
  const ids=["timeline_daily_bolivar_barricade","timeline_daily_great_silence_sea"];
  const records=ids.map(id=>EV.find(e=>e.id===id));
  const context=[];
  for(const [id,region,year,month,elsewhere] of [
    [ids[0],"ボリバル",1049,6,"カジミエーシュ"],
    [ids[1],"イベリア",1038,7,"ヴィクトリア"]
  ]){
    born({seed:year*25+month,by:year-32,region});
    S.year=year;S.mo=month;S.age=32;
    S.res=REG.find(r=>r.n===region);
    S.world.events[EV.find(e=>e.id===id).timelineFlag]=year;
    const event=EV.find(e=>e.id===id);
    const local=historicalSceneEligibility(event,S);
    const eligibleLocal=elig(event,S,tags(S));
    const beforeNews=JSON.stringify(S.historicalDirectEncounters||{});
    S.res=REG.find(r=>r.n===elsewhere);
    const remote=historicalSceneEligibility(event,S);
    const eligibleRemote=elig(event,S,tags(S));
    S.res=REG.find(r=>r.n===region);
    S.mo=0;
    const beforeMonth=historicalSceneEligibility(event,S);
    if(id===ids[1]){
      S.mo=6;
      const early=historicalSceneEligibility(event,S);
      context.push({id,local,eligibleLocal,remote,eligibleRemote,beforeMonth,early,
        beforeNews,afterNews:JSON.stringify(S.historicalDirectEncounters||{}),
        prose:event.t,confidence:event.conf,scene:event.historicalScene});
    } else context.push({id,local,eligibleLocal,remote,eligibleRemote,beforeMonth,
      beforeNews,afterNews:JSON.stringify(S.historicalDirectEncounters||{}),
      prose:event.t,confidence:event.conf,scene:event.historicalScene});
  }
  return {contexts:context,count:EV.filter(e=>e.id.startsWith("timeline_")).length};
}
const result=JSON.parse(vm.runInContext('JSON.stringify(('+verify.toString()+')())',ctx,{timeout:30000}));
assert.equal(result.count,40);
for(const x of result.contexts){
  assert.equal(x.confidence,"S");
  assert.equal(x.scene.delivery,"area-impact");
  assert.equal(x.local.eligible,true,x.id);
  assert.equal(x.eligibleLocal,true,x.id);
  assert.equal(x.remote.eligible,false,x.id);
  assert.equal(x.eligibleRemote,false,x.id);
  if(x.id==="timeline_daily_great_silence_sea")
    assert.equal(x.beforeMonth.eligible,false,x.id);
  else assert.equal(x.beforeMonth.eligible,true,"the year after the event has begun");
  assert.equal(x.beforeNews,x.afterNews);
  assert(!/土嚢|砂浜/.test(x.prose));
}
assert.equal(result.contexts[1].early.eligible,false);
console.log("PASS: two regional history impacts without fabricated on-site witnessing");
