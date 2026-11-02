'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=body=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+body+'})())',ctx,{timeout:30000}));

const sampling=inspect(`
 born({seed:186071,by:1060,region:'ヴィクトリア'});
 S.age=38;
 const count=480,rows=[],previous=[];
 const ceiling=P('events.slotPlacementCeiling'),range=P('events.adultSlots');
 for(let i=0;i<count;i++){
   sched();
   const months=S.q.map(pos=>Math.floor(pos*CALENDAR_MONTHS)+1);
   if(months.length===6) rows.push(months);
   previous.push({n:months.length,unique:new Set(months).size,
     sorted:S.q.every((pos,index)=>index===0||pos>S.q[index-1]),
     within:S.q.every(pos=>pos>=0&&pos<ceiling)});
 }
 const oldSix=rows.map(()=>Array.from({length:6},()=>Math.floor(R()*ceiling*CALENDAR_MONTHS)+1));
 return {count,range,allUnique:previous.every(x=>x.n===x.unique),
   sorted:previous.every(x=>x.sorted),within:previous.every(x=>x.within),
   sixSlotSchedules:rows.length,oldCollisions:oldSix.filter(ms=>new Set(ms).size<6).length};
`);
assert(sampling.allUnique&&sampling.sorted&&sampling.within,
 'all schedules have distinct chronological calendar months within the configured year');
assert(sampling.sixSlotSchedules>40,'stress sample must include many six-slot years');
assert(sampling.oldCollisions>sampling.sixSlotSchedules/2,
 'unrestricted independent placements lose a majority of six-slot monthly capacities');

const overload=inspect(`
 born({seed:186072,by:1060,region:'ヴィクトリア'});
 S.year=1098;S.age=38;S.mo=0;
 S.educationDecision=null;S.majorEventMonth=null;
 S.world={events:{}};
 const events=Array.from({length:8},(_,i)=>({
   id:'deadline_capacity_'+i,st:['壮年'],after:{id:'seed_capacity_'+i,min:1,max:3},
   c:[{l:'返答する',o:[[1,'確認する',{}]]}],w:1
 }));
 const original=EV.slice(),previousFire=fire,selected=[],queueSnapshots=[];
 for(let i=0;i<events.length;i++)S.sn['seed_capacity_'+i]=1095;
 S.q=[(2-0.5)/CALENDAR_MONTHS,(8-0.5)/CALENDAR_MONTHS];
 try{
   EV.splice(0,EV.length,...events);
   fire=(event,s)=>{selected.push({id:event.id,month:s.mo});s.sn[event.id]=s.year;
     s.majorEventMonth={year:s.year,month:s.mo};};
   const q=S.q.shift();slot(q);
   queueSnapshots.push({month:S.mo,remaining:S.q.length,unique:new Set(S.q.map(pos=>Math.floor(pos*CALENDAR_MONTHS)+1)).size});
   while(S.q.length){
     const next=S.q.shift();slot(next);
     queueSnapshots.push({month:S.mo,remaining:S.q.length});
   }
   const delivered=selected.slice();
   // Near the end of the year, no new calendar months beyond December exist.
   selected.length=0;S.year=1098;S.age=38;S.majorEventMonth=null;
   for(const event of events)delete S.sn[event.id];
   S.q=[(11-0.5)/CALENDAR_MONTHS];
   while(S.q.length){const next=S.q.shift();slot(next);}
   return {delivered,queueSnapshots,
     lateDelivered:selected.slice(),endMonth:S.mo,year:S.year,queue:S.q.slice()};
 }finally{fire=previousFire;EV.splice(0,EV.length,...original);}
`);
assert.equal(overload.queueSnapshots[0].remaining,7,
 'eight expiring choices produce six additional months beyond the one remaining regular slot');
assert.equal(overload.queueSnapshots[0].unique,7,'all future reserved months are distinct');
assert.equal(overload.delivered.length,8,'all eight actionable expiring events get one slot');
assert.equal(new Set(overload.delivered.map(x=>x.month)).size,8,
 'monthly major-choice limit is retained for every completion');
assert.equal(overload.delivered[0].month,2);
assert.equal(overload.delivered.at(-1).month,9);
assert.equal(overload.lateDelivered.length,2,
 'one November event can reserve December, but cannot manufacture earlier months');
assert.deepEqual(overload.queue,[],'no overflow survives into the next calendar year');
assert.equal(overload.year,1098,'all reserved opportunities occur before the annual transition');
const mixed=inspect(`
 born({seed:186073,by:1060,region:'ヴィクトリア'});
 S.year=1098;S.age=38;S.mo=0;
 S.educationDecision={kind:'upper-path'};
 S.infectionWorkplace={reviewDueYear:1098};
 S.majorEventMonth=null;
 S.world={events:{}};
 const regular=Array.from({length:6},(_,i)=>({
   id:'mixed_deadline_'+i,st:['壮年'],
   after:{id:'mixed_seed_'+i,min:1,max:3},
   c:[{l:'結論を決める',o:[[1,'決定を記録する',{}]]}],w:1
 }));
 const school={id:'education_upper_path',st:['壮年'],c:[{l:'進路を決める',o:[[1,'進路を決めた',{}]]}]};
 const medical={id:'infection_workplace_review',st:['壮年'],c:[{l:'再検査を行う',o:[[1,'再検査を終えた',{}]]}]};
 for(let i=0;i<regular.length;i++)S.sn['mixed_seed_'+i]=1095;
 const original=EV.slice(),previousFire=fire,selected=[];
 S.q=[(2-0.5)/CALENDAR_MONTHS,(8-0.5)/CALENDAR_MONTHS];
 try{
   EV.splice(0,EV.length,...regular,medical,school);
   fire=(e,s)=>{
     selected.push({id:e.id,month:s.mo});
     s.sn[e.id]=s.year;
     s.majorEventMonth={year:s.year,month:s.mo};
     if(e.id===school.id)s.educationDecision=null;
     if(e.id===medical.id)s.infectionWorkplace.reviewDueYear=1099;
   };
   while(S.q.length)slot(S.q.shift());
   return {selected,pending:regular.filter(e=>S.sn[e.id]!==1098).map(e=>e.id)};
 }finally{fire=previousFire;EV.splice(0,EV.length,...original);}
`);
assert.equal(mixed.selected.length,8,'school, medical and six final-year choices all receive slots');
assert.equal(mixed.selected[0].id,'education_upper_path','mandatory schooling remains first');
assert.equal(mixed.selected[1].id,'infection_workplace_review','due medical review follows school');
assert.deepEqual(mixed.pending,[],'all expiring events survive school and medical priority');
assert.equal(new Set(mixed.selected.map(x=>x.month)).size,8,
 'competing compulsory choices cannot consume two slots from the same month');

console.log(JSON.stringify({passed:true,scheduleSamples:sampling.count,
 sixSlotSchedules:sampling.sixSlotSchedules,oldCollisionSamples:sampling.oldCollisions,
 newCollisionSamples:0,highPressureDelivered:overload.delivered.length,
 lateYearDelivered:overload.lateDelivered.length}));
