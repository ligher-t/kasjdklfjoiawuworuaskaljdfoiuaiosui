'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const read=source=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx,{timeout:30000}));
const result=read(`
 born({seed:160148,by:1049,region:'カジミエーシュ'});
 S.year=1097;S.age=48;S.mo=8;
 S.res=REG.find(x=>x.n==='カジミエーシュ');
 S.local={kind:'固定都市の街区',city:'カヴァレリエルキ'};
 S.home='固定都市の街区';S.world={events:{kazimierz_major:1097}};
 S.educationDecision=null;S.majorEventMonth=null;
 S.romance={id:'romance-a',name:'相手A',stage:'known',metYear:1089,stageSinceYear:1089};
 S.sn.lov=1094;S.eventOutcomes={lov:{year:1094,choiceIndex:0,outcomeIndex:0,romanceId:'romance-a'}};
 const actual=EV.find(e=>e.id==='romance_followup');
 const choice=()=>[{l:'選択する',o:[[1,'結果を確認した',{}]]}];
 const history={id:'test_historical_1097',st:['壮年'],timelineFlag:'kazimierz_major',historicalScene:EV.find(e=>e.id==='timeline_kazimierz_major').historicalScene,c:choice(),w:1};
 const ageLimited={id:'test_age_cap_choice',st:['壮年'],le:{age:48},c:choice(),w:1};
 const yearLimited={id:'test_year_cap_choice',st:['壮年'],le:{year:1097},c:choice(),w:1};
 const source=EV.slice(),oldFire=fire,selected=[];
 const eligNow=[actual,ageLimited,yearLimited,history].map(e=>elig(e,S,tags(S)));
 const firstPriority=nextExpiringFollowup([ageLimited,yearLimited,actual],S)?.id;
 const tick=(month,events)=>{EV.splice(0,EV.length,...events);slot((month-0.5)/12);};
 try {
   fire=(e,s)=>{
     selected.push({month:s.mo,id:e.id});
     s.sn[e.id]=s.year;
     s.majorEventMonth={year:s.year,month:s.mo};
   };
   for(let month=8;month<=11;month++)
     tick(month,[history,yearLimited,ageLimited,actual]);
   S.year=1098;S.age=49;S.majorEventMonth=null;
   delete S.sn[actual.id];delete S.sn[ageLimited.id];delete S.sn[yearLimited.id];
   const afterAge=[actual,ageLimited,yearLimited].map(e=>elig(e,S,tags(S)));
   const afterPriority=nextExpiringFollowup([actual,ageLimited,yearLimited],S);
   return {eligibleNow:eligNow,firstPriority,selected,eligibleNextYear:afterAge,afterPriority:afterPriority?.id||null};
 }finally{fire=oldFire;EV.splice(0,EV.length,...source);}
`);
assert.deepEqual(result.eligibleNow,[true,true,true,true],
  'real romance and other bounded choices must all be eligible in the final year');
assert.equal(result.firstPriority,'romance_followup',
  'an age-48 romance followup is expiring despite having remaining after.max years');
assert.deepEqual(result.selected,[
 {month:8,id:'romance_followup'},
 {month:9,id:'test_age_cap_choice'},
 {month:10,id:'test_year_cap_choice'},
 {month:11,id:'test_historical_1097'}
],'all three final-year choices receive distinct monthly slots before the historical fallback');
assert.deepEqual(result.eligibleNextYear,[false,false,false],
 'age and calendar-year boundaries prevent late arrivals even without recorded completion');
assert.equal(result.afterPriority,null,'ineligible expired events are not injected into priority selection');
const ordering=read(`
 S.year=1097;S.age=48;S.sn={older:1094,newer:1096};
 const older={id:'z-older',after:{id:'older',min:1,max:6},le:{age:48}};
 const newer={id:'a-newer',after:{id:'newer',min:1,max:5},le:{age:48}};
 const candidate=nextExpiringFollowup([newer,older],S)?.id;
 S.sn.older=1094;S.sn.newer=1094;
 const stable=nextExpiringFollowup([newer,older],S)?.id;
 return {candidate,stable};
`);
assert.equal(ordering.candidate,'z-older',
 'earlier opening opportunity wins when both choices have the same final year');
assert.equal(ordering.stable,'a-newer',
 'equal opening opportunities use a stable identifier for tie-breaking');
console.log('PASS year and age caps, simultaneous final-year choices, next-year expiry');
